// /src/pages/api/devices/index.js
import { authenticateToken } from '@/lib/auth';
import pool from '@/lib/db';

export default authenticateToken(async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            try {
                const [devices] = await pool.query(
                    'SELECT * FROM devices WHERE user_id = ?',
                    [req.user.userId]
                );
                res.status(200).json(devices);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
            break;

        case 'POST':
            try {
                const { device_name, device_id, installation_date } = req.body;
                const [result] = await pool.query(
                    'INSERT INTO devices (user_id, device_name, device_id, installation_date) VALUES (?, ?, ?, ?)',
                    [req.user.userId, device_name, device_id, installation_date]
                );
                res.status(201).json({
                    message: 'Device registered successfully',
                    deviceId: result.insertId
                });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
            break;

        default:
            res.status(405).json({ message: 'Method not allowed' });
    }
});