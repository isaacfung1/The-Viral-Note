import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'


const client_id = process.env.CLIENT_ID
var redirect_uri = "localhost:3000/callback"

export default async function(req: NextApiRequest, res: NextApiResponse) {
    const { client_id, response_type, redirect_uri, state, scope } = req.query
    
    const response = await axios.get('/login', {
        params: {
            client_id: client_id,
            response_type: response_type,
            redirect_uri: redirect_uri,
            state: state,
            scope: scope
            
        }
    })
    .then(response=> {
        window.location.href = response.data.redirect_uri
    })
    
    .catch(error => {
        console.log('Error fetching Spotify authorization URL:', error)
    })
}

