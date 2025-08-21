import { NextApiRequest, NextApiResponse } from 'next';
import querystring from 'querystring';
import axios from 'axios';
import { serialize } from 'cookie';
import handleUserData from './get-user'
import getUserArtists from './user-artists';
import { AxiosError } from 'axios';


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
            const params = querystring.stringify({
                code: code,
                redirect_uri: 'https://theviralnote.vercel.app/api/spotify-auth',
                grant_type: 'authorization_code'
            });

            console.log('=== DEBUG: Requesting token from Spotify ===');
            const token = await axios.post('https://accounts.spotify.com/api/token', params, {
                headers: {
                    'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            });

            const { access_token, refresh_token, expires_in } = token.data;
            console.log('=== DEBUG: Token received successfully ===');

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
                })
            ]);

            try {
                console.log('=== DEBUG: About to call Spotify users API ===');
                console.log('Access token exists:', !!access_token);
                
                const spotifyUserResponse = await axios.get("https://api.spotify.com/v1/me", {
                    headers: {
                        "Authorization": "Bearer " + access_token
                    }
                });
                
                const userData = spotifyUserResponse.data;

                console.log('=== DEBUG: Spotify API response received ===');
                console.log('User data keys:', Object.keys(userData));
                console.log('User ID:', userData.id);
                console.log('Display name:', userData.display_name);


                if (!userData.id || !userData.display_name) {
                    console.error('=== ERROR: Missing essential user data from Spotify API ===');
                    console.error('Full response:', JSON.stringify(userData, null, 2));
                    return res.redirect('/home?error=incompleteUserData');
                }

                const [userResult, artistsResult] = await Promise.all([
                    handleUserData(userData, refresh_token),
                    getUserArtists(userData.id, access_token)
                ]);
                
                console.log('=== DEBUG: User operation result ===', userResult);
                console.log('=== DEBUG: Artists operation result ===', artistsResult);
                
                if (!userResult.success || !artistsResult.success) {
                    console.error("User operation failed:", userResult.error);
                    console.error("Artists operation failed:", artistsResult.error);

                    return res.status(500).json({ 
                        error: "Operation failed", 
                        details: {
                            userError: userResult?.error,
                            artistsError: artistsResult?.error
                        }
                    });
                }

                return res.redirect('/home');
            }
            catch (userError: unknown) {
                console.log('=== ERROR: Failed to fetch user data or store data ===');
                
                if (userError instanceof AxiosError) {
                    console.log('Axios error name:', userError.name);
                    console.log('Axios error message:', userError.message);
                    console.log('Axios error code:', userError.code);
                    
                    if (userError.response) {
                        console.log('Spotify API error status:', userError.response.status);
                        console.log('Spotify API error statusText:', userError.response.statusText);
                        console.log('Spotify API error data:', userError.response.data);
                    } else if (userError.request) {
                        console.log('Request was made but no response received');
                        console.log('Request details:', userError.request);
                    }
                } else if (userError instanceof Error) {
                    console.log('Generic error name:', userError.name);
                    console.log('Generic error message:', userError.message);
                    if (userError.stack) {
                        console.log('Error stack:', userError.stack);
                    }
                } else {
                    console.log('Unknown error type:', typeof userError);
                    console.log('Error value:', String(userError));
                }
                
                return res.redirect('/home?error=userDataFailed');
            }
        }
        catch (error: unknown) {
            console.error('=== ERROR: Token exchange failed ===');
            
            if (error instanceof AxiosError) {
                console.error('Axios error name:', error.name);
                console.error('Axios error message:', error.message);
                console.error('Axios error code:', error.code);
                
                if (error.response) {
                    console.error('Token API error status:', error.response.status);
                    console.error('Token API error statusText:', error.response.statusText);
                    console.error('Token API error data:', error.response.data);
                } else if (error.request) {
                    console.error('Token request was made but no response received');
                    console.error('Request details:', error.request);
                }
            } else if (error instanceof Error) {
                console.error('Generic error name:', error.name);
                console.error('Generic error message:', error.message);
                if (error.stack) {
                    console.error('Error stack:', error.stack);
                }
            } else {
                console.error('Unknown error type:', typeof error);
                console.error('Error value:', String(error));
            }
            
            return res.redirect('/?error=tokenExchangeFailed');
        }
    }
}