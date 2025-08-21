import redirectToSpotify from "../pages/api/login";
import VideoBackground from "@/components/video-bg";
import Image from "next/image";
import { GetServerSideProps } from "next";
import axios from "axios";

interface HomeProps {
  isAuthenticated: boolean;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { req } = context;
    const cookies = req.headers.cookie || "";

    const baseUrl = 'https://theviralnote.vercel.app';

    const userResponse = await axios.get(`${baseUrl}/api/get-user`, {
      headers: {
        cookie: cookies,
        'User-Agent': req.headers['user-agent'] || 'NextJS-Server',
      },
      timeout: 10000
    });

    const isAuthenticated = !!(
      userResponse.data.user && userResponse.data.user.userId
    );

    return {
      props: {
        isAuthenticated
      },
    };
  } 
  catch (error) {
    console.error("Error checking user authentication:", error);
    return {
      props: {
        isAuthenticated: false
      },
    };
  }
};

export default function Main({ isAuthenticated }: HomeProps) {
  return (
    <div className="relative min-h-screen flex justify-center items-center">
      <VideoBackground />
      <div className="relative z-10 flex flex-col justify-center items-center text-center">
        <div className="flex flex-row items-center gap-4 mb-[1rem]">
          <h1 className="font-bold text-6xl font-gotham text-white drop-shadow-lg">
            The Viral Note
          </h1>
          <Image
            className=""
            src={"/media/spotifylogo.png"}
            alt={"Spotify Logo"}
            width={100}
            height={100}
          />
        </div>
        {isAuthenticated ? (
          <>
            <button
              onClick={() => (window.location.href = "/home")}
              className="bg-black text-white text-lg font-gotham border-2 border-white font-bold 
                rounded-full transition-all duration-200 transform py-4 px-[5rem] hover:scale-105 shadow-lg
                hover:bg-white hover:text-black"
            >
              Play
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-row gap-5">
              <button
                onClick={redirectToSpotify}
                className="bg-spotifyGreen hover:bg-green-700 text-spotifyGray font-bold py-4 px-5 rounded-full 
                transition-all duration-200 transform hover:scale-105 shadow-lg text-lg font-gotham"
              >
                Login with Spotify
              </button>
              <button
                onClick={() => (window.location.href = "/home")}
                className="bg-black text-white text-lg font-gotham border-2 border-white font-bold 
                rounded-full transition-all duration-200 transform py-4 px-[5rem] hover:scale-105 shadow-lg
                hover:bg-white hover:text-black"
              >
                Play
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
