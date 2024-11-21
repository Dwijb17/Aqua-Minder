// /src/pages/api/bookings/create.js
import { authenticateToken } from '@/lib/auth';
import pool from '@/lib/db';

export default authenticateToken(async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { plumber_id, leak_id, booking_date, booking_time } = req.body;

        // Verify plumber is available
        const [plumbers] = await pool.query(
            'SELECT id FROM plumbers WHERE id = ? AND available = true',
            [plumber_id]
        );

        if (plumbers.length === 0) {
            return res.status(400).json({ message: 'Plumber not available' });
        }

        // Create booking
        const [result] = await pool.query(
            `INSERT INTO bookings (user_id, plumber_id, leak_id, booking_date, booking_time, status)
       VALUES (?, ?, ?, ?, ?, 'PENDING')`,
            [req.user.userId, plumber_id, leak_id, booking_date, booking_time]
        );

        // Update plumber availability
        await pool.query(
            'UPDATE plumbers SET available = false WHERE id = ?',
            [plumber_id]
        );

        res.status(201).json({
            message: 'Booking created successfully',
            bookingId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
