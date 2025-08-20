import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { parse } from "cookie";
import { serialize } from "cookie";
import { supabaseServer } from "../../utils/supabaseServer";

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

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

interface SpotifyErrorResponse {
    error: {
      status: number;
      message: string;
    };
  }
  
  interface CustomError extends Error {
    response?: {
      status: number;
      data?: SpotifyErrorResponse | unknown;
    };
    status?: number;
    statusCode?: number;
  }

interface UserDataForDB {
  user_id: string;
  username: string;
  image_url: string | null;
  email: string | null;
}

// async function refreshAccessToken(refresh_token: string): Promise<string> {
//   const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
//   const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

//   try {
//     const params = new URLSearchParams({
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token,
//     });

//     const response = await axios.post<SpotifyTokenResponse>('https://accounts.spotify.com/api/token', params, {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//           'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
//         }
//       }
//     );
//     return response.data.access_token;
//   } catch (error) {
//     console.error("Failed to refresh access token:", error);
//     throw error;
//   }
// }

export async function handleUserData(userData: SpotifyUser, refresh_token: string, res: NextApiResponse) {
  const userDataForDB: UserDataForDB = {
    user_id: userData.id,
    username: userData.display_name,
    image_url: userData.images?.[0]?.url || null,
    email: userData.email || null,
  };

  console.log("=== DEBUG: Inserting user into DB ===");
  console.log("User ID:", userDataForDB.user_id);
  console.log("Username:", userDataForDB.username);

  try {
    const { error: userError } = await supabaseServer
      .from('users')
      .upsert({...userDataForDB, refresh_token}, { onConflict: 'user_id' });

    if (userError) {
      console.error("Supabase error:", userError.message);
      throw userError;
    }

    console.log("=== SUCCESS: User inserted into DB ===");
    return res.status(200).json({
      message: "successful db insert",
      user: { userId: userDataForDB.user_id }
    });
  } catch (dbError) {
    console.log("=== ERROR: Database insertion failed ===");
    console.log("DB Error:", dbError);
    return res.status(500).json({ error: "Database operation failed" });
  }
}

// async function handleTokenError(error: CustomError, req: NextApiRequest, res: NextApiResponse) {
//   if (error.response?.status === 401) {
//     try {
//       const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
//       const refresh_token = cookies.refresh_token;

//       if (!refresh_token) {
//         console.error('No refresh token available');
//         return res.status(401).json({ error: "Session expired, please re-authenticate" });
//       }

//       const newAccessToken = await refreshAccessToken(refresh_token);

//       res.setHeader('Set-Cookie', serialize('access_token', newAccessToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'lax',
//         path: '/',
//         maxAge: 36000
//       }));

//       const userResponse = await axios.get<SpotifyUser>("https://api.spotify.com/v1/me", {
//         headers: {
//           "Authorization": `Bearer ${newAccessToken}`
//         }
//       });

//       return await handleUserData(userResponse.data, res);
//     } catch (refreshError) {
//       console.error('Token refresh failed:', refreshError);
//       return res.status(401).json({ 
//         error: "Authentication failed",
//         action: "Please re-login to Spotify"
//       });
//     }
//   }

//   console.error("Failed to fetch user:", error.response?.status || error.message);
//   return res.status(error.response?.status || 500).json({ 
//     error: "Failed to fetch user data" 
//   });
// }