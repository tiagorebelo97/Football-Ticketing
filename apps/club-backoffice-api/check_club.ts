
import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'football_ticketing',
    password: 'postgrespassword',
    port: 5432,
});

async function checkClub() {
    const clubId = 'b9bb9b55-fe9e-4bf3-9aa8-34b76b26f185';

    try {
        console.log('--- Checking Club for ID:', clubId, '---');
        const res = await pool.query('SELECT * FROM clubs WHERE id = $1', [clubId]);

        if (res.rows.length > 0) {
            console.log('Club found:', res.rows[0]);
        } else {
            console.log('Club NOT found!');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkClub();
