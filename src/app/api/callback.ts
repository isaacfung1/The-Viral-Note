import { NextApiRequest, NextApiResponse } from 'next';
import querystring from 'querystring';
import axios from 'axios';

export default async function callback(req: NextApiRequest, res: NextApiResponse) {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;


    if (state === null) {
        res.redirect('/#' +querystring.stringify({error: 'state_mismatch'}));
    }
    else {
        const auth_options = await axios.post('/callback', {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: 'localhost:3000/callback',
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            }

        })
    }

}