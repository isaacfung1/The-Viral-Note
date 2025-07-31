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

    const available_artists_id = artists_id.rows.map(r => r.artist_id);

    let artists_data: { [username: string]: number } = {}; 

    for (const id of available_artists_id) {
        const data = await pool.query(`
            SELECT username, popularity
            FROM artists
            WHERE artist_id = $1`,
            [id])
        artists_data[data.rows[0].username] = data.rows[0].popularity
    }

    const initial_artist = get_random_artist();
    const new_artist = get_random_artist();

    const [current_username, set_current_username] = useState(initial_artist ? initial_artist.username : "");
    const [current_popularity, set_current_popularity] = useState(initial_artist ? initial_artist.popularity : 0);

    const [new_username, set_new_username] = useState(new_artist ? new_artist.username : "");
    const [new_popularity, set_new_popularity] = useState(new_artist ? new_artist.popularity : 0);

    function get_random_artist() {
        const artists_username = Object.keys(artists_data);
        if (artists_username.length === 0) {
            console.log("No more artists available");
            // user wins, end game
            return null;
        }
        const random_artist_index = Math.floor(Math.random() * artists_username.length);
        const random_artist = artists_username[random_artist_index];
        const artist_popularity = artists_data[random_artist];
        delete artists_data[random_artist];

        return { username: random_artist, popularity: artist_popularity };
    }

    function update_artist() {
        set_current_username(new_username);
        set_current_popularity(new_popularity);
        let new_artist = get_random_artist();
        if (new_artist) {
            set_new_username(new_artist.username);
            set_new_popularity(new_artist.popularity);
        }
        else {
            return null;
        }
    }

    function higher() {
        if (current_popularity <= new_popularity) {
            update_artist();
        }
    }
    function lower() {
        if (current_popularity >= new_popularity) {
            update_artist();
        }
    }

return (
    <div className="w-screen h-screen flex justify-center items-center">
    <div className="h-screen w-screen flex-1 flex flex-row justify-center items-center">
        <h1>{current_username}</h1>
    </div>
    <div className="h-screen w-screen flex-1 flex flex-col justify-center items-center gap-10">
        <button className="">Higher</button>
        <button>Lower</button>
    </div>
    </div>
);
}
