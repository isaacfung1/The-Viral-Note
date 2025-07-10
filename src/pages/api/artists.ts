import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import pool from '../../lib/dbClient';

export default async function get_artists(req: NextApiRequest, res: NextApiResponse) {
    const artists_response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        params: {
            limit: 50,
            time_range: 'long_term',
            offset: 0
        },
        headers: {
            'Authorization': 'Bearer ' + req.query.access_token
        }
    })  

    if (artists_response.status !== 200) {
        return res.status(401).json({ error: 'unable to retrieve user top artists'});
    }

    const artists_data = artists_response.data.items;

    type artist = {
        id: string;
        name: string;
        genres: string[];
        popularity: number;

    }

    const cleaned_artists_data = artists_data.map((artist:artist) => ({
        id: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity
    }));

    for (const artist of cleaned_artists_data) {
        const artist_check = await pool.query("SELECT EXISTS (SELECT 1 FROM artists WHERE artist_id = $1)", [artist.id])
        if (artist_check.rows[0].exists) {
            continue;
        }
        else {
            await pool.query(`INSERT INTO artists (artist_id, name, genres, popularity) VALUES 
                ($1, $2, $3, $4)`, [artist.id, artist.name, artist.genres, artist.popularity]);
        }
    }
}