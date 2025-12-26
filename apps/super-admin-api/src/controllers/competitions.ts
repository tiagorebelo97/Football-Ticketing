import { Request, Response } from 'express';
import pool from '../db';

export async function listCompetitions(req: Request, res: Response) {
  try {
    const { page = '1', perPage = '20', search = '', countryId = '', type = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const offset = (Number(page) - 1) * Number(perPage);
    const searchPattern = `%${search}%`;

    const validSortColumns = ['name', 'type', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy as string) ? sortBy : 'name';
    const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    let countQuery = `
      SELECT COUNT(*) FROM competitions c
      WHERE (c.name ILIKE $1 OR c.short_name ILIKE $1)
    `;
    let queryParams: any[] = [searchPattern];
    
    if (countryId) {
      countQuery += ' AND c.country_id = $' + (queryParams.length + 1);
      queryParams.push(countryId);
    }
    if (type) {
      countQuery += ' AND c.type = $' + (queryParams.length + 1);
      queryParams.push(type);
    }

    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    let dataQuery = `
      SELECT c.*, co.name as country_name, co.code as country_code
      FROM competitions c
      INNER JOIN countries co ON c.country_id = co.id
      WHERE (c.name ILIKE $1 OR c.short_name ILIKE $1)
    `;
    
    let dataParams: any[] = [searchPattern];
    if (countryId) {
      dataQuery += ' AND c.country_id = $' + (dataParams.length + 1);
      dataParams.push(countryId);
    }
    if (type) {
      dataQuery += ' AND c.type = $' + (dataParams.length + 1);
      dataParams.push(type);
    }

    dataQuery += ` ORDER BY c.${sortColumn} ${order} LIMIT $${dataParams.length + 1} OFFSET $${dataParams.length + 2}`;
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
    console.error('Error listing competitions:', error);
    res.status(500).json({ error: 'Failed to list competitions' });
  }
}

export async function getCompetition(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const competitionQuery = `
      SELECT c.*, co.name as country_name, co.code as country_code
      FROM competitions c
      INNER JOIN countries co ON c.country_id = co.id
      WHERE c.id = $1
    `;
    const competitionResult = await pool.query(competitionQuery, [id]);

    if (competitionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    // Get participating clubs
    const clubsQuery = `
      SELECT cl.id, cl.name, cl.short_name, cl.logo_url, cc.season_id,
             s.name as season_name
      FROM club_competition cc
      INNER JOIN clubs cl ON cc.club_id = cl.id
      LEFT JOIN seasons s ON cc.season_id = s.id
      WHERE cc.competition_id = $1 AND cl.deleted_at IS NULL
      ORDER BY s.start_date DESC, cl.name
    `;
    const clubsResult = await pool.query(clubsQuery, [id]);

    // Get associated seasons (unique)
    const seasonsQuery = `
      SELECT DISTINCT s.id, s.name, s.start_date, s.end_date, s.is_active
      FROM club_competition cc
      INNER JOIN seasons s ON cc.season_id = s.id
      WHERE cc.competition_id = $1
      ORDER BY s.start_date DESC
    `;
    const seasonsResult = await pool.query(seasonsQuery, [id]);

    res.json({
      ...competitionResult.rows[0],
      clubs: clubsResult.rows,
      seasons: seasonsResult.rows
    });
  } catch (error: any) {
    console.error('Error getting competition:', error);
    res.status(500).json({ error: 'Failed to get competition' });
  }
}

export async function createCompetition(req: Request, res: Response) {
  try {
    const { name, shortName, type, countryId, logoUrl } = req.body;

    if (!name || !type || !countryId) {
      return res.status(400).json({ error: 'Name, type, and countryId are required' });
    }

    const validTypes = ['league', 'cup', 'international'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Type must be league, cup, or international' });
    }

    // Check if country exists
    const countryCheck = await pool.query('SELECT id FROM countries WHERE id = $1', [countryId]);
    if (countryCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Country not found' });
    }

    const query = `
      INSERT INTO competitions (name, short_name, type, country_id, logo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [name, shortName || null, type, countryId, logoUrl || null]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating competition:', error);
    res.status(500).json({ error: 'Failed to create competition' });
  }
}

export async function updateCompetition(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, shortName, type, countryId, logoUrl } = req.body;

    if (type) {
      const validTypes = ['league', 'cup', 'international'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Type must be league, cup, or international' });
      }
    }

    if (countryId) {
      const countryCheck = await pool.query('SELECT id FROM countries WHERE id = $1', [countryId]);
      if (countryCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Country not found' });
      }
    }

    const query = `
      UPDATE competitions
      SET name = COALESCE($1, name),
          short_name = COALESCE($2, short_name),
          type = COALESCE($3, type),
          country_id = COALESCE($4, country_id),
          logo_url = COALESCE($5, logo_url)
      WHERE id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [
      name || null,
      shortName !== undefined ? shortName : null,
      type || null,
      countryId || null,
      logoUrl !== undefined ? logoUrl : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating competition:', error);
    res.status(500).json({ error: 'Failed to update competition' });
  }
}

export async function deleteCompetition(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check for associated data
    const clubsCheck = await pool.query('SELECT COUNT(*) FROM club_competition WHERE competition_id = $1', [id]);
    const clubCount = parseInt(clubsCheck.rows[0].count);

    if (clubCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete competition',
        message: `This competition has ${clubCount} club association(s). They will be cascade deleted.`,
        clubs: clubCount
      });
    }

    const result = await pool.query('DELETE FROM competitions WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    res.json({ message: 'Competition deleted successfully', competition: result.rows[0] });
  } catch (error: any) {
    console.error('Error deleting competition:', error);
    res.status(500).json({ error: 'Failed to delete competition' });
  }
}

// Add or remove clubs from competition
export async function manageCompetitionClubs(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { clubIds, seasonId, action } = req.body; // action: 'add' or 'remove'

    if (!clubIds || !Array.isArray(clubIds)) {
      return res.status(400).json({ error: 'clubIds must be an array' });
    }

    if (action === 'add') {
      // Add clubs to competition
      for (const clubId of clubIds) {
        try {
          await pool.query(
            'INSERT INTO club_competition (club_id, competition_id, season_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [clubId, id, seasonId || null]
          );
        } catch (error) {
          console.error(`Error adding club ${clubId}:`, error);
        }
      }
      res.json({ message: 'Clubs added to competition' });
    } else if (action === 'remove') {
      // Remove clubs from competition
      await pool.query(
        'DELETE FROM club_competition WHERE competition_id = $1 AND club_id = ANY($2)',
        [id, clubIds]
      );
      res.json({ message: 'Clubs removed from competition' });
    } else {
      res.status(400).json({ error: 'Action must be add or remove' });
    }
  } catch (error: any) {
    console.error('Error managing competition clubs:', error);
    res.status(500).json({ error: 'Failed to manage competition clubs' });
  }
}
