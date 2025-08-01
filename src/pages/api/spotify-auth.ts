import { NextApiRequest, NextApiResponse } from 'next';
import querystring from 'querystring';
import axios from 'axios';
import { serialize } from 'cookie'; 

export default async function spotify_auth(req: NextApiRequest, res: NextApiResponse) {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

    if (state === null) {
        res.redirect('/?error=state_mismatch');
    }
    else {
        try {
            const params = querystring.stringify({code: code,
                redirect_uri: 'https://f533764e37eb.ngrok-free.app/app/api/spotify-auth',
                grant_type: 'authorization_code'})

            const token = await axios.post('https://accounts.spotify.com/api/token', params,{
                headers: {
                    'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },

                })
                const {access_token, refresh_token} = token.data;
                
                res.setHeader('Set-Cookie', [
                    serialize('access_token', access_token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        path: '/',
                        maxAge: 36000
                    }),
                    serialize('refresh_token', refresh_token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        path: '/',
                    }
                    )
                ])
                try {
                    const protocol = req.headers.host?.includes('ngrok') ? 'https' : 'http';
                    const baseUrl = `${protocol}://${req.headers.host}`;

                    console.log('=== DEBUG: About to call users API ===');
                    console.log('Base URL:', baseUrl);
                    console.log('Access token exists:', !!access_token);
                    
                    const user_response = await axios.get("https://api.spotify.com/v1/me", {
                        headers: {
                            "Authorization": "Bearer " + access_token
                        }
                    });
                    const user_data = user_response.data;

                    console.log('=== DEBUG: User data fetched successfully ===');
                    const [userResponse, artistResponse] = await Promise.all([
                        axios.post(`${baseUrl}/api/get-user`, {
                            user_data: user_data,
                            access_token: access_token
                        }),
                        axios.post(`${baseUrl}/api/user-artists`, {
                            user_data: user_data,
                            access_token: access_token
                        })
                    ]);
                    console.log('=== DEBUG: All data stored successfully ===');
                    console.log('User response:', userResponse.data);
                    console.log('Artist response:', artistResponse.data);
                }
                catch (user_error: any) {
                    console.log('=== ERROR: Failed to store data ===');
                    console.log('Error message:', user_error.message);
                    console.log('Error response:', user_error.response?.data);
                }
                res.redirect('/home');
            }
            catch (error) {
                console.error(error);
                return res.redirect('/?error=token_exchange_failed');
            }
    }

}