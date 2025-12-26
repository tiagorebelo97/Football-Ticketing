import { Request, Response } from 'express';
import pool from '../db';

/**
 * Get all venues for a club
 */
export async function getVenues(req: Request, res: Response) {
  try {
    const { clubId } = req.query;
    
    if (!clubId) {
      return res.status(400).json({ error: 'clubId is required' });
    }

    const result = await pool.query(
      `SELECT 
        v.*,
        s.name as sport_name,
        s.code as sport_code,
        (SELECT COUNT(*) FROM stands WHERE venue_id = v.id) as stands_count,
        (SELECT COALESCE(SUM(total_capacity), 0) FROM stands WHERE venue_id = v.id) as calculated_capacity
       FROM venues v
       LEFT JOIN sports s ON v.sport_id = s.id
       WHERE v.club_id = $1
       ORDER BY v.created_at DESC`,
      [clubId]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
}

/**
 * Get single venue with full hierarchy
 */
export async function getVenueById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Get venue basic info
    const venueResult = await pool.query(
      `SELECT v.*, s.name as sport_name, s.code as sport_code
       FROM venues v
       LEFT JOIN sports s ON v.sport_id = s.id
       WHERE v.id = $1`,
      [id]
    );
    
    if (venueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    const venue = venueResult.rows[0];
    
    // Get stands with nested structure
    const standsResult = await pool.query(
      `SELECT * FROM stands WHERE venue_id = $1 ORDER BY position`,
      [id]
    );
    
    // Get all floors for these stands
    const floorsResult = await pool.query(
      `SELECT f.* FROM floors f
       JOIN stands st ON f.stand_id = st.id
       WHERE st.venue_id = $1
       ORDER BY f.floor_number`,
      [id]
    );
    
    // Get all sectors for these floors
    const sectorsResult = await pool.query(
      `SELECT sec.* FROM sectors sec
       JOIN floors f ON sec.floor_id = f.id
       JOIN stands st ON f.stand_id = st.id
       WHERE st.venue_id = $1
       ORDER BY sec.sector_number`,
      [id]
    );
    
    // Get all rows for these sectors
    const rowsResult = await pool.query(
      `SELECT r.* FROM rows r
       JOIN sectors sec ON r.sector_id = sec.id
       JOIN floors f ON sec.floor_id = f.id
       JOIN stands st ON f.stand_id = st.id
       WHERE st.venue_id = $1
       ORDER BY r.row_number`,
      [id]
    );
    
    // Build nested structure
    const stands = standsResult.rows.map(stand => {
      const floors = floorsResult.rows
        .filter(f => f.stand_id === stand.id)
        .map(floor => {
          const sectors = sectorsResult.rows
            .filter(s => s.floor_id === floor.id)
            .map(sector => {
              const rows = rowsResult.rows.filter(r => r.sector_id === sector.id);
              return { ...sector, rows };
            });
          return { ...floor, sectors };
        });
      return { ...stand, floors };
    });
    
    res.json({ ...venue, stands });
  } catch (error: any) {
    console.error('Error fetching venue:', error);
    res.status(500).json({ error: 'Failed to fetch venue' });
  }
}

/**
 * Create new venue with full configuration
 */
export async function createVenue(req: Request, res: Response) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      clubId,
      name,
      city,
      address,
      sportId,
      photoUrl,
      capacity,
      stands
    } = req.body;
    
    // Validate required fields
    if (!clubId || !name || !city || !sportId) {
      throw new Error('Missing required fields: clubId, name, city, sportId');
    }
    
    // Create venue
    const venueResult = await client.query(
      `INSERT INTO venues (club_id, name, city, address, sport_id, photo_url, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [clubId, name, city, address || null, sportId, photoUrl || null, capacity || 0]
    );
    
    const venue = venueResult.rows[0];
    
    // Create stands, floors, sectors, and rows if provided
    if (stands && Array.isArray(stands)) {
      for (const standData of stands) {
        const standResult = await client.query(
          `INSERT INTO stands (venue_id, name, position, color)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [venue.id, standData.name, standData.position, standData.color || '#4CAF50']
        );
        
        const stand = standResult.rows[0];
        
        // Create floors
        if (standData.floors && Array.isArray(standData.floors)) {
          for (const floorData of standData.floors) {
            const floorResult = await client.query(
              `INSERT INTO floors (stand_id, name, floor_number)
               VALUES ($1, $2, $3)
               RETURNING *`,
              [stand.id, floorData.name, floorData.floorNumber]
            );
            
            const floor = floorResult.rows[0];
            
            // Create sectors
            if (floorData.sectors && Array.isArray(floorData.sectors)) {
              for (const sectorData of floorData.sectors) {
                const sectorResult = await client.query(
                  `INSERT INTO sectors (floor_id, name, sector_number, total_seats)
                   VALUES ($1, $2, $3, $4)
                   RETURNING *`,
                  [floor.id, sectorData.name, sectorData.sectorNumber, sectorData.totalSeats || 0]
                );
                
                const sector = sectorResult.rows[0];
                
                // Create rows
                if (sectorData.rows && Array.isArray(sectorData.rows)) {
                  for (const rowData of sectorData.rows) {
                    await client.query(
                      `INSERT INTO rows (sector_id, name, row_number, seats_count)
                       VALUES ($1, $2, $3, $4)`,
                      [sector.id, rowData.name, rowData.rowNumber, rowData.seatsCount || 0]
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
    
    await client.query('COMMIT');
    
    // Fetch the complete venue with nested structure
    const completeVenueResult = await pool.query(
      `SELECT v.*, s.name as sport_name, s.code as sport_code
       FROM venues v
       LEFT JOIN sports s ON v.sport_id = s.id
       WHERE v.id = $1`,
      [venue.id]
    );
    
    res.status(201).json(completeVenueResult.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating venue:', error);
    res.status(400).json({ error: error.message || 'Failed to create venue' });
  } finally {
    client.release();
  }
}

/**
 * Update venue with full configuration
 */
export async function updateVenue(req: Request, res: Response) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const {
      name,
      city,
      address,
      sportId,
      photoUrl,
      capacity,
      stands
    } = req.body;
    
    // Update venue basic info
    await client.query(
      `UPDATE venues 
       SET name = COALESCE($1, name),
           city = COALESCE($2, city),
           address = COALESCE($3, address),
           sport_id = COALESCE($4, sport_id),
           photo_url = COALESCE($5, photo_url),
           capacity = COALESCE($6, capacity)
       WHERE id = $7`,
      [name, city, address, sportId, photoUrl, capacity, id]
    );
    
    // If stands are provided, delete existing and recreate
    if (stands && Array.isArray(stands)) {
      // Delete existing stands (cascade will handle floors, sectors, rows)
      await client.query('DELETE FROM stands WHERE venue_id = $1', [id]);
      
      // Recreate stands structure (same logic as create)
      for (const standData of stands) {
        const standResult = await client.query(
          `INSERT INTO stands (venue_id, name, position, color)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [id, standData.name, standData.position, standData.color || '#4CAF50']
        );
        
        const stand = standResult.rows[0];
        
        if (standData.floors && Array.isArray(standData.floors)) {
          for (const floorData of standData.floors) {
            const floorResult = await client.query(
              `INSERT INTO floors (stand_id, name, floor_number)
               VALUES ($1, $2, $3)
               RETURNING *`,
              [stand.id, floorData.name, floorData.floorNumber]
            );
            
            const floor = floorResult.rows[0];
            
            if (floorData.sectors && Array.isArray(floorData.sectors)) {
              for (const sectorData of floorData.sectors) {
                const sectorResult = await client.query(
                  `INSERT INTO sectors (floor_id, name, sector_number, total_seats)
                   VALUES ($1, $2, $3, $4)
                   RETURNING *`,
                  [floor.id, sectorData.name, sectorData.sectorNumber, sectorData.totalSeats || 0]
                );
                
                const sector = sectorResult.rows[0];
                
                if (sectorData.rows && Array.isArray(sectorData.rows)) {
                  for (const rowData of sectorData.rows) {
                    await client.query(
                      `INSERT INTO rows (sector_id, name, row_number, seats_count)
                       VALUES ($1, $2, $3, $4)`,
                      [sector.id, rowData.name, rowData.rowNumber, rowData.seatsCount || 0]
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
    
    await client.query('COMMIT');
    
    res.json({ message: 'Venue updated successfully' });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error updating venue:', error);
    res.status(400).json({ error: error.message || 'Failed to update venue' });
  } finally {
    client.release();
  }
}

/**
 * Delete venue
 */
export async function deleteVenue(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM venues WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    
    res.json({ message: 'Venue deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting venue:', error);
    res.status(500).json({ error: 'Failed to delete venue' });
  }
}
