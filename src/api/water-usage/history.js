// /src/pages/api/water-usage/history.js
import { authenticateToken } from '@/lib/auth';
import pool from '@/lib/db';

export default authenticateToken(async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { device_id, period } = req.query;
        let timeFrame;

        switch (period) {
            case 'week':
                timeFrame = 'INTERVAL 7 DAY';
                break;
            case 'month':
                timeFrame = 'INTERVAL 30 DAY';
                break;
            case 'year':
                timeFrame = 'INTERVAL 1 YEAR';
                break;
            default:
                timeFrame = 'INTERVAL 7 DAY';
        }

        const [usage] = await pool.query(
            `SELECT DATE(timestamp) as date,
              SUM(total_volume) as daily_volume,
              AVG(flow_rate) as avg_flow_rate
       FROM water_usage wu
       JOIN devices d ON wu.device_id = d.id
       WHERE d.user_id = ?
       AND d.device_id = ?
       AND timestamp >= DATE_SUB(NOW(), ${timeFrame})
       GROUP BY DATE(timestamp)
       ORDER BY date DESC`,
            [req.user.userId, device_id]
        );

        res.status(200).json(usage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});