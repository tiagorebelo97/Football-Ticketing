import { Request, Response } from 'express';
import pool from '../db';

/**
 * Get all available sports
 */
export async function getSports(req: Request, res: Response) {
  try {
    const result = await pool.query(
      'SELECT * FROM sports ORDER BY name'
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching sports:', error);
    res.status(500).json({ error: 'Failed to fetch sports' });
  }
}

/**
 * Get single sport by ID
 */
export async function getSportById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM sports WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sport not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching sport:', error);
    res.status(500).json({ error: 'Failed to fetch sport' });
  }
}
