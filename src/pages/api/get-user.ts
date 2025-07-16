import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import pool from "../../lib/dbClient";
import { parse } from "cookie";

export default async function get_user(req: NextApiRequest, res: NextApiResponse){
    console.log('=== DEBUG: Users API called ===');

    if (req.body && req.body.user_data) {
        console.log('=== OPTIMIZED: Using user data from request body ===');
        const user_data = req.body.user_data;
        
        const user_id = user_data.id;
        const username = user_data.display_name;
        const image_url = user_data.images?.[0]?.url;
        
        console.log("=== DEBUG: About to insert into DB ===");
        console.log("User ID:", user_id);
        console.log("Username:", username);
        console.log("Image URL:", image_url);
        
        try {
            await pool.query(
                `INSERT INTO users (user_id, username, image_url) 
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username, image_url = EXCLUDED.image_url`, 
                [user_id, username, image_url]
            );
            console.log("=== SUCCESS: User inserted into DB ===");
            res.status(200).json({message: "successful db insert"});
        } 
        catch (db_error: any) {
            console.log("=== ERROR: Database insertion failed ===");
            console.log("DB Error:", db_error.message);
            throw db_error;
        }
        return;
    }
    
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    let access_token = cookies.access_token;

    if (!access_token && req.headers.authorization){
        access_token = req.headers.authorization.replace('Bearer ', '')
    }

    console.log('Access token from cookies:', !!cookies.access_token);
    console.log('Access token from headers:', !!req.headers.authorization);
    console.log('Final access token exists:', !!access_token);

    if (!access_token) {
        console.log('ERROR: No access token found');
        return res.status(401).json({error: "no token found"})
    }
    try {
        const user_response = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                "Authorization": "Bearer " + access_token
            }
        });

        const user_data = user_response.data;

        const user_id = user_data.id;
        const username = user_data.display_name;
        const image_url = user_data.images?.[0]?.url;
        
        console.log("=== DEBUG: About to insert into DB ===");
        console.log("User ID:", user_id);
        console.log("Username:", username);
        console.log("Image URL:", image_url);
        
        try {
            await pool.query(
                `INSERT INTO users (user_id, username, image_url) 
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username, image_url = EXCLUDED.image_url`, 
                [user_id, username, image_url]
            );
            console.log("=== SUCCESS: User inserted into DB ===");
            res.status(200).json({message: "successful db insert"});
        } catch (db_error: any) {
            console.log("=== ERROR: Database insertion failed ===");
            console.log("DB Error:", db_error.message);
            throw db_error;
        }
    }
    
    catch (err:any) {
        console.error("failed to fetch user or insert", err.response?.data || err.message);
        res.status(401).json({error: "unauthorized or db error"});

    }
}