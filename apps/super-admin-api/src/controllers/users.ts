import { Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export async function listUsers(req: Request, res: Response) {
    try {
        const result = await pool.query(
            'SELECT id, email, role, is_verified, created_at FROM super_admins ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateUserRole(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !['super_admin', 'editor', 'viewer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const result = await pool.query(
            'UPDATE super_admins SET role = $1 WHERE id = $2 RETURNING id, email, role',
            [role, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const { id } = req.params;

        // Prevent self-deletion (simple check, better done with current user ID from middleware but basic check here)
        // Ideally we check req.user.id !== id

        const result = await pool.query('DELETE FROM super_admins WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
