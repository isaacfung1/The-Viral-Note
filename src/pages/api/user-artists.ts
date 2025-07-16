import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import pool from '../../lib/dbClient';
import { parse } from 'cookie';

export default async function get_user_artists(req: NextApiRequest, res: NextApiResponse) {
    console.log('=== DEBUG: Artists API called ===');
    
    let user_id: string;
    let access_token: string;

    if (req.body && req.body.user_data) {
        console.log('=== OPTIMIZED: Using user data from request body ===');
        user_id = req.body.user_data.id;

        const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
        access_token = cookies.access_token || '';

        if (!access_token && req.headers.authorization) {
            access_token = req.headers.authorization.replace('Bearer ', '');
        }
    }
    
    else {
        const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
        access_token = cookies.access_token || '';

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
    
        const user_response = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: "Bearer " + access_token
            }
        });
        const user_data = user_response.data;
        user_id = user_data.id;
    }
    try {
        const artists_response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
            params: {
                limit: 50,
                time_range: 'long_term',
                offset: 0
            },
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })  

        if (artists_response.status !== 200) {
            return res.status(401).json({ error: 'unable to retrieve user top artists'});
        }

        const artists_data = artists_response.data.items;

        type Image = {
            url: string;
        };
        type artist = {
            id: string;
            name: string;
            image_url: string;
            images: Image[];
            url: string;
            genres: string[];
            popularity: number;
        }

        const cleaned_artists_data = artists_data.map((artist:artist) => ({
            id: artist.id,
            name: artist.name,
            image_url: artist.images?.[0]?.url,
            genres: artist.genres,
            popularity: artist.popularity
        }));

        try {
            for (const artist of cleaned_artists_data) {
                await pool.query(`INSERT INTO artists (artist_id, name, image_url, genres, popularity) 
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (artist_id) 
                    DO UPDATE SET name = EXCLUDED.name, genres = EXCLUDED.genres, 
                    image_url = EXCLUDED.image_url, popularity = EXCLUDED.popularity`, 
                    [artist.id, artist.name, artist.image_url, artist.genres, artist.popularity]);


                await pool.query(`INSERT INTO user_top_artists (user_id, artist_id) 
                    VALUES ($1, $2)`, [user_id, artist.id]);
            }
            console.log("=== SUCCESS: Artists inserted into DB ===");
            res.status(200).json({message: "successful db insert"});
        }
        catch (db_error: any) {
            console.log("=== ERROR: Database insertion failed ===");
            console.log("DB Error:", db_error.message);
            throw db_error;
        }
    }
    catch (err: any) {
        console.error("failed to fetch artists or insert", err.response?.data || err.message);
        res.status(401).json({error: "unauthorized or db error"});
    }
}