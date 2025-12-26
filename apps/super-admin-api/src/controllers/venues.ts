import { Request, Response } from 'express';
import pool from '../db';

export async function listVenues(req: Request, res: Response) {
  try {
    const { page = '1', perPage = '20', search = '', clubId = '', city = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const offset = (Number(page) - 1) * Number(perPage);
    const searchPattern = `%${search}%`;

    const validSortColumns = ['name', 'city', 'capacity', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy as string) ? sortBy : 'name';
    const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    let countQuery = `
      SELECT COUNT(*) FROM venues v 
      INNER JOIN clubs c ON v.club_id = c.id 
      WHERE c.deleted_at IS NULL AND (v.name ILIKE $1 OR v.city ILIKE $1)
    `;
    let queryParams: any[] = [searchPattern];
    
    if (clubId) {
      countQuery += ' AND v.club_id = $' + (queryParams.length + 1);
      queryParams.push(clubId);
    }
    if (city) {
      countQuery += ' AND v.city ILIKE $' + (queryParams.length + 1);
      queryParams.push(`%${city}%`);
    }

    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    let dataQuery = `
      SELECT v.*, c.name as club_name, c.logo_url as club_logo
      FROM venues v
      INNER JOIN clubs c ON v.club_id = c.id
      WHERE c.deleted_at IS NULL AND (v.name ILIKE $1 OR v.city ILIKE $1)
    `;
    
    let dataParams: any[] = [searchPattern];
    if (clubId) {
      dataQuery += ' AND v.club_id = $' + (dataParams.length + 1);
      dataParams.push(clubId);
    }
    if (city) {
      dataQuery += ' AND v.city ILIKE $' + (dataParams.length + 1);
      dataParams.push(`%${city}%`);
    }

    dataQuery += ` ORDER BY v.${sortColumn} ${order} LIMIT $${dataParams.length + 1} OFFSET $${dataParams.length + 2}`;
    dataParams.push(Number(perPage), offset);

    const result = await pool.query(dataQuery, dataParams);

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
    console.error('Error listing venues:', error);
    res.status(500).json({ error: 'Failed to list venues' });
  }
}

export async function getVenue(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT v.*, c.name as club_name, c.logo_url as club_logo, 
             co.name as country_name, co.code as country_code
      FROM venues v
      INNER JOIN clubs c ON v.club_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      WHERE v.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error getting venue:', error);
    res.status(500).json({ error: 'Failed to get venue' });
  }
}

export async function createVenue(req: Request, res: Response) {
  try {
    const { name, clubId, city, capacity, address, latitude, longitude } = req.body;

    if (!name || !clubId || !city) {
      return res.status(400).json({ error: 'Name, clubId, and city are required' });
    }

    // Check if club exists and is not deleted
    const clubCheck = await pool.query('SELECT id FROM clubs WHERE id = $1 AND deleted_at IS NULL', [clubId]);
    if (clubCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Club not found or has been deleted' });
    }

    const query = `
      INSERT INTO venues (name, club_id, city, capacity, address, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      name,
      clubId,
      city,
      capacity || null,
      address || null,
      latitude || null,
      longitude || null
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating venue:', error);
    res.status(500).json({ error: 'Failed to create venue' });
  }
}

export async function updateVenue(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, clubId, city, capacity, address, latitude, longitude } = req.body;

    if (clubId) {
      // Check if club exists and is not deleted
      const clubCheck = await pool.query('SELECT id FROM clubs WHERE id = $1 AND deleted_at IS NULL', [clubId]);
      if (clubCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Club not found or has been deleted' });
      }
    }

    const query = `
      UPDATE venues
      SET name = COALESCE($1, name),
          club_id = COALESCE($2, club_id),
          city = COALESCE($3, city),
          capacity = COALESCE($4, capacity),
          address = COALESCE($5, address),
          latitude = COALESCE($6, latitude),
          longitude = COALESCE($7, longitude)
      WHERE id = $8
      RETURNING *
    `;
    const result = await pool.query(query, [
      name || null,
      clubId || null,
      city || null,
      capacity !== undefined ? capacity : null,
      address !== undefined ? address : null,
      latitude !== undefined ? latitude : null,
      longitude !== undefined ? longitude : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating venue:', error);
    res.status(500).json({ error: 'Failed to update venue' });
  }
}

export async function deleteVenue(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM venues WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json({ message: 'Venue deleted successfully', venue: result.rows[0] });
  } catch (error: any) {
    console.error('Error deleting venue:', error);
    res.status(500).json({ error: 'Failed to delete venue' });
  }
}
