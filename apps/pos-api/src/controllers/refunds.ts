import { Request, Response } from 'express';
import { refundRequestSchema } from '@football-ticketing/shared';
import pool from '../db';

export async function processRefund(req: Request, res: Response) {
  try {
    const validatedData = refundRequestSchema.parse(req.body);
    const { ticketId, nfcCardId, reason } = validatedData;
    const staffUserId = req.body.staffUserId; // From auth middleware
    
    let transactionId, amount;
    
    if (ticketId) {
      // Refund ticket
      const ticketResult = await pool.query(
        `SELECT t.*, tr.id as transaction_id, tr.amount
         FROM tickets t
         JOIN transactions tr ON tr.ticket_id = t.id
         WHERE t.id = $1 AND t.status = 'active'`,
        [ticketId]
      );
      
      if (ticketResult.rows.length === 0) {
        return res.status(404).json({ error: 'Ticket not found or already refunded' });
      }
      
      transactionId = ticketResult.rows[0].transaction_id;
      amount = parseFloat(ticketResult.rows[0].amount);
      
      await pool.query(
        'UPDATE tickets SET status = $1 WHERE id = $2',
        ['refunded', ticketId]
      );
    } else if (nfcCardId) {
      // Refund NFC deposit
      const cardResult = await pool.query(
        `SELECT nc.*, tr.id as transaction_id, tr.amount
         FROM nfc_cards nc
         JOIN transactions tr ON tr.nfc_card_id = nc.id
         WHERE nc.id = $1 AND nc.status = 'assigned' AND nc.deposit_paid = true`,
        [nfcCardId]
      );
      
      if (cardResult.rows.length === 0) {
        return res.status(404).json({ error: 'NFC card not found or deposit not paid' });
      }
      
      transactionId = cardResult.rows[0].transaction_id;
      amount = parseFloat(cardResult.rows[0].amount);
      
      await pool.query(
        `UPDATE nfc_cards
         SET status = 'available',
             assigned_to_user_id = NULL,
             deposit_paid = false,
             deposit_amount = NULL
         WHERE id = $1`,
        [nfcCardId]
      );
      
      // Update available cards count
      await pool.query(
        `UPDATE nfc_stock_config
         SET available_cards = available_cards + 1
         WHERE club_id = $1`,
        [cardResult.rows[0].club_id]
      );
    }
    
    // Create refund record
    const refundResult = await pool.query(
      `INSERT INTO refunds (transaction_id, ticket_id, nfc_card_id, amount, reason, status, processed_by_user_id)
       VALUES ($1, $2, $3, $4, $5, 'completed', $6)
       RETURNING *`,
      [transactionId, ticketId, nfcCardId, amount, reason, staffUserId]
    );
    
    res.json({ refund: refundResult.rows[0] });
  } catch (error: any) {
    console.error('Error processing refund:', error);
    res.status(400).json({ error: error.message || 'Refund processing failed' });
  }
}
