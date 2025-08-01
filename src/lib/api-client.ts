import pool from './db-client';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function getArtistData(req: NextApiRequest, res: NextApiResponse) {
    const userData = req.body.userData;
    const userId = userData ? userData.id : null;

    let artistsId = await pool.query(`
        SELECT artist_id
        FROM user_top_artists
        WHERE user_id = $1 `,
        [userId]
    );

    const availableArtistsId = artistsId.rows.map(r => r.artist_id);

    let artistsData: { [username: string]: number } = {}; 

    for (const id of availableArtistsId) {
        const data = await pool.query(`
            SELECT username, popularity
            FROM artists
            WHERE artist_id = $1`,
            [id])
        artistsData[data.rows[0].username] = data.rows[0].popularity
    }
    
    try {
        console.log('Artists data prepared:', Object.keys(artistsData).length, 'artists');
        return res.status(200).json({ artistsData: artistsData });
    }
    catch (error: any) {
        console.error("error preparing artists data:", error.message);
        return res.status(500).json({ error: "Failed to prepare artists data" });
    }
}