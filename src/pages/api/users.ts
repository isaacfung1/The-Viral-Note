import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import pool from "../../lib/dbClient";
import { parse } from "cookie";

export default async function get_user(req: NextApiRequest, res: NextApiResponse){
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    let access_token = cookies.access_token;

    if (!access_token && req.headers.authorization){
        access_token = req.headers.authorization.replace('Bearer ', '')
    }

    if (!access_token) {
        return res.status(401).json({error: "no token found"
        })
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
        console.log("inserting into db:", user_id, username, image_url);
        await pool.query(
            `INSERT INTO users (user_id, username, image_url) 
            VALUES ($1, $2, $3)
            ON CONFLIT (user_id) DO UPDATE SET username = EXCLUDED.username, image_url = EXCLUDED.image_url`, 
            [user_id, username, image_url]
        )
        res.status(200).json({message: "successful db insert"});
    }
    
    catch (err:any) {
        console.error("failed to fetch user or insert", err.response?.data || err.message);
        res.status(401).json({error: "unauthorized or db error"});

    }
}