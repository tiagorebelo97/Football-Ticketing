
const { Pool } = require('pg');

const pool = new Pool({
    user: 'football_user',
    host: 'localhost',
    database: 'football_ticketing',
    password: 'football_pass',
    port: 5432,
});

async function fixStands() {
    try {
        console.log('--- Fixing Stands Schema ---');

        try {
            await pool.query(`ALTER TABLE stands ADD COLUMN IF NOT EXISTS total_capacity INTEGER DEFAULT 0;`);
            console.log('Added total_capacity to stands');
        } catch (e) { console.log('total_capacity might already exist or error:', e.message); }

    } catch (err) {
        console.error('Error fixing stands:', err);
    } finally {
        await pool.end();
    }
}

fixStands();
