import { Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export async function getClubById(req: Request, res: Response) {
    try {
        const { clubId } = req.params;

        const result = await pool.query(
            `SELECT 
                c.id, 
                c.name, 
                c.short_name, 
                c.slug, 
                c.logo_url, 
                c.country_id,
                co.name as country_name,
                co.code as country_code,
                c.founded_year, 
                c.stadium_capacity, 
                c.website, 
                c.primary_color, 
                c.secondary_color, 
                c.is_active,
                c.created_at,
                c.updated_at
            FROM clubs c
            LEFT JOIN countries co ON c.country_id = co.id
            WHERE c.id = $1 AND c.deleted_at IS NULL`,
            [clubId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Club not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        console.error('Error fetching club by ID:', error);
        res.status(500).json({ error: 'Failed to fetch club' });
    }
}

export async function updateClub(req: Request, res: Response) {
    try {
        const { clubId } = req.params;
        const {
            name,
            short_name,
            logo_url,
            country_id,
            founded_year,
            stadium_capacity,
            website,
            primary_color,
            secondary_color
        } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (short_name !== undefined) {
            updates.push(`short_name = $${paramCount++}`);
            values.push(short_name);
        }
        if (logo_url !== undefined) {
            updates.push(`logo_url = $${paramCount++}`);
            values.push(logo_url);
        }
        if (country_id !== undefined) {
            updates.push(`country_id = $${paramCount++}`);
            values.push(country_id || null);
        }
        if (founded_year !== undefined) {
            updates.push(`founded_year = $${paramCount++}`);
            values.push(founded_year);
        }
        if (stadium_capacity !== undefined) {
            updates.push(`stadium_capacity = $${paramCount++}`);
            values.push(stadium_capacity);
        }
        if (website !== undefined) {
            updates.push(`website = $${paramCount++}`);
            values.push(website);
        }
        if (primary_color !== undefined) {
            updates.push(`primary_color = $${paramCount++}`);
            values.push(primary_color);
        }
        if (secondary_color !== undefined) {
            updates.push(`secondary_color = $${paramCount++}`);
            values.push(secondary_color);
        }

        // Add updated_at timestamp
        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        // Add clubId to values array
        values.push(clubId);

        const query = `
            UPDATE clubs 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount} AND deleted_at IS NULL
            RETURNING id, name, short_name, slug, logo_url, country_id, founded_year, 
                      stadium_capacity, website, primary_color, secondary_color, is_active,
                      created_at, updated_at
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Club not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        console.error('Error updating club:', error);
        res.status(500).json({ error: 'Failed to update club' });
    }
}

export async function getCountries(req: Request, res: Response) {
    try {
        const result = await pool.query(
            'SELECT id, name, code, flag_url FROM countries ORDER BY name ASC'
        );

        res.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
}
