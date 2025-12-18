import { Request, Response } from 'express';
import { entryValidationSchema } from '@football-ticketing/shared';
import pool from '../db';

export async function validateEntry(req: Request & { io?: any }, res: Response) {
  try {
    const validatedData = entryValidationSchema.parse(req.body);
    const { ticketIdentifier, matchId, gateNumber, entryType } = validatedData;
    
    let ticket;
    
    if (entryType === 'qr') {
      // Validate by QR code
      const result = await pool.query(
        'SELECT * FROM tickets WHERE qr_code_data = $1 AND match_id = $2',
        [ticketIdentifier, matchId]
      );
      ticket = result.rows[0];
    } else {
      // Validate by NFC card
      const result = await pool.query(
        `SELECT t.* FROM tickets t
         JOIN nfc_cards nc ON t.nfc_card_id = nc.id
         WHERE nc.card_uid = $1 AND t.match_id = $2`,
        [ticketIdentifier, matchId]
      );
      ticket = result.rows[0];
    }
    
    if (!ticket) {
      await pool.query(
        `INSERT INTO entry_logs (match_id, ticket_id, entry_type, gate_number, validation_status)
         VALUES ($1, NULL, $2, $3, 'invalid')`,
        [matchId, entryType, gateNumber]
      );
      return res.status(404).json({ valid: false, error: 'Invalid ticket' });
    }
    
    if (ticket.status !== 'active') {
      await pool.query(
        `INSERT INTO entry_logs (match_id, ticket_id, entry_type, gate_number, validation_status)
         VALUES ($1, $2, $3, $4, 'invalid')`,
        [matchId, ticket.id, entryType, gateNumber]
      );
      return res.status(400).json({ valid: false, error: 'Ticket already used or cancelled' });
    }
    
    // Check for duplicate entry
    const duplicateCheck = await pool.query(
      `SELECT * FROM entry_logs 
       WHERE ticket_id = $1 AND validation_status = 'valid'`,
      [ticket.id]
    );
    
    if (duplicateCheck.rows.length > 0) {
      await pool.query(
        `INSERT INTO entry_logs (match_id, ticket_id, entry_type, gate_number, validation_status)
         VALUES ($1, $2, $3, $4, 'duplicate')`,
        [matchId, ticket.id, entryType, gateNumber]
      );
      return res.status(400).json({ valid: false, error: 'Duplicate entry detected' });
    }
    
    // Mark ticket as used
    await pool.query(
      'UPDATE tickets SET status = $1, used_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['used', ticket.id]
    );
    
    // Log valid entry
    await pool.query(
      `INSERT INTO entry_logs (match_id, ticket_id, entry_type, gate_number, validation_status)
       VALUES ($1, $2, $3, $4, 'valid')`,
      [matchId, ticket.id, entryType, gateNumber]
    );
    
    // Update match attendance
    const matchResult = await pool.query(
      `UPDATE matches
       SET current_attendance = current_attendance + 1
       WHERE id = $1
       RETURNING current_attendance, total_capacity`,
      [matchId]
    );
    
    const match = matchResult.rows[0];
    
    // Broadcast capacity update via WebSocket
    if (req.io) {
      req.io.to(`match-${matchId}`).emit('capacity-update', {
        matchId,
        currentAttendance: match.current_attendance,
        totalCapacity: match.total_capacity,
      });
    }
    
    res.json({
      valid: true,
      ticket,
      currentAttendance: match.current_attendance,
      totalCapacity: match.total_capacity,
    });
  } catch (error: any) {
    console.error('Error validating entry:', error);
    res.status(400).json({ valid: false, error: error.message || 'Validation failed' });
  }
}

export async function getMatchCapacity(req: Request, res: Response) {
  try {
    const { matchId } = req.params;
    
    const result = await pool.query(
      'SELECT current_attendance, total_capacity FROM matches WHERE id = $1',
      [matchId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error getting match capacity:', error);
    res.status(500).json({ error: 'Failed to get match capacity' });
  }
}
