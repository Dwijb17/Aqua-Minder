import jwt from 'jsonwebtoken';

export function authenticateToken(handler) {
    return async (req, res) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return handler(req, res);
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
}