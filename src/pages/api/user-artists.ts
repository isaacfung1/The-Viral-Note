import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import { supabaseServer } from '../../utils/supabaseServer';

interface SpotifyUser {
    id: string;
    display_name: string;
    email?: string;
    images?: Array<{
      url: string;
      height?: number;
      width?: number;
    }>;
  }

export async function getUserArtists(userData: SpotifyUser, access_token: string, req: NextApiRequest, res: NextApiResponse) {
    const userId = userData.id;
    
    try {
        type RawArtist = {
            id: string;
            name: string;
            images: { url: string; }[]; 
            genres: string[];
            popularity: number;
            timeRange: string;
        }
        type Artist = {
            id: string;
            name: string;
            imageUrl: string;
            genres: string[];
            popularity: number;
            timeRange: string;
        }
        const timeRanges = ['short_term', 'medium_term', 'long_term'];
        const allArtistsData: Artist[] = [];
        
        for (const timeRange of timeRanges) {
            console.log(`=== Fetching artists for ${timeRange} ===`);
            
            const artistsResponse = await axios.get('https://api.spotify.com/v1/me/top/artists', {
                params: {
                    limit: 50,
                    time_range: timeRange,
                    offset: 0
                },
                headers: {
                    'Authorization': 'Bearer ' + access_token
                }
            });

            if (artistsResponse.status !== 200) {
                console.log(`Failed to retrieve ${timeRange} artists`);
                continue;
            }

            const artistsData: RawArtist[] = artistsResponse.data.items;
            console.log(`Got ${artistsData.length} artists for ${timeRange}`);

            const cleanedArtistsData: Artist[]= artistsData.map((artist: RawArtist) => ({
                id: artist.id,
                name: artist.name,
                imageUrl: artist.images?.[0]?.url,
                genres: artist.genres,
                popularity: artist.popularity,
                timeRange: timeRange
            }));

            allArtistsData.push(...cleanedArtistsData);
        }

        console.log(`Total artists collected: ${allArtistsData.length}`);
        
        const seen = new Set();
        const uniqueArtists = [];

        for (const artist of allArtistsData) {
            if (!seen.has(artist.id)) {
                seen.add(artist.id);
                uniqueArtists.push(artist);
            }
        }
        
        console.log(`Unique artists after deduplication: ${uniqueArtists.length}`);

        try {
            const artistsRows = uniqueArtists.map(artist => ({
                artistId: artist.id,
                artistName: artist.name,
                artistImageUrl: artist.imageUrl,
                artistGenres: artist.genres,
                artistPopularity: artist.popularity,
                timeRange: artist.timeRange
            }));

            const userTopArtistsRows = artistsRows.map(artist => ({
                userId: userId,
                artistId: artist.artistId

            }));

            const [{error: artistError}, {error: userTopArtistsError}] = await Promise.all([
                supabaseServer
                .from('artists')
                .upsert(artistsRows, { onConflict: 'artistId'}),

                supabaseServer
                .from('user_top_artists')
                .upsert(userTopArtistsRows, {onConflict: 'userId, artistId', ignoreDuplicates: true})

            ]);

            if (artistError || userTopArtistsError) {
                console.error("Insertion error:", artistError || userTopArtistsError);
                throw artistError || userTopArtistsError;
            }

            res.status(200).json({message: "successful db insert"});
        }
        catch (dbError) {
            console.log("=== ERROR: Database insertion failed ===");
            console.error("DB Error:", dbError);
            res.status(500).json({dbError: "failed to insert artists into db"});
        }
    }
    catch (error) {
        console.error("failed to fetch artists", error);
        res.status(401).json({error: "unauthorized fetching artists"});
    }
}