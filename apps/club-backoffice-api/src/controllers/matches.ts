import { Request, Response } from 'express';
import { matchCreateSchema, matchUpdateSchema } from '@football-ticketing/shared';
import pool from '../db';

export async function createMatch(req: Request, res: Response) {
  try {
    const validatedData = matchCreateSchema.parse(req.body);
    const clubId = req.body.clubId; // Should come from auth middleware
    
    const result = await pool.query(
      `INSERT INTO matches (club_id, home_team, away_team, match_date, venue, total_capacity, ticket_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [clubId, validatedData.homeTeam, validatedData.awayTeam, validatedData.matchDate, 
       validatedData.venue, validatedData.totalCapacity, validatedData.ticketPrice]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating match:', error);
    res.status(400).json({ error: error.message || 'Failed to create match' });
  }
}

export async function updateMatch(req: Request, res: Response) {
  try {
    const { matchId } = req.params;
    const validatedData = matchUpdateSchema.parse(req.body);
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    if (validatedData.homeTeam) {
      updates.push(`home_team = $${paramCount++}`);
      values.push(validatedData.homeTeam);
    }
    if (validatedData.awayTeam) {
      updates.push(`away_team = $${paramCount++}`);
      values.push(validatedData.awayTeam);
    }
    if (validatedData.matchDate) {
      updates.push(`match_date = $${paramCount++}`);
      values.push(validatedData.matchDate);
    }
    if (validatedData.venue) {
      updates.push(`venue = $${paramCount++}`);
      values.push(validatedData.venue);
    }
    if (validatedData.totalCapacity) {
      updates.push(`total_capacity = $${paramCount++}`);
      values.push(validatedData.totalCapacity);
    }
    if (validatedData.ticketPrice) {
      updates.push(`ticket_price = $${paramCount++}`);
      values.push(validatedData.ticketPrice);
    }
    
    values.push(matchId);
    
    const result = await pool.query(
      `UPDATE matches SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating match:', error);
    res.status(400).json({ error: error.message || 'Failed to update match' });
  }
}

export async function listMatches(req: Request, res: Response) {
  try {
    const { clubId } = req.query;
    
    const result = await pool.query(
      'SELECT * FROM matches WHERE club_id = $1 ORDER BY match_date DESC',
      [clubId]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error listing matches:', error);
    res.status(500).json({ error: 'Failed to list matches' });
  }
}

export async function deleteMatch(req: Request, res: Response) {
  try {
    const { matchId } = req.params;
    
    await pool.query('UPDATE matches SET status = $1 WHERE id = $2', ['cancelled', matchId]);
    
    res.json({ message: 'Match cancelled successfully' });
  } catch (error: any) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
}
