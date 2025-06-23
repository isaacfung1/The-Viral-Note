import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function get_user(req: NextApiRequest, res: NextApiResponse){
    const user_response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization": "Bearer " + req.query.access_token
        }
    });

    const { id } = user_response.data

}