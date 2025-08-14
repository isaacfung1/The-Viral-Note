import { supabaseServer } from '@/utils/supabaseServer';
import pool from '../../lib/db-client';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function getArtistData(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log('=== DEBUG: api-client called ===');
        const { userData } = req.body;
        const userId = userData || null;
        
        console.log('User ID received:', userId);
        
        if (!userId) {
            console.log('No user ID provided, returning empty data');
            return res.status(200).json({ artistsData: [] });
        }

        console.log('=== Querying user_top_artists ===');
        const { data: artistsId, error: artistsIdError} = await supabaseServer
        .from('user_top_artists')
        .select('artist_id')
        .eq('user_id', userId)

        if (artistsIdError) {
            console.error("error fetching user top artists:", artistsIdError.message);
            throw artistsIdError;
        }

        const availableArtistsId = artistsId ? artistsId.map(r => r.artist_id) : [];

        console.log('=== Querying artists data ===');
        const { data: artistsData, error: artistsDataError } = await supabaseServer
        .from('artists')
        .select('*')
        .in('artist_id', availableArtistsId)

        if (artistsDataError) {
            console.error("error fetching artistsData:", artistsDataError.message);
            throw artistsDataError;
        }

        const gameArtistsData = artistsData.map(artist => ({
            username: artist.name,
            popularity: artist.popularity,
            imageUrl: artist.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=10b981&color=fff&size=200&rounded=true`
        }))
        
        console.log('Artists data prepared:', gameArtistsData.length, 'artists');
        return res.status(200).json({ artistsData: gameArtistsData });
    }
    catch (error: any) {
        console.error("=== ERROR in api-client ===");
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        return res.status(500).json({ error: "Failed to prepare artists data" });
    }
}