import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import pool from '../../lib/db-client';
import { parse } from 'cookie';

export default async function getUserArtists(req: NextApiRequest, res: NextApiResponse) {
    console.log('=== DEBUG: Artists API called ===');
    
    let userId: string;
    let access_token: string;

    if (req.body && req.body.userData) {
        console.log('=== OPTIMIZED: Using user data from request body ===');
        userId = req.body.userData.id;

        access_token = req.body.access_token;
        
        if (!access_token) {
            const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
            access_token = cookies.access_token || '';
        }

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
    
        const userResponse = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: "Bearer " + access_token
            }
        });
        const userData = userResponse.data;
        userId = userData.id;
    }
    try {
        const artistsResponse = await axios.get('https://api.spotify.com/v1/me/top/artists', {
            params: {
                limit: 50,
                time_range: 'long_term',
                offset: 0
            },
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })  

        if (artistsResponse.status !== 200) {
            return res.status(401).json({ error: 'unable to retrieve user top artists'});
        }

        const artistsData = artistsResponse.data.items;

        type Image = {
            url: string;
        };
        type artist = {
            id: string;
            name: string;
            imageUrl: string;
            images: Image[];
            url: string;
            genres: string[];
            popularity: number;
        }

        const cleanedArtistsData = artistsData.map((artist:artist) => ({
            id: artist.id,
            name: artist.name,
            imageUrl: artist.images?.[0]?.url,
            genres: artist.genres,
            popularity: artist.popularity
        }));

        try {
            for (const artist of cleanedArtistsData) {
                await pool.query(`INSERT INTO artists (artist_id, name, image_url, genres, popularity) 
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (artist_id) 
                    DO UPDATE SET name = EXCLUDED.name, genres = EXCLUDED.genres, 
                    image_url = EXCLUDED.image_url, popularity = EXCLUDED.popularity`, 
                    [artist.id, artist.name, artist.imageUrl, artist.genres, artist.popularity]);


                await pool.query(`INSERT INTO user_top_artists (user_id, artist_id) 
                    VALUES ($1, $2)`, [userId, artist.id]);
            }
            console.log("=== SUCCESS: Artists inserted into DB ===");
            res.status(200).json({message: "successful db insert"});
        }
        catch (dbError: any) {
            console.log("=== ERROR: Database insertion failed ===");
            console.log("DB Error:", dbError.message);
            throw dbError;
        }
    }
    catch (err: any) {
        console.error("failed to fetch artists or insert", err.response?.data || err.message);
        res.status(401).json({error: "unauthorized or db error"});
    }
}