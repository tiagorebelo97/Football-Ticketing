import { Request, Response } from 'express';
import pool from '../db';

export async function getNFCInventory(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    
    const result = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM nfc_cards
       WHERE club_id = $1
       GROUP BY status`,
      [clubId]
    );
    
    const stockConfig = await pool.query(
      'SELECT * FROM nfc_stock_config WHERE club_id = $1',
      [clubId]
    );
    
    res.json({
      inventory: result.rows,
      config: stockConfig.rows[0] || null,
    });
  } catch (error: any) {
    console.error('Error getting NFC inventory:', error);
    res.status(500).json({ error: 'Failed to get NFC inventory' });
  }
}

export async function addNFCCards(req: Request, res: Response) {
  try {
    const { clubId, cardUids } = req.body;
    
    const insertPromises = cardUids.map((uid: string) =>
      pool.query(
        'INSERT INTO nfc_cards (club_id, card_uid, status) VALUES ($1, $2, $3)',
        [clubId, uid, 'available']
      )
    );
    
    await Promise.all(insertPromises);
    
    // Update stock config
    await pool.query(
      `UPDATE nfc_stock_config
       SET total_cards = total_cards + $1,
           available_cards = available_cards + $1
       WHERE club_id = $2`,
      [cardUids.length, clubId]
    );
    
    res.json({ message: `Added ${cardUids.length} NFC cards` });
  } catch (error: any) {
    console.error('Error adding NFC cards:', error);
    res.status(400).json({ error: error.message || 'Failed to add NFC cards' });
  }
}
