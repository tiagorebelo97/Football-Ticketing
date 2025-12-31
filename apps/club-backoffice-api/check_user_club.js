
const { Pool } = require('pg');

const pool = new Pool({
    user: 'football_user',
    host: 'localhost',
    database: 'football_ticketing',
    password: 'football_pass',
    port: 5432,
});

async function checkUserAndClub() {
    try {
        console.log('--- Checking User tiago@cube.com ---');
        const userRes = await pool.query("SELECT * FROM users WHERE email = 'tiago@cube.com'");
        if (userRes.rows.length > 0) {
            console.log('User found:', userRes.rows[0]);
            const clubId = userRes.rows[0].club_id;
            if (clubId) {
                console.log('--- Checking Club for ID:', clubId, '---');
                const clubRes = await pool.query('SELECT * FROM clubs WHERE id = $1', [clubId]);
                console.log('Club:', clubRes.rows[0]);
            } else {
                console.log('User has no club_id assigned.');
            }
        } else {
            console.log('User tiago@cube.com NOT found!');
        }

        console.log('--- Checking "Sporting Clube de Portugal" ---');
        const scpRes = await pool.query("SELECT * FROM clubs WHERE name ILIKE '%Sporting Clube de Portugal%'");
        if (scpRes.rows.length > 0) {
            console.log('Sporting Club found:', scpRes.rows[0]);
        } else {
            console.log('"Sporting Clube de Portugal" NOT found!');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkUserAndClub();
