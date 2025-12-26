import { Request, Response } from 'express';
import pool from '../db';

export async function listSports(req: Request, res: Response) {
    try {
        const result = await pool.query('SELECT * FROM sports ORDER BY name ASC');
        res.json(result.rows);
    } catch (error: any) {
        console.error('Error listing sports:', error);
        res.status(500).json({ error: 'Failed to list sports' });
    }
}

export async function getSport(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM sports WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sport not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        console.error('Error getting sport:', error);
        res.status(500).json({ error: 'Failed to get sport' });
    }
}
