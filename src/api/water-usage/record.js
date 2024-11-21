// /src/pages/api/water-usage/record.js
import { authenticateToken } from '@/lib/auth';
import pool from '@/lib/db';

export default authenticateToken(async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { device_id, flow_rate, total_volume } = req.body;

        // Verify device belongs to user
        const [devices] = await pool.query(
            'SELECT id FROM devices WHERE device_id = ? AND user_id = ?',
            [device_id, req.user.userId]
        );

        if (devices.length === 0) {
            return res.status(403).json({ message: 'Device not found or unauthorized' });
        }

        // Record water usage
        await pool.query(
            'INSERT INTO water_usage (device_id, flow_rate, total_volume) VALUES (?, ?, ?)',
            [devices[0].id, flow_rate, total_volume]
        );

        res.status(201).json({ message: 'Water usage recorded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
