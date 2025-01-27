import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';

export default async function getUserArtists(req: NextApiRequest, res: NextApiResponse) {
    const userArtistsResponse = await axios.get('https://api.spotify.com/v1/me/top/artists', {
        params: {
            limit: 50,
            time_range: 'long_term',
            offset: 0
        },
        headers: {
            'Authorization': 'Bearer ' + req.query.access_token
        }
    })  

    const userArtists = userArtistsResponse.data

    var artistCache = {}
    userArtists.artists.forEach(artist => {
        artistCache[artist.name] = artist.popularity
    })
    

}