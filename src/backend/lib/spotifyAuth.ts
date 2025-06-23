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
            const token = await axios.post('https://accounts.spotify.com/api/token'
                +querystring.stringify({code: code,
                    redirect_uri: 'localhost:3000/callback',
                    grant_type: 'authorization_code'}),{

                headers: {
                    'Authorization': 'Basic' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }

                })
                const {access_token, refresh_token} = token.data;
                
                res.setHeader('Set-Cookie', [
                    serialize('access_token', access_token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
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
                res.redirect('/');
            }
            catch (error) {
                console.error(error);
                return res.redirect('/?error=token_excange_failed');
                
            }
    }

}