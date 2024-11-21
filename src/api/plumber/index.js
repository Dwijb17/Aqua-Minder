// /src/pages/api/plumbers/index.js
import { authenticateToken } from '@/lib/auth';
import pool from '@/lib/db';

export default authenticateToken(async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const [plumbers] = await pool.query(
            'SELECT id, name, rating, available FROM plumbers WHERE available = true ORDER BY rating DESC'
        );
        res.status(200).json(plumbers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
