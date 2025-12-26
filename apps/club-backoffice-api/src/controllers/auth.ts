

import { Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export async function getClubBySlug(req: Request, res: Response) {
    try {
        const { slug } = req.params;

        const result = await pool.query(
            'SELECT id, name, slug, primary_color, secondary_color, logo_url FROM clubs WHERE slug = $1',
            [slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Club not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        console.error('Error fetching club by slug:', error);
        res.status(500).json({ error: 'Failed to fetch club' });
    }
}
