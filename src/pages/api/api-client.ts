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
        
        const artistsId = await pool.query(`
            SELECT artist_id
            FROM user_top_artists
            WHERE user_id = $1
            GROUP BY artist_id`,
            [userId]
        );
        const availableArtistsId = artistsId.rows.map(r => r.artist_id);
        let artistsData: Array<{username: string, popularity: number, image_url: string}> = []; 

        console.log('=== Querying artists data ===');
        for (const id of availableArtistsId) {
            const data = await pool.query(`
                SELECT name, popularity, image_url
                FROM artists
                WHERE artist_id = $1`,
                [id]
            );
            
            if (data.rows.length > 0) {
                const artist = data.rows[0];
                artistsData.push({
                    username: artist.name,
                    popularity: artist.popularity,
                    image_url: artist.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=10b981&color=fff&size=200&rounded=true`
                });
            }
        }
        
        console.log('Artists data prepared:', artistsData.length, 'artists');
        return res.status(200).json({ artistsData: artistsData });
    }
    catch (error: any) {
        console.error("=== ERROR in api-client ===");
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        return res.status(500).json({ error: "Failed to prepare artists data" });
    }
}