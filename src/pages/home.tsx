import GamemodeButton from "@/components/gamemode-button";
import React from "react";
import { GetServerSideProps } from "next";
import axios from "axios";
import { useRouter } from "next/router";
import Image from "next/image";

interface HomeProps {
  isAuthenticated: boolean;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { req } = context;
    const cookies = req.headers.cookie || "";

    const protocol = req.headers.host?.includes("ngrok") ? "https" : "http";
    const baseUrl = `${protocol}://${req.headers.host}`;

    const userResponse = await axios.get(`${baseUrl}/api/get-user`, {
      headers: {
        cookie: cookies,
      },
    });

    const isAuthenticated = !!(
      userResponse.data.user && userResponse.data.user.userId
    );

    return {
      props: {
        isAuthenticated
      },
    };
  } catch (error) {
    console.error("Error checking user authentication:", error);
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
