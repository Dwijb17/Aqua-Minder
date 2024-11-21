// /src/pages/api/leaks/report.js
import { authenticateToken } from '@/lib/auth';
import pool from '@/lib/db';

export default authenticateToken(async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { device_id, severity, estimated_loss } = req.body;

        // Verify device belongs to user
        const [devices] = await pool.query(
            'SELECT id FROM devices WHERE device_id = ? AND user_id = ?',
            [device_id, req.user.userId]
        );

        if (devices.length === 0) {
            return res.status(403).json({ message: 'Device not found or unauthorized' });
        }

        // Report leak
        const [result] = await pool.query(
            'INSERT INTO leaks (device_id, severity, estimated_loss) VALUES (?, ?, ?)',
            [devices[0].id, severity, estimated_loss]
        );

        res.status(201).json({
            message: 'Leak reported successfully',
            leakId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
