
import { Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Get all users for a club
export async function getClubUsers(req: Request, res: Response) {
    try {
        const { clubId } = req.params;

        const result = await pool.query(
            `SELECT cu.id, cu.email, cu.first_name, cu.last_name, cu.phone, cu.is_active,
                    cu.created_at, cu.updated_at,
                    r.id as role_id, r.name as role_name, r.description as role_description,
                    r.permissions as role_permissions
             FROM club_users cu
             JOIN club_user_roles r ON cu.role_id = r.id
             WHERE cu.club_id = $1
             ORDER BY cu.created_at DESC`,
            [clubId]
        );

        const users = result.rows.map(row => ({
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            phone: row.phone,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            role: {
                id: row.role_id,
                name: row.role_name,
                description: row.role_description,
                permissions: row.role_permissions
            }
        }));

        res.json(users);
    } catch (error: any) {
        console.error('Error fetching club users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}

// Get available roles for a club
export async function getClubRoles(req: Request, res: Response) {
    try {
        const { clubId } = req.params;

        const result = await pool.query(
            `SELECT id, name, description, permissions, is_system_role
             FROM club_user_roles
             WHERE club_id = $1
             ORDER BY is_system_role DESC, name ASC`,
            [clubId]
        );

        const roles = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            permissions: row.permissions,
            isSystemRole: row.is_system_role
        }));

        res.json(roles);
    } catch (error: any) {
        console.error('Error fetching club roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
}

// Create a new user
export async function createClubUser(req: Request, res: Response) {
    try {
        const { clubId } = req.params;
        const { email, firstName, lastName, phone, roleId } = req.body;

        // Validate required fields
        if (!email || !roleId) {
            return res.status(400).json({ error: 'Email and role are required' });
        }

        // Check if email already exists for this club
        const existingUser = await pool.query(
            'SELECT id FROM club_users WHERE club_id = $1 AND email = $2',
            [clubId, email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Verify role belongs to this club
        const roleCheck = await pool.query(
            'SELECT id FROM club_user_roles WHERE id = $1 AND club_id = $2',
            [roleId, clubId]
        );

        if (roleCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid role for this club' });
        }

        // Create the user
        const result = await pool.query(
            `INSERT INTO club_users (club_id, role_id, email, first_name, last_name, phone)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, email, first_name, last_name, phone, is_active, created_at`,
            [clubId, roleId, email, firstName || null, lastName || null, phone || null]
        );

        const newUser = result.rows[0];

        // Fetch role details
        const roleResult = await pool.query(
            'SELECT id, name, description, permissions FROM club_user_roles WHERE id = $1',
            [roleId]
        );

        const role = roleResult.rows[0];

        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.first_name,
            lastName: newUser.last_name,
            phone: newUser.phone,
            isActive: newUser.is_active,
            createdAt: newUser.created_at,
            role: {
                id: role.id,
                name: role.name,
                description: role.description,
                permissions: role.permissions
            }
        });
    } catch (error: any) {
        console.error('Error creating club user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
}

// Update a user
export async function updateClubUser(req: Request, res: Response) {
    try {
        const { clubId, userId } = req.params;
        const { email, firstName, lastName, phone, roleId, isActive } = req.body;

        // Verify user belongs to this club
        const userCheck = await pool.query(
            'SELECT id FROM club_users WHERE id = $1 AND club_id = $2',
            [userId, clubId]
        );

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If roleId is provided, verify it belongs to this club
        if (roleId) {
            const roleCheck = await pool.query(
                'SELECT id FROM club_user_roles WHERE id = $1 AND club_id = $2',
                [roleId, clubId]
            );

            if (roleCheck.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid role for this club' });
            }
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (email !== undefined) {
            updates.push(`email = $${paramCount++}`);
            values.push(email);
        }
        if (firstName !== undefined) {
            updates.push(`first_name = $${paramCount++}`);
            values.push(firstName);
        }
        if (lastName !== undefined) {
            updates.push(`last_name = $${paramCount++}`);
            values.push(lastName);
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramCount++}`);
            values.push(phone);
        }
        if (roleId !== undefined) {
            updates.push(`role_id = $${paramCount++}`);
            values.push(roleId);
        }
        if (isActive !== undefined) {
            updates.push(`is_active = $${paramCount++}`);
            values.push(isActive);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId, clubId);

        const result = await pool.query(
            `UPDATE club_users
             SET ${updates.join(', ')}
             WHERE id = $${paramCount++} AND club_id = $${paramCount++}
             RETURNING id, email, first_name, last_name, phone, is_active, role_id, updated_at`,
            values
        );

        const updatedUser = result.rows[0];

        // Fetch role details
        const roleResult = await pool.query(
            'SELECT id, name, description, permissions FROM club_user_roles WHERE id = $1',
            [updatedUser.role_id]
        );

        const role = roleResult.rows[0];

        res.json({
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.first_name,
            lastName: updatedUser.last_name,
            phone: updatedUser.phone,
            isActive: updatedUser.is_active,
            updatedAt: updatedUser.updated_at,
            role: {
                id: role.id,
                name: role.name,
                description: role.description,
                permissions: role.permissions
            }
        });
    } catch (error: any) {
        console.error('Error updating club user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
}

// Delete a user
export async function deleteClubUser(req: Request, res: Response) {
    try {
        const { clubId, userId } = req.params;

        const result = await pool.query(
            'DELETE FROM club_users WHERE id = $1 AND club_id = $2 RETURNING id',
            [userId, clubId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting club user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
}
