import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import pool from "../../lib/db-client";
import { parse } from "cookie";
import { serialize } from "cookie";

async function refreshAccessToken(refresh_token: string){
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

    try {
        const params = new URLSearchParams({ 
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
        });

        const response = await axios.post('https://accounts.spotify.com/api/token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            }
        });
        return response.data.access_token;
    }
    catch (error) {
        console.error("Failed to refresh access token:", error);
        throw error;
    }
}

export default async function getUser(req: NextApiRequest, res: NextApiResponse){
    console.log('=== DEBUG: Users API called ===');

    if (req.body && req.body.userData) {
        console.log('=== OPTIMIZED: Using user data from request body ===');
        const userData = req.body.userData;
        
        const userId = userData.id;
        const username = userData.display_name;
        const imageUrl = userData.images?.[0]?.url;
        
        console.log("=== DEBUG: About to insert into DB ===");
        console.log("User ID:", userId);
        console.log("Username:", username);
        console.log("Image URL:", imageUrl);
        
        try {
            await pool.query(
                `INSERT INTO users (user_id, username, image_url) 
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username, image_url = EXCLUDED.image_url`, 
                [userId, username, imageUrl]
            );
            console.log("=== SUCCESS: User inserted into DB ===");
            res.status(200).json({message: "successful db insert"});
        } 
        catch (dbError: any) {
            console.log("=== ERROR: Database insertion failed ===");
            console.log("DB Error:", dbError.message);
            throw dbError;
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
        const userResponse = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                "Authorization": "Bearer " + access_token
            }
        });

        const userData = userResponse.data;

        const userId = userData.id;
        const username = userData.display_name;
        const imageUrl = userData.images?.[0]?.url;
        
        console.log("=== DEBUG: About to insert into DB ===");
        console.log("User ID:", userId);
        console.log("Username:", username);
        console.log("Image URL:", imageUrl);
        
        try {
            await pool.query(
                `INSERT INTO users (user_id, username, image_url) 
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username, image_url = EXCLUDED.image_url`, 
                [userId, username, imageUrl]
            );
            console.log("=== SUCCESS: User inserted into DB ===");
            res.status(200).json({message: "successful db insert",
                user: {userId}
            });
        } 
        catch (dbError: any) {
            console.log("=== ERROR: Database insertion failed ===");
            console.log("DB Error:", dbError.message);
            throw dbError;
        }
    }
    
    catch (err:any) {
        if (err.response?.status === 401) {
            try {
                const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
                const refresh_token = cookies.refresh_token;

                if (refresh_token) {
                    const newAccessToken = await refreshAccessToken(refresh_token);

                    res.setHeader('Set-Cookie', [
                        serialize('access_token', newAccessToken, {
                            httpOnly: true,
                            secure: true,
                            sameSite: 'strict',
                            path: '/',
                            maxAge: 36000
                        })
                    ]);

                    const userResponse = await axios.get("https://api.spotify.com/v1/me", {
                        headers: {
                            "Authorization": "Bearer " + newAccessToken
                        }
                    });

                    const userData = userResponse.data;
                    const userId = userData.id;
                    const username = userData.display_name;
                    const imageUrl = userData.images?.[0]?.url;
                    
                    console.log("=== DEBUG: About to insert into DB (after token refresh) ===");
                    console.log("User ID:", userId);
                    console.log("Username:", username);
                    console.log("Image URL:", imageUrl);
                    
                    try {
                        await pool.query(
                            `INSERT INTO users (user_id, username, image_url) 
                            VALUES ($1, $2, $3)
                            ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username, image_url = EXCLUDED.image_url`, 
                            [userId, username, imageUrl]
                        );
                        console.log("=== SUCCESS: User inserted into DB (after token refresh) ===");
                        res.status(200).json({message: "successful db insert", user: {userId}});
                        return;
                    } catch (dbError: any) {
                        console.log("=== ERROR: Database insertion failed (after token refresh) ===");
                        console.log("DB Error:", dbError.message);
                        throw dbError;
                    }
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
            }
        }
        
        console.error("failed to fetch user or insert", err.response?.data || err.message);
        res.status(401).json({error: "unauthorized or db error"});
    }
}