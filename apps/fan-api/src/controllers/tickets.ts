import { Request, Response } from 'express';
import { ticketPurchaseSchema, generateQRCode, generateTicketNumber } from '@football-ticketing/shared';
import pool from '../db';
import QRCode from 'qrcode';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function purchaseTicket(req: Request, res: Response) {
  try {
    const validatedData = ticketPurchaseSchema.parse(req.body);
    const { matchId, seatSection, seatNumber, includeDeposit } = validatedData;
    const userId = req.body.userId; // Should come from auth middleware
    
    // Get match details
    const matchResult = await pool.query('SELECT * FROM matches WHERE id = $1', [matchId]);
    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }
    const match = matchResult.rows[0];
    
    // Calculate total amount
    let totalAmount = parseFloat(match.ticket_price);
    let depositAmount = 0;
    
    if (includeDeposit) {
      const depositConfig = await pool.query(
        'SELECT deposit_amount FROM nfc_stock_config WHERE club_id = $1',
        [match.club_id]
      );
      if (depositConfig.rows.length > 0) {
        depositAmount = parseFloat(depositConfig.rows[0].deposit_amount);
        totalAmount += depositAmount;
      }
    }
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        matchId,
        userId,
      },
    });
    
    // Generate ticket number and QR code
    const ticketNumber = generateTicketNumber();
    const qrCodeData = generateQRCode('temp-id', matchId);
    
    // Create ticket
    const ticketResult = await pool.query(
      `INSERT INTO tickets (match_id, user_id, ticket_number, qr_code_data, price, deposit_amount, seat_section, seat_number, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
       RETURNING *`,
      [matchId, userId, ticketNumber, qrCodeData, match.ticket_price, depositAmount, seatSection, seatNumber]
    );
    
    const ticket = ticketResult.rows[0];
    
    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);
    
    res.status(201).json({
      ticket,
      qrCode: qrCodeImage,
      paymentIntentClientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Error purchasing ticket:', error);
    res.status(400).json({ error: error.message || 'Failed to purchase ticket' });
  }
}

export async function getTicket(req: Request, res: Response) {
  try {
    const { ticketId } = req.params;
    const result = await pool.query(
      `SELECT t.*, m.home_team, m.away_team, m.match_date, m.venue
       FROM tickets t
       JOIN matches m ON t.match_id = m.id
       WHERE t.id = $1`,
      [ticketId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const ticket = result.rows[0];
    const qrCodeImage = await QRCode.toDataURL(ticket.qr_code_data);
    
    res.json({ ...ticket, qrCode: qrCodeImage });
  } catch (error: any) {
    console.error('Error getting ticket:', error);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
}

export async function getUserTickets(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT t.*, m.home_team, m.away_team, m.match_date, m.venue
       FROM tickets t
       JOIN matches m ON t.match_id = m.id
       WHERE t.user_id = $1
       ORDER BY m.match_date DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error getting user tickets:', error);
    res.status(500).json({ error: 'Failed to get user tickets' });
  }
}
