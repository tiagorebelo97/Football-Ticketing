import { Request, Response } from 'express';
import pool from '../db';

export async function getSalesReport(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    const { startDate, endDate } = req.query;
    
    const result = await pool.query(
      `SELECT 
         DATE(t.purchased_at) as date,
         COUNT(*) as tickets_sold,
         SUM(t.price) as total_revenue,
         m.home_team,
         m.away_team
       FROM tickets t
       JOIN matches m ON t.match_id = m.id
       WHERE m.club_id = $1
       AND t.purchased_at BETWEEN $2 AND $3
       GROUP BY DATE(t.purchased_at), m.home_team, m.away_team
       ORDER BY date DESC`,
      [clubId, startDate || '2000-01-01', endDate || '2100-01-01']
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error getting sales report:', error);
    res.status(500).json({ error: 'Failed to get sales report' });
  }
}

export async function getAttendanceReport(req: Request, res: Response) {
  try {
    const { clubId } = req.params;
    
    const result = await pool.query(
      `SELECT 
         m.id,
         m.home_team,
         m.away_team,
         m.match_date,
         m.total_capacity,
         m.current_attendance,
         ROUND((m.current_attendance::decimal / m.total_capacity) * 100, 2) as attendance_percentage
       FROM matches m
       WHERE m.club_id = $1
       AND m.status IN ('ongoing', 'completed')
       ORDER BY m.match_date DESC`,
      [clubId]
    );
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error getting attendance report:', error);
    res.status(500).json({ error: 'Failed to get attendance report' });
  }
}
