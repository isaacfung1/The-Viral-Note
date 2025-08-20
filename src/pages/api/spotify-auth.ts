import { NextApiRequest, NextApiResponse } from 'next';
import querystring from 'querystring';
import axios from 'axios';
import { serialize } from 'cookie';
import { handleUserData } from './get-user'
import { getUserArtists } from './user-artists';

export default async function spotifyAuth(req: NextApiRequest, res: NextApiResponse) {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

    if (state === null) {
        res.redirect('/?error=stateMismatch');
    }
    else {
        try {
            const params = querystring.stringify({code: code,
                redirect_uri: 'https://theviralnote.vercel.app/api/spotify-auth',
                grant_type: 'authorization_code'})

            const token = await axios.post('https://accounts.spotify.com/api/token', params,{
                headers: {
                    'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },

                })

                const {access_token, refresh_token, expires_in} = token.data;

                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Access-Control-Allow-Origin', 'https://theviralnote.vercel.app');
                res.setHeader('Set-Cookie', [
                    serialize('access_token', access_token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                        maxAge: expires_in
                    }),
                    serialize('refresh_token', refresh_token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                        maxAge: 60 * 60 * 24 * 30
                    }
                    )
                ])
                try {
                    console.log('=== DEBUG: About to call users API ===');
                    console.log('Access token exists:', !!access_token);
                    
                    const spotifyUserResponse = await axios.get("https://api.spotify.com/v1/me", {
                        headers: {
                            "Authorization": "Bearer " + access_token
                        }
                    });
                    const userData = spotifyUserResponse.data;


                    console.log('=== DEBUG: User data fetched successfully ===');

                    await Promise.all([
                        handleUserData(userData, refresh_token, res),
                        getUserArtists(userData, access_token, req, res)
                    ]);

                    return res.redirect('/home');
                }
                catch (userError) {
                    console.log('=== ERROR: Failed to store data ===');
                    console.log('Error:', userError);
                    return res.redirect('/home');
                }
            }
            catch (error) {
                console.error(error);
                return res.redirect('/?error=tokenExchangeFailed');
            }
    }

}