import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/dbClient';

export default async function debug_db(req: NextApiRequest, res: NextApiResponse) {
    try {
        const result = await pool.query('SELECT COUNT (*) FROM users')
        const user_count = result.rows[0].count;

        const usersResult = await pool.query('SELECT user_id, username, image_url, created_at FROM users ORDER BY created_at DESC');
        
        res.status(200).json({
            message: "Database connection successful",
            userCount: parseInt(user_count),
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