import pool from '@/lib/db';
import { authenticateToken } from '@/lib/auth';

export default authenticateToken(async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const [rows] = await pool.query(
            `SELECT l.*, d.device_name 
       FROM leaks l
       JOIN devices d ON l.device_id = d.id
       WHERE l.status = 'ACTIVE'
       ORDER BY l.detected_at DESC`
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});