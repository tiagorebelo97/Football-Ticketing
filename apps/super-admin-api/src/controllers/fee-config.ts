import { Request, Response } from 'express';
import { feeConfigSchema } from '@football-ticketing/shared';
import pool from '../db';

export async function configureFees(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    const validatedData = feeConfigSchema.parse(req.body);
    
    const result = await pool.query(
      `INSERT INTO fee_config (club_id, platform_fee_percentage, transaction_fee_fixed)
       VALUES ($1, $2, $3)
       ON CONFLICT (club_id) DO UPDATE
       SET platform_fee_percentage = $2, transaction_fee_fixed = $3
       RETURNING *`,
      [clubId, validatedData.platformFeePercentage, validatedData.transactionFeeFixed]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error configuring fees:', error);
    res.status(400).json({ error: error.message || 'Failed to configure fees' });
  }
}

export async function getFees(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    const result = await pool.query(
      'SELECT * FROM fee_config WHERE club_id = $1',
      [clubId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fee configuration not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error getting fees:', error);
    res.status(500).json({ error: 'Failed to get fees' });
  }
}
