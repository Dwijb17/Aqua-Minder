// /src/pages/api/auth/register.js
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, password, name, address, phone } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, name, address, phone) VALUES (?, ?, ?, ?, ?)',
            [email, passwordHash, name, address, phone]
        );

        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
