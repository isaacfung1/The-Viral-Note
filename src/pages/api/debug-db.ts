import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db-client';

export default async function debugDb(req: NextApiRequest, res: NextApiResponse) {
    try {
        const result = await pool.query('SELECT COUNT (*) FROM users')
        const userCount = result.rows[0].count;

        const usersResult = await pool.query('SELECT user_id, username, image_url, created_at FROM users ORDER BY created_at DESC');
        
        res.status(200).json({
            message: "Database connection successful",
            userCount: parseInt(userCount),
            users: usersResult.rows
        });

    } 
    catch (error) {
        console.error("Database debug failed:", error);
        res.status(500).json({
            error: "Database connection failed",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
}