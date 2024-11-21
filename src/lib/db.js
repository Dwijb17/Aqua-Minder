// /src/lib/db.js
import mysql from 'mysql2/promise';
import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";

const pool = mysql.createPool({
    connectionLimit: 10,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3300,
    queueLimit: 0,
    user: process.env.DB_USER,
    waitForConnections: true
});

export default pool;