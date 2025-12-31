
const { Pool } = require('pg');

const pool = new Pool({
    user: 'football_user',
    host: 'localhost',
    database: 'football_ticketing',
    password: 'football_pass',
    port: 5432,
});

async function fixSchema() {
    try {
        console.log('--- Fixing Schema ---');

        // 1. Create Sports Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sports (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                code VARCHAR(50) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created sports table');

        // 2. Add columns to venues
        // Check if sport_id exists
        try {
            await pool.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES sports(id) ON DELETE SET NULL;`);
            console.log('Added sport_id to venues');
        } catch (e) { console.log('sport_id might already exist or error:', e.message); }

        try {
            await pool.query(`ALTER TABLE venues ADD COLUMN IF NOT EXISTS photo_url TEXT;`);
            console.log('Added photo_url to venues');
        } catch (e) { console.log('photo_url might already exist or error:', e.message); }

        // 3. Create Hierarchical Venue Tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS stands (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                position VARCHAR(50) NOT NULL,
                color VARCHAR(50) DEFAULT '#4CAF50',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created stands table');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS floors (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                stand_id UUID NOT NULL REFERENCES stands(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                floor_number INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created floors table');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS sectors (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                sector_number INTEGER NOT NULL,
                total_seats INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created sectors table');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS rows (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                sector_id UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                row_number INTEGER NOT NULL,
                seats_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created rows table');


        // 4. Seed Sports
        const sports = [
            { name: 'Football', code: 'FOOTBALL' },
            { name: 'Basketball', code: 'BASKETBALL' },
            { name: 'Tennis', code: 'TENNIS' },
            { name: 'Volleyball', code: 'VOLLEYBALL' }
        ];

        for (const sport of sports) {
            await pool.query(
                `INSERT INTO sports (name, code) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING`,
                [sport.name, sport.code]
            );
        }
        console.log('Seeded sports');

    } catch (err) {
        console.error('Error fixing schema:', err);
    } finally {
        await pool.end();
    }
}

fixSchema();
