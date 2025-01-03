import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

export default async function getUserArtists(req: NextApiRequest, res: NextApiResponse) {
    const userArtists = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        params: {
            type: 'artists',
            limit: 100,
            time_range: 'long_term',
            offset: 0
        },
        headers: {
            'Authorization': 'Bearer ' + req.query.access_token
        }
    })
}