import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import pool from "../../lib/dbClient";

export default async function get_user(req: NextApiRequest, res: NextApiResponse){
    const user_response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": "Bearer " + req.query.access_token
        }
    });

    if (user_response.status !== 200) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const user_data = user_response.data;

    const user_id = user_data.id;
    const username = user_data.display_name;
    const image_url = user_data.images[0].url;

    try {
        console.log("inserting into db:", user_id, username, image_url);
        await pool.query(
            `INSERT INTO users (user_id, username, image_url) VALUES ($1, $2, $3)`, [user_id, username, image_url]
        )
        res.status(200).json({message: "successful db insert"});
    }
    catch (error) {
        console.error("db insert error:", error);
        res.status(500).json({erorr: "db insert failed"});
    }
}