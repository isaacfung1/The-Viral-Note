import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import axios, { AxiosError } from 'axios';
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

// interface SpotifyTokenResponse {
//   access_token: string;
//   token_type: string;
//   expires_in: number;
//   refresh_token?: string;
//   scope?: string;
// }

// interface SpotifyErrorResponse {
//     error: {
//       status: number;
//       message: string;
//     };
//   }
  
//   interface CustomError extends Error {
//     response?: {
//       status: number;
//       data?: SpotifyErrorResponse | unknown;
//     };
//     status?: number;
//     statusCode?: number;
//   }

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

async function handleUserData(userData: SpotifyUser, refresh_token: string)
: Promise<{ success: boolean; user?: { userId: string }; error?: string }> {
  
  console.log("=== DEBUG: Raw userData received ===");
  console.log("userData keys:", userData ? Object.keys(userData) : 'userData is null/undefined');
  console.log("userData:", JSON.stringify(userData, null, 2));
  
  if (!userData || !userData.id || !userData.display_name) {
    console.error("=== ERROR: Invalid userData received ===");
    return { 
      success: false, 
      error: "Invalid user data received from Spotify API" 
    };
  }

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
      console.error("Supabase error:", userError);
      return { success: false, error: userError.message };
    }

    console.log("=== SUCCESS: User inserted into DB ===");
    return {
      success: true,
      user: { userId: userDataForDB.user_id }
    };
  } catch (dbError) {
    console.log("=== ERROR: Database insertion failed ===");
    

    let errorMessage = 'Unknown database error';
    let errorDetails = '';
    
    if (dbError instanceof Error) {
      errorMessage = dbError.message;
      errorDetails = dbError.name;
    } 
    else if (typeof dbError === 'string') {
      errorMessage = dbError;
    } 
    else if (dbError && typeof dbError === 'object') {

      if ('message' in dbError) {
        errorMessage = String(dbError.message);
      }
      if ('code' in dbError) {
        errorDetails += ` Code: ${dbError.code}`;
      }
    }
    
    console.log("DB Error message:", errorMessage);
    console.log("DB Error details:", errorDetails);
    
    return { success: false, error: errorMessage };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      console.log("=== DEBUG: GET /api/get-user called ===");
      
      const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
      console.log("Parsed cookies:", Object.keys(cookies));
      console.log("All cookie values:", cookies);
      
      const access_token = cookies.access_token;
      const refresh_token = cookies.refresh_token;
  
      console.log("Access token exists:", !!access_token);
      console.log("Access token value (first 20 chars):", access_token ? access_token.substring(0, 20) + '...' : 'null');
      console.log("Refresh token exists:", !!refresh_token);
  
      if (!access_token) {
        console.log("No access token found in cookies");
        return res.status(401).json({ 
          error: 'No access token found',
          isAuthenticated: false,
          debug: {
            cookiesFound: Object.keys(cookies),
            rawCookie: req.headers.cookie
          }
        });
      }
  
      const spotifyUserResponse = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          "Authorization": `Bearer ${access_token}`
        }
      });
  
      const userData = spotifyUserResponse.data;
      console.log("=== DEBUG: Spotify user data fetched ===");
      console.log("User ID:", userData.id);
      console.log("Display name:", userData.display_name);
  
      if (refresh_token) {
        const result = await handleUserData(userData, refresh_token);
        if (!result.success) {
          console.error("Failed to handle user data:", result.error);
        }
      }
  
      return res.status(200).json({
        user: {
          userId: userData.id,
          username: userData.display_name,
          email: userData.email,
          image: userData.images?.[0]?.url || null
        },
        isAuthenticated: true
      });
  
    } catch (error: unknown) {
      console.log("=== ERROR: Failed to get user data ===");
      
      if (error instanceof AxiosError) {
        console.log("Axios error:", error.message);
        
        if (error.response?.status === 401) {
          console.log("Token expired or invalid");
          return res.status(401).json({ 
            error: 'Token expired',
            isAuthenticated: false 
          });
        }
      } else if (error instanceof Error) {
        console.log("Generic error:", error.message);
      }
  
      return res.status(500).json({ 
        error: 'Failed to fetch user data',
        isAuthenticated: false 
      });
    }
  }
  

  export { handleUserData };

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