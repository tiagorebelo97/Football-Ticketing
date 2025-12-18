import { Request, Response } from 'express';
import { clubCreateSchema } from '@football-ticketing/shared';
import { createClub, provisionKeycloakRealm, provisionStripeAccount } from '../services/club-service';
import pool from '../db';

export async function provisionClub(req: Request, res: Response) {
  try {
    const validatedData = clubCreateSchema.parse(req.body);
    
    // Create Keycloak realm
    const keycloakRealmId = await provisionKeycloakRealm(validatedData.slug);
    
    // Create Stripe connected account
    const stripeAccountId = await provisionStripeAccount(validatedData.name, validatedData.slug);
    
    // Create club in database
    const club = await createClub({
      ...validatedData,
      keycloakRealmId,
      stripeAccountId,
    });
    
    res.status(201).json(club);
  } catch (error: any) {
    console.error('Error provisioning club:', error);
    res.status(400).json({ error: error.message || 'Failed to provision club' });
  }
}

export async function listClubs(req: Request, res: Response) {
  try {
    const result = await pool.query('SELECT * FROM clubs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error listing clubs:', error);
    res.status(500).json({ error: 'Failed to list clubs' });
  }
}

export async function getClub(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    const result = await pool.query('SELECT * FROM clubs WHERE id = $1', [clubId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error getting club:', error);
    res.status(500).json({ error: 'Failed to get club' });
  }
}

export async function updateClub(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    const { name, logoUrl, primaryColor, secondaryColor, isActive } = req.body;
    
    const result = await pool.query(
      `UPDATE clubs 
       SET name = COALESCE($1, name),
           logo_url = COALESCE($2, logo_url),
           primary_color = COALESCE($3, primary_color),
           secondary_color = COALESCE($4, secondary_color),
           is_active = COALESCE($5, is_active)
       WHERE id = $6
       RETURNING *`,
      [name, logoUrl, primaryColor, secondaryColor, isActive, clubId]
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
