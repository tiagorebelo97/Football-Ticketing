import { Request, Response } from 'express';
import { staffLoginSchema, generateSessionToken } from '@football-ticketing/shared';
import pool from '../db';

export async function nfcLogin(req: Request, res: Response) {
  try {
    const validatedData = staffLoginSchema.parse(req.body);
    const { nfcCardUid } = validatedData;
    
    // Find NFC card and assigned user
    const cardResult = await pool.query(
      `SELECT nc.*, u.* FROM nfc_cards nc
       JOIN users u ON nc.assigned_to_user_id = u.id
       WHERE nc.card_uid = $1 AND nc.status = 'assigned' AND u.role IN ('staff', 'club_admin')`,
      [nfcCardUid]
    );
    
    if (cardResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid NFC card or insufficient permissions' });
    }
    
    const card = cardResult.rows[0];
    const sessionToken = generateSessionToken();
    
    // Create staff session
    await pool.query(
      `INSERT INTO staff_sessions (user_id, nfc_card_id, club_id, session_token, is_active)
       VALUES ($1, $2, $3, $4, true)`,
      [card.assigned_to_user_id, card.id, card.club_id, sessionToken]
    );
    
    res.json({
      sessionToken,
      user: {
        id: card.id,
        name: `${card.first_name} ${card.last_name}`,
        role: card.role,
      },
    });
  } catch (error: any) {
    console.error('Error during NFC login:', error);
    res.status(400).json({ error: error.message || 'Login failed' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { sessionToken } = req.body;
    
    await pool.query(
      `UPDATE staff_sessions
       SET is_active = false, logout_time = CURRENT_TIMESTAMP
       WHERE session_token = $1`,
      [sessionToken]
    );
    
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}
