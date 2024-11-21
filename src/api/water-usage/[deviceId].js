// /src/pages/api/water-usage/[deviceId].js
import pool from '@/lib/db';
import { authenticateToken } from '@/lib/auth';

export default authenticateToken(async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { deviceId } = req.query;
        const [rows] = await pool.query(
            `SELECT * FROM water_usage 
       WHERE device_id = ? 
       ORDER BY timestamp DESC 
       LIMIT 7`,
            [deviceId]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});