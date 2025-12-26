import { Request, Response } from 'express';
import pool from '../db';

export async function listSeasons(req: Request, res: Response) {
  try {
    const { page = '1', perPage = '20', search = '', isActive = '', sortBy = 'start_date', sortOrder = 'DESC' } = req.query;
    const offset = (Number(page) - 1) * Number(perPage);
    const searchPattern = `%${search}%`;

    const validSortColumns = ['name', 'start_date', 'end_date', 'is_active', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy as string) ? sortBy : 'start_date';
    const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    let countQuery = 'SELECT COUNT(*) FROM seasons WHERE name ILIKE $1';
    let queryParams: any[] = [searchPattern];
    
    if (isActive !== '') {
      countQuery += ' AND is_active = $' + (queryParams.length + 1);
      queryParams.push(isActive === 'true');
    }

    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    let dataQuery = 'SELECT * FROM seasons WHERE name ILIKE $1';
    let dataParams: any[] = [searchPattern];
    
    if (isActive !== '') {
      dataQuery += ' AND is_active = $' + (dataParams.length + 1);
      dataParams.push(isActive === 'true');
    }

    dataQuery += ` ORDER BY ${sortColumn} ${order} LIMIT $${dataParams.length + 1} OFFSET $${dataParams.length + 2}`;
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
    console.error('Error listing seasons:', error);
    res.status(500).json({ error: 'Failed to list seasons' });
  }
}

export async function getSeason(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const seasonQuery = 'SELECT * FROM seasons WHERE id = $1';
    const seasonResult = await pool.query(seasonQuery, [id]);

    if (seasonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    // Get associated competitions
    const competitionsQuery = `
      SELECT DISTINCT comp.id, comp.name, comp.short_name, comp.type, comp.logo_url,
             co.name as country_name
      FROM club_competition cc
      INNER JOIN competitions comp ON cc.competition_id = comp.id
      INNER JOIN countries co ON comp.country_id = co.id
      WHERE cc.season_id = $1
      ORDER BY comp.name
    `;
    const competitionsResult = await pool.query(competitionsQuery, [id]);

    res.json({
      ...seasonResult.rows[0],
      competitions: competitionsResult.rows
    });
  } catch (error: any) {
    console.error('Error getting season:', error);
    res.status(500).json({ error: 'Failed to get season' });
  }
}

export async function createSeason(req: Request, res: Response) {
  try {
    const { name, startDate, endDate, isActive } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'Name, startDate, and endDate are required' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // If isActive is true, deactivate all other seasons (will be done by trigger)
    const query = `
      INSERT INTO seasons (name, start_date, end_date, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [name, startDate, endDate, isActive || false]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating season:', error);
    res.status(500).json({ error: 'Failed to create season' });
  }
}

export async function updateSeason(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, isActive } = req.body;

    // Validate dates if both are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
    }

    // If activating this season, the trigger will deactivate others
    const query = `
      UPDATE seasons
      SET name = COALESCE($1, name),
          start_date = COALESCE($2, start_date),
          end_date = COALESCE($3, end_date),
          is_active = COALESCE($4, is_active)
      WHERE id = $5
      RETURNING *
    `;
    const result = await pool.query(query, [
      name || null,
      startDate || null,
      endDate || null,
      isActive !== undefined ? isActive : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating season:', error);
    res.status(500).json({ error: 'Failed to update season' });
  }
}

export async function deleteSeason(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check if this is the active season
    const seasonCheck = await pool.query('SELECT is_active FROM seasons WHERE id = $1', [id]);
    if (seasonCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Season not found' });
    }

    if (seasonCheck.rows[0].is_active) {
      return res.status(400).json({
        error: 'Cannot delete active season',
        message: 'Please deactivate the season first or activate another season before deleting.'
      });
    }

    // Check for associated data
    const associationsCheck = await pool.query('SELECT COUNT(*) FROM club_competition WHERE season_id = $1', [id]);
    const associationCount = parseInt(associationsCheck.rows[0].count);

    if (associationCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete season',
        message: `This season has ${associationCount} club-competition association(s). They will be set to NULL.`,
        associations: associationCount
      });
    }

    const result = await pool.query('DELETE FROM seasons WHERE id = $1 RETURNING *', [id]);

    res.json({ message: 'Season deleted successfully', season: result.rows[0] });
  } catch (error: any) {
    console.error('Error deleting season:', error);
    res.status(500).json({ error: 'Failed to delete season' });
  }
}

export async function getActiveSeason(req: Request, res: Response) {
  try {
    const result = await pool.query('SELECT * FROM seasons WHERE is_active = true LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active season found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error getting active season:', error);
    res.status(500).json({ error: 'Failed to get active season' });
  }
}
