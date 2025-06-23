import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

export default async function get_user_artists(req: NextApiRequest, res: NextApiResponse) {
    const user_artists_response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        params: {
            limit: 50,
            time_range: 'long_term',
            offset: 0
        },
        headers: {
            'Authorization': 'Bearer ' + req.query.access_token
        }
    })  



}