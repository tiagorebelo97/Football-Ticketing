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

    // Get venue basic info
    const query = `
      SELECT v.*, c.name as club_name, c.logo_url as club_logo, 
             co.name as country_name, co.code as country_code,
             s.name as sport_name, s.code as sport_code
      FROM venues v
      INNER JOIN clubs c ON v.club_id = c.id
      LEFT JOIN countries co ON c.country_id = co.id
      LEFT JOIN sports s ON v.sport_id = s.id
      WHERE v.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const row = result.rows[0];
    const venue = {
      ...row,
      clubId: row.club_id,
      sportId: row.sport_id,
      sportName: row.sport_name,
      sportCode: row.sport_code,
      countryName: row.country_name,
      countryCode: row.country_code,
      stands: [] as any[]
    };

    // Get hierarchy using the view or raw query if view doesn't exist
    // Using a reliable raw join query to avoid dependency on whether the view was created successfully in migration
    const hierarchyQuery = `
      SELECT 
        st.id as stand_id, st.name as stand_name, st.position as stand_position, st.color as stand_color, st.total_capacity as stand_capacity,
        f.id as floor_id, f.name as floor_name, f.floor_number, f.total_capacity as floor_capacity, f.total_sectors as floor_total_sectors,
        sec.id as sector_id, sec.name as sector_name, sec.sector_number, sec.total_seats as sector_total_seats, sec.configured_seats as sector_configured_seats, sec.total_rows as sector_total_rows,
        r.id as row_id, r.name as row_name, r.row_number, r.seats_count as row_seats_count
      FROM stands st
      LEFT JOIN floors f ON st.id = f.stand_id
      LEFT JOIN sectors sec ON f.id = sec.floor_id
      LEFT JOIN rows r ON sec.id = r.sector_id
      WHERE st.venue_id = $1
      ORDER BY st.position, f.floor_number, sec.sector_number, r.row_number
    `;

    const hierarchyResult = await pool.query(hierarchyQuery, [id]);

    // Reconstruct hierarchy
    const standsMap = new Map();

    hierarchyResult.rows.forEach(row => {
      if (!standsMap.has(row.stand_id)) {
        standsMap.set(row.stand_id, {
          id: row.stand_id,
          name: row.stand_name,
          position: row.stand_position,
          color: row.stand_color,
          totalCapacity: row.stand_capacity,
          floors: []
        });
      }
      const stand = standsMap.get(row.stand_id);

      if (row.floor_id) {
        let floor = stand.floors.find((f: any) => f.id === row.floor_id);
        if (!floor) {
          floor = {
            id: row.floor_id,
            name: row.floor_name,
            floorNumber: row.floor_number,
            totalCapacity: row.floor_capacity,
            totalSectors: row.floor_total_sectors,
            sectors: []
          };
          stand.floors.push(floor);
        }

        if (row.sector_id) {
          let sector = floor.sectors.find((s: any) => s.id === row.sector_id);
          if (!sector) {
            sector = {
              id: row.sector_id,
              name: row.sector_name,
              sectorNumber: row.sector_number,
              totalSeats: row.sector_total_seats,
              configuredSeats: row.sector_configured_seats,
              totalRows: row.sector_total_rows,
              rows: []
            };
            floor.sectors.push(sector);
          }

          if (row.row_id) {
            sector.rows.push({
              id: row.row_id,
              name: row.row_name,
              rowNumber: row.row_number,
              seatsCount: row.row_seats_count
            });
          }
        }
      }
    });

    venue.stands = Array.from(standsMap.values());

    res.json(venue);
  } catch (error: any) {
    console.error('Error getting venue:', error);
    res.status(500).json({ error: 'Failed to get venue' });
  }
}

// Helper to save hierarchy
async function saveVenueHierarchy(client: any, venueId: string, stands: any[]) {
  if (!stands || stands.length === 0) return;

  // Delete existing stands (cascades to floors, sectors, rows)
  await client.query('DELETE FROM stands WHERE venue_id = $1', [venueId]);

  for (const stand of stands) {
    // Insert Stand
    const standResult = await client.query(`
      INSERT INTO stands (venue_id, name, position, total_floors, total_capacity, color)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [venueId, stand.name, stand.position, stand.totalFloors || 1, stand.totalCapacity || 0, stand.color]);

    const standId = standResult.rows[0].id;

    if (stand.floors) {
      for (const floor of stand.floors) {
        // Insert Floor
        const floorResult = await client.query(`
          INSERT INTO floors (stand_id, name, floor_number, total_sectors, total_capacity)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [standId, floor.name, floor.floorNumber, floor.totalSectors || 0, floor.totalCapacity || 0]);

        const floorId = floorResult.rows[0].id;

        if (floor.sectors) {
          for (const sector of floor.sectors) {
            // Insert Sector
            const sectorResult = await client.query(`
              INSERT INTO sectors (floor_id, name, sector_number, total_rows, total_seats, configured_seats)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id
            `, [floorId, sector.name, sector.sectorNumber, sector.totalRows || 0, sector.totalSeats || 0, sector.configuredSeats || 0]);

            const sectorId = sectorResult.rows[0].id;

            if (sector.rows) {
              for (const row of sector.rows) {
                // Insert Row
                await client.query(`
                  INSERT INTO rows (sector_id, name, row_number, seats_count)
                  VALUES ($1, $2, $3, $4)
                `, [sectorId, row.name, row.rowNumber, row.seatsCount]);
              }
            }
          }
        }
      }
    }
  }
}

export async function createVenue(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { name, clubId, city, capacity, address, latitude, longitude, sportId, stands } = req.body;

    if (!name || !clubId || !city || !sportId) {
      return res.status(400).json({ error: 'Name, clubId, city, and sportId are required' });
    }

    // Check if club exists and is not deleted
    const clubCheck = await client.query('SELECT id FROM clubs WHERE id = $1 AND deleted_at IS NULL', [clubId]);
    if (clubCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Club not found or has been deleted' });
    }

    const query = `
      INSERT INTO venues (name, club_id, city, capacity, address, latitude, longitude, sport_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await client.query(query, [
      name,
      clubId,
      city,
      capacity || null,
      address || null,
      latitude || null,
      longitude || null,
      sportId
    ]);

    const venue = result.rows[0];

    // Save Hierarchy
    if (stands && stands.length > 0) {
      await saveVenueHierarchy(client, venue.id, stands);
    }

    await client.query('COMMIT');
    res.status(201).json(venue);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating venue:', error);
    res.status(500).json({ error: 'Failed to create venue' });
  } finally {
    client.release();
  }
}

export async function updateVenue(req: Request, res: Response) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { name, clubId, city, capacity, address, latitude, longitude, sportId, stands } = req.body;

    if (clubId) {
      // Check if club exists and is not deleted
      const clubCheck = await client.query('SELECT id FROM clubs WHERE id = $1 AND deleted_at IS NULL', [clubId]);
      if (clubCheck.rows.length === 0) {
        await client.query('ROLLBACK');
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
          longitude = COALESCE($7, longitude),
          sport_id = COALESCE($8, sport_id)
      WHERE id = $9
      RETURNING *
    `;
    const result = await client.query(query, [
      name || null,
      clubId || null,
      city || null,
      capacity !== undefined ? capacity : null,
      address !== undefined ? address : null,
      latitude !== undefined ? latitude : null,
      longitude !== undefined ? longitude : null,
      sportId || null,
      id
    ]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venue not found' });
    }

    const venue = result.rows[0];

    // Save Hierarchy (if provided)
    if (stands) {
      await saveVenueHierarchy(client, venue.id, stands);
    }

    await client.query('COMMIT');
    res.json(venue);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating venue:', error);
    res.status(500).json({ error: 'Failed to update venue' });
  } finally {
    client.release();
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
