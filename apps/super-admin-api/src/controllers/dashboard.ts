import { Request, Response } from 'express';
import pool from '../db';

export async function getStats(req: Request, res: Response) {
    try {
        // Run queries in parallel for performance
        const [
            clubsResult,
            usersResult,
            venuesResult,
            recentClubsResult
        ] = await Promise.all([
            // Total and Active Clubs
            pool.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN is_active THEN 1 END) as active
                FROM clubs 
                WHERE deleted_at IS NULL
            `),

            // Total Users
            pool.query('SELECT COUNT(*) as total FROM users'),

            // Total Venues
            pool.query('SELECT COUNT(*) as total FROM venues'),

            // Recent Clubs (last 5)
            pool.query(`
                SELECT c.id, c.name, co.name as country, c.created_at, c.logo_url
                FROM clubs c
                LEFT JOIN countries co ON c.country_id = co.id
                WHERE c.deleted_at IS NULL
                ORDER BY c.created_at DESC 
                LIMIT 5
            `)
        ]);

        const stats = {
            clubs: {
                total: parseInt(clubsResult.rows[0].total),
                active: parseInt(clubsResult.rows[0].active)
            },
            users: {
                total: parseInt(usersResult.rows[0].total)
            },
            venues: {
                total: parseInt(venuesResult.rows[0].total)
            },
            recentClubs: recentClubsResult.rows.map(club => ({
                id: club.id,
                name: club.name,
                city: 'Multiple Locations', // Clubs operate in multiple venues/cities
                country: club.country || 'Unknown',
                createdAt: club.created_at,
                logoUrl: club.logo_url
            }))
        };

        // Wait, looking at init.sql schema earlier:
        // Clubs table: id, name, short_name, slug, keycloak_realm_id, stripe_account_id, logo_url, country_id, is_active...
        // It does NOT have 'city' directly. Venues has city. 
        // I should fix the query to be accurate to the schema.
        // Joining with countries to get country name.

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
}
