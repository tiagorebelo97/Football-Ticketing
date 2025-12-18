import { Request, Response } from 'express';
import { nfcCardAssignSchema } from '@football-ticketing/shared';
import pool from '../db';

export async function processPayment(req: Request, res: Response) {
  try {
    const { userId, matchId, amount, paymentMethod } = req.body;
    
    // Process payment logic here (Stripe integration)
    // Create transaction record
    
    res.json({ message: 'Payment processed successfully' });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
}

export async function assignNFC(req: Request, res: Response) {
  try {
    const validatedData = nfcCardAssignSchema.parse(req.body);
    const { cardUid, userId, depositAmount } = validatedData;
    
    // Check if card is available
    const cardCheck = await pool.query(
      'SELECT * FROM nfc_cards WHERE card_uid = $1 AND status = $2',
      [cardUid, 'available']
    );
    
    if (cardCheck.rows.length === 0) {
      return res.status(400).json({ error: 'NFC card not available' });
    }
    
    const card = cardCheck.rows[0];
    
    // Assign card to user
    await pool.query(
      `UPDATE nfc_cards
       SET status = 'assigned',
           assigned_to_user_id = $1,
           deposit_paid = true,
           deposit_amount = $2,
           assigned_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [userId, depositAmount, card.id]
    );
    
    // Create transaction record
    await pool.query(
      `INSERT INTO transactions (club_id, user_id, nfc_card_id, type, amount, status)
       VALUES ($1, $2, $3, 'nfc_assignment', $4, 'completed')`,
      [card.club_id, userId, card.id, depositAmount]
    );
    
    // Update available cards count
    await pool.query(
      `UPDATE nfc_stock_config
       SET available_cards = available_cards - 1
       WHERE club_id = $1`,
      [card.club_id]
    );
    
    res.json({ message: 'NFC card assigned successfully', cardUid });
  } catch (error: any) {
    console.error('Error assigning NFC card:', error);
    res.status(400).json({ error: error.message || 'Failed to assign NFC card' });
  }
}
