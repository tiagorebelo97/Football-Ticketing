import { Request, Response } from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export async function listUsers(req: Request, res: Response) {
    try {
        const { role, clubId, query } = req.query;
        let sql = `
            SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.is_verified, 
                   u.club_id, c.name as club_name, u.created_at 
            FROM users u
            LEFT JOIN clubs c ON u.club_id = c.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (role) {
            params.push(role);
            sql += ` AND u.role = $${params.length}`;
        }

        if (clubId) {
            params.push(clubId);
            sql += ` AND u.club_id = $${params.length}`;
        }

        if (query) {
            params.push(`%${query}%`);
            sql += ` AND (u.email ILIKE $${params.length} OR u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length})`;
        }

        sql += ' ORDER BY u.created_at DESC';

        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function createUser(req: Request, res: Response) {
    try {
        const { email, password, role, club_id, first_name, last_name, phone } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password and role are required' });
        }

        // Check if user exists
        const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            `INSERT INTO users (email, password_hash, role, club_id, first_name, last_name, phone, is_verified) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, true) 
             RETURNING id, email, role`,
            [email, passwordHash, role, club_id || null, first_name || null, last_name || null, phone || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { role, club_id, first_name, last_name, phone } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET role = COALESCE($1, role), 
                 club_id = $2, 
                 first_name = COALESCE($3, first_name), 
                 last_name = COALESCE($4, last_name), 
                 phone = COALESCE($5, phone),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 
             RETURNING id, email, role, club_id`,
            [role, club_id || null, first_name || null, last_name || null, phone || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function resetPassword(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
            [passwordHash, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function toggleVerification(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { is_verified } = req.body;

        const result = await pool.query(
            'UPDATE users SET is_verified = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, is_verified',
            [is_verified, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Toggle verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if ((req as any).user && (req as any).user.id === id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
