import { Request, Response } from 'express';
import pool from '../db';

export async function listCountries(req: Request, res: Response) {
  try {
    const { page = '1', perPage = '20', search = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const offset = (Number(page) - 1) * Number(perPage);
    const searchPattern = `%${search}%`;

    const validSortColumns = ['name', 'code', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy as string) ? sortBy : 'name';
    const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const countQuery = 'SELECT COUNT(*) FROM countries WHERE name ILIKE $1 OR code ILIKE $1';
    const countResult = await pool.query(countQuery, [searchPattern]);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT * FROM countries 
      WHERE name ILIKE $1 OR code ILIKE $1
      ORDER BY ${sortColumn} ${order}
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [searchPattern, Number(perPage), offset]);

    res.json({
      data: result.rows,
      pagination: {
        page: Number(page),
        perPage: Number(perPage),
        total,
        totalPages: Math.ceil(total / Number(perPage))
      }
    });
  } catch (error: any) {
    console.error('Error listing countries:', error);
    res.status(500).json({ error: 'Failed to list countries' });
  }
}

export async function getCountry(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const countryQuery = 'SELECT * FROM countries WHERE id = $1';
    const countryResult = await pool.query(countryQuery, [id]);

    if (countryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }

    // Get associated clubs
    const clubsQuery = 'SELECT id, name, short_name, logo_url FROM clubs WHERE country_id = $1 AND deleted_at IS NULL';
    const clubsResult = await pool.query(clubsQuery, [id]);

    // Get associated competitions
    const competitionsQuery = 'SELECT id, name, short_name, type FROM competitions WHERE country_id = $1';
    const competitionsResult = await pool.query(competitionsQuery, [id]);

    res.json({
      ...countryResult.rows[0],
      clubs: clubsResult.rows,
      competitions: competitionsResult.rows
    });
  } catch (error: any) {
    console.error('Error getting country:', error);
    res.status(500).json({ error: 'Failed to get country' });
  }
}

export async function createCountry(req: Request, res: Response) {
  try {
    const { name, code, flagUrl } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    if (code.length < 2 || code.length > 3) {
      return res.status(400).json({ error: 'Code must be 2-3 characters' });
    }

    const query = `
      INSERT INTO countries (name, code, flag_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [name, code.toUpperCase(), flagUrl || null]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating country:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Country with this name or code already exists' });
    }
    res.status(500).json({ error: 'Failed to create country' });
  }
}

export async function updateCountry(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, code, flagUrl } = req.body;

    if (code && (code.length < 2 || code.length > 3)) {
      return res.status(400).json({ error: 'Code must be 2-3 characters' });
    }

    const query = `
      UPDATE countries
      SET name = COALESCE($1, name),
          code = COALESCE($2, code),
          flag_url = COALESCE($3, flag_url)
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [
      name || null,
      code ? code.toUpperCase() : null,
      flagUrl !== undefined ? flagUrl : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating country:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Country with this name or code already exists' });
    }
    res.status(500).json({ error: 'Failed to update country' });
  }
}

export async function deleteCountry(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check for associated clubs
    const clubsCheck = await pool.query('SELECT COUNT(*) FROM clubs WHERE country_id = $1 AND deleted_at IS NULL', [id]);
    const clubCount = parseInt(clubsCheck.rows[0].count);

    // Check for associated competitions
    const competitionsCheck = await pool.query('SELECT COUNT(*) FROM competitions WHERE country_id = $1', [id]);
    const competitionCount = parseInt(competitionsCheck.rows[0].count);

    if (clubCount > 0 || competitionCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete country',
        message: `This country has ${clubCount} club(s) and ${competitionCount} competition(s). Delete them first or they will be cascade deleted.`,
        clubs: clubCount,
        competitions: competitionCount
      });
    }

    const result = await pool.query('DELETE FROM countries WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json({ message: 'Country deleted successfully', country: result.rows[0] });
  } catch (error: any) {
    console.error('Error deleting country:', error);
    res.status(500).json({ error: 'Failed to delete country' });
  }
}
