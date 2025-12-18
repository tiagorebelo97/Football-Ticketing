import { Request, Response } from 'express';
import { nfcStockConfigSchema } from '@football-ticketing/shared';
import pool from '../db';

export async function configureNFCStock(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    const validatedData = nfcStockConfigSchema.parse(req.body);
    
    const result = await pool.query(
      `INSERT INTO nfc_stock_config (club_id, total_cards, available_cards, deposit_amount)
       VALUES ($1, $2, $2, $3)
       ON CONFLICT (club_id) DO UPDATE
       SET total_cards = $2, available_cards = $2, deposit_amount = $3
       RETURNING *`,
      [clubId, validatedData.totalCards, validatedData.depositAmount]
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error configuring NFC stock:', error);
    res.status(400).json({ error: error.message || 'Failed to configure NFC stock' });
  }
}

export async function getNFCStock(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    const result = await pool.query(
      'SELECT * FROM nfc_stock_config WHERE club_id = $1',
      [clubId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NFC stock configuration not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error getting NFC stock:', error);
    res.status(500).json({ error: 'Failed to get NFC stock' });
  }
}
