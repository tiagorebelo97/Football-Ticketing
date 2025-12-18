import { Request, Response } from 'express';
import pool from '../db';

export async function listMatches(req: Request, res: Response) {
  try {
    const { clubId } = req.query;
    
    let query = `
      SELECT * FROM matches 
      WHERE status IN ('scheduled', 'ongoing')
      AND match_date >= CURRENT_TIMESTAMP
    `;
    const params: any[] = [];
    
    if (clubId) {
      query += ' AND club_id = $1';
      params.push(clubId);
    }
    
    query += ' ORDER BY match_date ASC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error listing matches:', error);
    res.status(500).json({ error: 'Failed to list matches' });
  }
}

export async function getMatch(req: Request, res: Response) {
  try {
    const { matchId } = req.params;
    const result = await pool.query('SELECT * FROM matches WHERE id = $1', [matchId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error getting match:', error);
    res.status(500).json({ error: 'Failed to get match' });
  }
}
