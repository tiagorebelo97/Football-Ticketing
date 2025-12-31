
const { Pool } = require('pg');

const pool = new Pool({
    user: 'football_user',
    host: 'localhost',
    database: 'football_ticketing',
    password: 'football_pass',
    port: 5432,
});

async function checkData() {
    const clubId = 'b9bb9b55-fe9e-4bf3-9aa8-34b76b26f185';

    try {
        console.log('--- Checking Sports ---');
        const sports = await pool.query('SELECT * FROM sports');
        console.table(sports.rows);

        console.log('--- Checking Venues for Club ---');
        const venues = await pool.query('SELECT * FROM venues WHERE club_id = $1', [clubId]);
        console.table(venues.rows);

        if (venues.rows.length === 0) {
            console.log('No venues found for this club.');
        }

        console.log('--- Checking Stands Structure ---');
        // Check if total_capacity column exists in stands
        const standsInfo = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'stands' AND column_name = 'total_capacity';
        `);
        if (standsInfo.rows.length > 0) {
            console.log('Found total_capacity column in stands:', standsInfo.rows[0]);
        } else {
            console.error('ERROR: total_capacity column NOT found in stands!');
        }

    } catch (err) {
        console.error('Error checking data:', err);
    } finally {
        await pool.end();
    }
}

checkData();
