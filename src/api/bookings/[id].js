// /src/pages/api/bookings/[id].js
import { authenticateToken } from '@/lib/auth';
import pool from '@/lib/db';

export default authenticateToken(async function handler(req, res) {
    const { id } = req.query;

    switch (req.method) {
        case 'GET':
            try {
                const [bookings] = await pool.query(
                    `SELECT b.*, p.name as plumber_name, p.phone as plumber_phone
           FROM bookings b
           JOIN plumbers p ON b.plumber_id = p.id
           WHERE b.id = ? AND b.user_id = ?`,
                    [id, req.user.userId]
                );

                if (bookings.length === 0) {
                    return res.status(404).json({ message: 'Booking not found' });
                }

                res.status(200).json(bookings[0]);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
            break;

        case 'PUT':
            try {
                const { status } = req.body;

                // Update booking status
                await pool.query(
                    'UPDATE bookings SET status = ? WHERE id = ? AND user_id = ?',
                    [status, id, req.user.userId]
                );

                // If booking is completed or cancelled, make plumber available again
                if (status === 'COMPLETED' || status === 'CANCELLED') {
                    const [bookings] = await pool.query(
                        'SELECT plumber_id FROM bookings WHERE id = ?',
                        [id]
                    );

                    if (bookings.length > 0) {
                        await pool.query(
                            'UPDATE plumbers SET available = true WHERE id = ?',
                            [bookings[0].plumber_id]
                        );
                    }
                }

                res.status(200).json({ message: 'Booking updated successfully' });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error' });
            }
            break;

        default:
            res.status(405).json({ message: 'Method not allowed' });
    }
});