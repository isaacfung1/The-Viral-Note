import GamemodeButton from "@/components/gamemode-button";
import React from "react";
import { GetServerSideProps } from "next";
import axios from "axios";
import { AxiosError } from "axios";
import { useRouter } from "next/router";
import Image from "next/image";
import { parse } from 'cookie';

interface HomeProps {
  isAuthenticated: boolean;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
      const { req } = context;
      
      console.log("=== DEBUG: getServerSideProps called ===");
      console.log("Request URL:", req.url);
      console.log("Raw cookies:", req.headers.cookie);
  
      const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
      
    if (!cookies) {
        console.log("No cookies found, user not authenticated");
        return {
          props: {
            isAuthenticated: false
          },
        };
      }

      const access_token = cookies.access_token;
      const refresh_token = cookies.refresh_token;
  
      console.log("Access token exists:", !!access_token);
      console.log("Refresh token exists:", !!refresh_token);
  
      if (!access_token) {
        console.log("No access token found, user not authenticated");
        return {
          props: {
            isAuthenticated: false
          },
        };
      }
  
      try {
        console.log("Validating access token with Spotify API...");
        
        const spotifyResponse = await axios.get("https://api.spotify.com/v1/me", {
          headers: {
            "Authorization": `Bearer ${access_token}`
          },
          timeout: 5000
        });
  
        console.log("Spotify API response status:", spotifyResponse.status);
        console.log("User ID from Spotify:", spotifyResponse.data.id);
  
        return {
          props: {
            isAuthenticated: true,
            user: {
              userId: spotifyResponse.data.id,
              username: spotifyResponse.data.display_name,
              email: spotifyResponse.data.email,
              image: spotifyResponse.data.images?.[0]?.url || null
            }
          },
        };
  
      } catch (spotifyError : unknown) {
        if (spotifyError instanceof AxiosError) {
            console.error("Spotify API validation failed:", spotifyError.message);

            if (spotifyError.response?.status === 401 && refresh_token) {
            console.log("Access token expired, using refresh token - user needs to re-authenticate");
            }
        }
    
        return {
        props: {
            isAuthenticated: false
        },
        };
      }
  
    } catch (error) {
      console.error("=== ERROR: getServerSideProps failed ===");
      console.error("Error message:", error instanceof Error? error.message : "Unknown error");
      console.error("Error stack:", error instanceof Error? error.stack : "No stack trace available");
      
      return {
        props: {
          isAuthenticated: false
        },
      };
    }
  };

export default function Home({ isAuthenticated }: HomeProps) {
  const router = useRouter();
  return (
    <div className="w-screen h-screen flex flex-row justify-center items-center bg-spotifyGray">
        <button className="absolute flex top-0 left-0 gap-1 mt-[1rem] ml-[1rem]" onClick={()=>{router.push('/')}}>
            <h2 className="text-white font-gotham text-xl shadow-lg mt-1">The Viral Note</h2>
            <Image className="" src={"/media/spotifylogo.svg"} alt={"Spotify Logo"} width={40} height={40}/>
        </button>
      <h1 className="absolute top-0 mt-[2rem] text-4xl font-gotham text-white">
        Gamemodes
      </h1>
      <div className="flex flex-col gap-[3rem]">
        {isAuthenticated ? (
          <>
            <GamemodeButton onClick={() => router.push("/userartists")}>
              User Top Artists 👤 👤
              <span className="text-green-400 text-xs block mt-1">
                Higher or Lower
              </span>
            </GamemodeButton>
            <GamemodeButton>
              User Top Songs 👤 🎤 🎹 (wip)
              <span className="text-green-400 text-xs block mt-1">
                Higher or Lower
              </span>
            </GamemodeButton>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-[3rem]">
              <div
                className="border-solid border-2 border-gray-500 text-gray-500 
                                        font-bold py-4 px-[13rem] rounded-full text-xl font-gotham text-center opacity-50 cursor-not-allowed"
              >
                User Top Artists 👤 👤
                <span className="text-red-400 text-xs block mt-1">
                  Login required
                </span>
              </div>

              <div
                className="border-solid border-2 border-gray-500 text-gray-500 
                                        font-bold py-4 px-[13rem] rounded-full text-xl font-gotham text-center opacity-50 cursor-not-allowed"
              >
                User Top Songs 👤 🎤 🎹
                <span className="text-red-400 text-xs block mt-1">
                  Login required
                </span>
              </div>
            </div>
          </>
        )}
        <GamemodeButton>
          Random Songs 🎤 🎹 (wip)
          <span className="text-green-400 text-xs block mt-1">
            Higher or Lower
          </span>
        </GamemodeButton>
        <GamemodeButton>
          Random Artists 👤 (wip)
          <span className="text-green-400 text-xs block mt-1">
            Higher or Lower
          </span>
        </GamemodeButton>
      </div>
    </div>
  );
}
