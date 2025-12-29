import { Request, Response } from 'express';
import pool from '../db';

export async function getStats(req: Request, res: Response) {
    const { clubId } = req.params;

    if (!clubId) {
        return res.status(400).json({ error: 'Club ID is required' });
    }

    try {
        const results = await Promise.all([
            // 0: Total Members (Active + Pending + NULL, excluding cancelled)
            pool.query(
                'SELECT COUNT(*) as total FROM club_members WHERE club_id = $1 AND (status != \'cancelled\' OR status IS NULL)',
                [clubId]
            ),

            // 1: Upcoming Matches (next 30 days)
            pool.query(
                'SELECT COUNT(*) as total FROM matches WHERE club_id = $1 AND match_date > NOW() AND match_date < NOW() + INTERVAL \'30 days\'',
                [clubId]
            ),

            // 2: Total Revenue (Transactions of type ticket_purchase)
            pool.query(
                'SELECT SUM(amount) as total FROM transactions WHERE club_id = $1 AND type = \'ticket_purchase\' AND status = \'completed\'',
                [clubId]
            ),

            // 3: Active Members
            pool.query(
                'SELECT COUNT(*) as total FROM club_members WHERE club_id = $1 AND status = \'active\'',
                [clubId]
            ),

            // 4: Activity Chart (Last 6 months revenue)
            pool.query(`
                SELECT TO_CHAR(created_at, 'Mon') as month, SUM(amount) as value
                FROM transactions 
                WHERE club_id = $1 
                  AND type = 'ticket_purchase' 
                  AND status = 'completed'
                  AND created_at > NOW() - INTERVAL '6 months'
                GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
                ORDER BY DATE_TRUNC('month', created_at)
            `, [clubId]),

            // 5: Recent Notifications
            pool.query(`
                SELECT * FROM (
                    SELECT 'sale' as type, 'New Ticket Sale' as text, created_at, 'System' as user_name
                    FROM transactions 
                    WHERE club_id = $1 AND status = 'completed'
                    UNION ALL
                    SELECT 'member' as type, 'New Member Joined' as text, created_at, first_name || ' ' || last_name as user_name
                    FROM club_members 
                    WHERE club_id = $1
                ) as events
                ORDER BY created_at DESC
                LIMIT 5
            `, [clubId]),

            // 6: New Members List
            pool.query(`
                SELECT first_name || ' ' || last_name as name, status, created_at
                FROM club_members
                WHERE club_id = $1
                ORDER BY created_at DESC
                LIMIT 5
            `, [clubId]),

            // 7: Trends - New Members (This Month) - Fixed to include NULL status
            pool.query(`
                SELECT COUNT(*) as total FROM club_members 
                WHERE club_id = $1 
                AND (status != 'cancelled' OR status IS NULL)
                AND created_at >= DATE_TRUNC('month', NOW())
            `, [clubId]),

            // 8: Trends - New Members (Last Month) - Fixed to include NULL status
            pool.query(`
                SELECT COUNT(*) as total FROM club_members 
                WHERE club_id = $1 
                AND (status != 'cancelled' OR status IS NULL)
                AND created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                AND created_at < DATE_TRUNC('month', NOW())
            `, [clubId]),

            // 9: Trends - Revenue (This Month)
            pool.query(`
                SELECT SUM(amount) as total FROM transactions 
                WHERE club_id = $1 AND type = 'ticket_purchase' AND status = 'completed'
                AND created_at >= DATE_TRUNC('month', NOW())
            `, [clubId]),

            // 10: Trends - Revenue (Last Month)
            pool.query(`
                SELECT SUM(amount) as total FROM transactions 
                WHERE club_id = $1 AND type = 'ticket_purchase' AND status = 'completed'
                AND created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                AND created_at < DATE_TRUNC('month', NOW())
            `, [clubId]),

            // 11: Trends - Previous Matches (Past 30 Days)
            pool.query(
                'SELECT COUNT(*) as total FROM matches WHERE club_id = $1 AND match_date < NOW() AND match_date > NOW() - INTERVAL \'30 days\'',
                [clubId]
            ),
        ]);

        // Helper to calculate percentage trend
        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const newMembersThisMonth = parseInt(results[7].rows[0].total) || 0;
        const newMembersLastMonth = parseInt(results[8].rows[0].total) || 0;

        const revenueThisMonth = parseFloat(results[9].rows[0].total) || 0;
        const revenueLastMonth = parseFloat(results[10].rows[0].total) || 0;

        const matchesUpcoming = parseInt(results[1].rows[0].total) || 0;
        const matchesPrevious = parseInt(results[11].rows[0].total) || 0;

        // For matches, we use the raw difference to calculate 'busyness' trend
        const matchTrend = calculateTrend(matchesUpcoming, matchesPrevious);

        const stats = {
            members: {
                total: parseInt(results[0].rows[0].total) || 0,
                active: parseInt(results[3].rows[0].total) || 0,
                trend: {
                    value: calculateTrend(newMembersThisMonth, newMembersLastMonth),
                    isPositive: newMembersThisMonth >= newMembersLastMonth
                }
            },
            matches: {
                upcoming: matchesUpcoming,
                trend: {
                    value: matchTrend,
                    isPositive: matchTrend >= 0
                }
            },
            revenue: {
                total: parseFloat(results[2].rows[0].total) || 0.00,
                trend: {
                    value: calculateTrend(revenueThisMonth, revenueLastMonth),
                    isPositive: revenueThisMonth >= revenueLastMonth
                }
            },
            activity: results[4].rows.map((r: any) => ({ name: r.month, value: parseFloat(r.value) })),
            notifications: results[5].rows.map((r: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                user: r.user_name,
                text: r.text,
                time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: r.type
            })),
            recentMembers: results[6].rows.map((r: any) => ({
                name: r.name,
                status: r.status === 'active' ? 'Active' : 'Pending'
            }))
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching club dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
}
