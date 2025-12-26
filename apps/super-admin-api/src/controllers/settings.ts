import { Request, Response } from 'express';
import pool from '../db';

// Get all settings
export async function getSettings(req: Request, res: Response) {
    try {
        const result = await pool.query(
            'SELECT setting_key, setting_value, description, updated_at FROM system_settings ORDER BY setting_key'
        );

        // Convert to key-value object for easier frontend consumption
        const settings: Record<string, any> = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = {
                value: row.setting_value,
                description: row.description,
                updated_at: row.updated_at
            };
        });

        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
}

// Update a specific setting
export async function updateSetting(req: Request, res: Response) {
    try {
        const { key } = req.params;
        const { value } = req.body;
        const userId = (req as any).user?.id;

        if (!value) {
            return res.status(400).json({ error: 'Value is required' });
        }

        const result = await pool.query(
            `UPDATE system_settings 
             SET setting_value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE setting_key = $3 
             RETURNING setting_key, setting_value, description, updated_at`,
            [value, userId, key]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        res.json({
            key: result.rows[0].setting_key,
            value: result.rows[0].setting_value,
            description: result.rows[0].description,
            updated_at: result.rows[0].updated_at
        });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: 'Failed to update setting' });
    }
}
