import { Request, Response } from 'express';
import { clubCreateSchema } from '@football-ticketing/shared';
import { createClub, provisionKeycloakRealm } from '../services/club-service';
import pool from '../db';

export async function provisionClub(req: Request, res: Response) {
  try {
    const validatedData = clubCreateSchema.parse(req.body);

    // Create Keycloak realm
    const keycloakRealmId = await provisionKeycloakRealm(validatedData.slug);

    // Create club in database
    const club = await createClub({
      ...validatedData,
      keycloakRealmId,
      // stripeAccountId, // Stripe integration removed
    });

    res.status(201).json(club);
  } catch (error: any) {
    console.error('Error provisioning club:', error);
    res.status(400).json({ error: error.message || 'Failed to provision club' });
  }
}

export async function listClubs(req: Request, res: Response) {
  try {
    const { page = '1', perPage = '20', search = '', countryId = '', includeDeleted = 'false', sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const offset = (Number(page) - 1) * Number(perPage);
    const searchPattern = `%${search}%`;

    const validSortColumns = ['name', 'short_name', 'founded_year', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy as string) ? sortBy : 'name';
    const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    let countQuery = `
      SELECT COUNT(*) FROM clubs c
      WHERE (c.name ILIKE $1 OR c.short_name ILIKE $1)
    `;
    let queryParams: any[] = [searchPattern];

    if (includeDeleted !== 'true') {
      countQuery += ' AND c.deleted_at IS NULL';
    }
    if (countryId) {
      countQuery += ' AND c.country_id = $' + (queryParams.length + 1);
      queryParams.push(countryId);
    }

    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    let dataQuery = `
      SELECT c.*, co.name as country_name, co.code as country_code
      FROM clubs c
      LEFT JOIN countries co ON c.country_id = co.id
      WHERE (c.name ILIKE $1 OR c.short_name ILIKE $1)
    `;

    let dataParams: any[] = [searchPattern];
    if (includeDeleted !== 'true') {
      dataQuery += ' AND c.deleted_at IS NULL';
    }
    if (countryId) {
      dataQuery += ' AND c.country_id = $' + (dataParams.length + 1);
      dataParams.push(countryId);
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
    console.error('Error listing clubs:', error);
    res.status(500).json({ error: 'Failed to list clubs' });
  }
}

export async function getClub(req: Request, res: Response) {
  try {
    const { clubId } = req.params;

    const clubQuery = `
      SELECT c.*, co.name as country_name, co.code as country_code
      FROM clubs c
      LEFT JOIN countries co ON c.country_id = co.id
      WHERE c.id = $1
    `;
    const clubResult = await pool.query(clubQuery, [clubId]);

    if (clubResult.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // Get venues
    const venuesQuery = 'SELECT * FROM venues WHERE club_id = $1';
    const venuesResult = await pool.query(venuesQuery, [clubId]);

    // Get competitions
    const competitionsQuery = `
      SELECT DISTINCT comp.id, comp.name, comp.short_name, comp.type,
             s.name as season_name, s.id as season_id, s.start_date
      FROM club_competition cc
      INNER JOIN competitions comp ON cc.competition_id = comp.id
      LEFT JOIN seasons s ON cc.season_id = s.id
      WHERE cc.club_id = $1
      ORDER BY s.start_date DESC, comp.name
    `;
    const competitionsResult = await pool.query(competitionsQuery, [clubId]);

    res.json({
      ...clubResult.rows[0],
      venues: venuesResult.rows,
      competitions: competitionsResult.rows
    });
  } catch (error: any) {
    console.error('Error getting club:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Failed to get club',
      details: error.message || 'Unknown error',
      code: error.code
    });
  }
}

export async function updateClub(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    const { name, shortName, logoUrl, countryId, foundedYear, stadiumCapacity, website, primaryColor, secondaryColor, isActive } = req.body;

    if (countryId) {
      const countryCheck = await pool.query('SELECT id FROM countries WHERE id = $1', [countryId]);
      if (countryCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Country not found' });
      }
    }

    const result = await pool.query(
      `UPDATE clubs 
       SET name = COALESCE($1, name),
           short_name = COALESCE($2, short_name),
           logo_url = COALESCE($3, logo_url),
           country_id = COALESCE($4, country_id),
           founded_year = COALESCE($5, founded_year),
           stadium_capacity = COALESCE($6, stadium_capacity),
           website = COALESCE($7, website),
           primary_color = COALESCE($8, primary_color),
           secondary_color = COALESCE($9, secondary_color),
           is_active = COALESCE($10, is_active)
       WHERE id = $11
       RETURNING *`,
      [name, shortName, logoUrl, countryId, foundedYear, stadiumCapacity, website, primaryColor, secondaryColor, isActive, clubId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating club:', error);
    res.status(500).json({ error: 'Failed to update club' });
  }
}

export async function deleteClub(req: Request, res: Response) {
  try {
    const { clubId } = req.params;

    // Soft delete - just set deleted_at timestamp
    const result = await pool.query(
      'UPDATE clubs SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING *',
      [clubId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found or already deleted' });
    }

    res.json({ message: 'Club soft deleted successfully', club: result.rows[0] });
  } catch (error: any) {
    console.error('Error deleting club:', error);
    res.status(500).json({ error: 'Failed to delete club' });
  }
}

export async function restoreClub(req: Request, res: Response) {
  try {
    const { clubId } = req.params;

    const result = await pool.query(
      'UPDATE clubs SET deleted_at = NULL WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *',
      [clubId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found or not deleted' });
    }

    res.json({ message: 'Club restored successfully', club: result.rows[0] });
  } catch (error: any) {
    console.error('Error restoring club:', error);
    res.status(500).json({ error: 'Failed to restore club' });
  }
}
