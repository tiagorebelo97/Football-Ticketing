
import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'football_ticketing',
    password: 'postgrespassword',
    port: 5432,
});

async function checkMembers() {
    const clubId = 'b9bb9b55-fe9e-4bf3-9aa8-34b76b26f185'; // fofo club from AuthContext

    try {
        console.log('--- Checking Club Members for Club ID:', clubId, '---');

        // 1. Get raw list of members with status
        const res = await pool.query('SELECT id, first_name, status, created_at FROM club_members WHERE club_id = $1 ORDER BY created_at DESC LIMIT 10', [clubId]);
        console.log('Recent 10 Members:');
        console.table(res.rows);

        // 2. Run the specific counting queries used in dashboard.ts

        // Query 0: Total Members
        const q0 = await pool.query(
            'SELECT COUNT(*) as total FROM club_members WHERE club_id = $1 AND (status != \'cancelled\' OR status IS NULL)',
            [clubId]
        );
        console.log('Query 0 (Total - status != cancelled OR NULL):', q0.rows[0].total);

        // Check counts by status group
        const qGroup = await pool.query('SELECT status, COUNT(*) FROM club_members WHERE club_id = $1 GROUP BY status', [clubId]);
        console.log('Counts by Status:');
        console.table(qGroup.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkMembers();
