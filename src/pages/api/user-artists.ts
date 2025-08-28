import axios from 'axios';
import { supabaseServer } from '../../utils/supabaseServer';

export default async function getUserArtists(userId: string, access_token: string)
: Promise<{success: boolean; error?: string}> {
    
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
                artist_id: artist.id,
                artist_name: artist.name,
                image_url: artist.imageUrl,
                artist_genres: artist.genres,
                artist_popularity: artist.popularity,
                time_range: artist.timeRange
            }));

            const userTopArtistsRows = artistsRows.map(artist => ({
                user_id: userId,
                artist_id: artist.artist_id

            }));

            const [{error: artistError}, {error: userTopArtistsError}] = await Promise.all([
                supabaseServer
                .from('artists')
                .upsert(artistsRows, { onConflict: 'artist_id'}),

                supabaseServer
                .from('user_top_artists')
                .upsert(userTopArtistsRows, {onConflict: 'user_id, artist_id', ignoreDuplicates: true})

            ]);

            if (artistError || userTopArtistsError) {
                console.error("Insertion error:", artistError || userTopArtistsError);
                throw artistError || userTopArtistsError;
            }

            return { success: true };
        }
        catch (dbError) {
            console.log("=== ERROR: Database insertion failed ===");
            console.error("DB Error:", dbError);
            return {success: false, error: dbError instanceof Error ? dbError.message : 'Unknown error' };
        }
    }
    catch (error) {
        console.error("failed to fetch artists", error);
        return {success: false, error: error instanceof Error ? error.message : 'Unknown error'};
    }
}