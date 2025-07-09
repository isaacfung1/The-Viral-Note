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
                redirect_uri: 'https://a35103c42c94.ngrok-free.app/api/spotifyAuth',
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
                    const base_url = req.headers.host?.includes('ngrok')
                        ? `https://${req.headers.host}`
                        : `http://${req.headers.host}`;

                    await axios.get(`${base_url}/api/users`, {
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        }
                    });
                    console.log('user data successfully stored in db');
                }
                catch (user_error) {
                    console.error('failed to store user data in db:', user_error);
                }
                res.redirect('/');
            }
            catch (error) {
                console.error(error);
                return res.redirect('/?error=token_exchange_failed');
            }
    }

}