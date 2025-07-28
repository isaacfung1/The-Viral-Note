import React from "react";
import { useState } from "react";
import pool from "../lib/dbClient";
import { NextApiRequest } from "next";

export default async function Home(req: NextApiRequest) {
    const user_data = req.body.user_data;
    const user_id = user_data ? user_data.id : null;

    let artists_id = await pool.query(`
        SELECT artist_id
        FROM user_top_artists
        WHERE user_id = $1 `,
        [user_id]
    );

    let artists_username = await pool.query(`
        SELECT username 
        FROM artists
        WHERE artist_id = $1`,
        [])
        
        let available_artists_id = artists_id.rows.map(r => r.artist_id);
        

    const [current, setCurrent] = useState();

    function get_random_artist() {}
    function higher() {}
    function lower() {}

return (
    <div className="w-screen h-screen flex justify-center items-center">
    <div className="h-screen w-screen flex-1 flex flex-row justify-center items-center">
        <h1>{current}</h1>
    </div>
    <div className="h-screen w-screen flex-1 flex flex-col justify-center items-center gap-10">
        <button className="">Higher</button>
        <button>Lower</button>
    </div>
    </div>
);
}
