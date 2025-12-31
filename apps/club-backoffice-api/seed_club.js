
const { Pool } = require('pg');

const pool = new Pool({
    user: 'football_user',
    host: 'localhost',
    database: 'football_ticketing',
    password: 'football_pass',
    port: 5432,
});

async function seedClub() {
    const clubId = 'b9bb9b55-fe9e-4bf3-9aa8-34b76b26f185';

    try {
        console.log('--- Seeding Club ---');
        // Check if exists
        const check = await pool.query('SELECT id FROM clubs WHERE id = $1', [clubId]);
        if (check.rows.length > 0) {
            console.log('Club already exists.');
            return;
        }

        // Insert club
        // Note: Using some default values for required fields
        const query = `
            INSERT INTO clubs (
                id, name, slug, logo_url, keycloak_realm_id, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, NOW(), NOW()
            ) RETURNING *;
        `;
        const values = [
            clubId,
            'Fofo Club',
            'fofo-club',
            'https://via.placeholder.com/150', // Placeholder logo
            'football-ticketing', // Dummy realm ID
        ];

        const res = await pool.query(query, values);
        console.log('Club created:', res.rows[0]);

    } catch (err) {
        console.error('Error seeding club:', err);
    } finally {
        await pool.end();
    }
}

seedClub();
