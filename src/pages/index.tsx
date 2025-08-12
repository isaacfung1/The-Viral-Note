import redirectToSpotify from "../pages/api/login";
import VideoBackground from "@/components/video-bg";

export default function Main() {
  return (
    <div className="relative min-h-screen flex justify-center items-center">
      <VideoBackground />
      <div className="relative z-10 flex flex-col justify-center items-center text-center">
        <h1 className="font-bold text-6xl font-gotham text-white mb-8 drop-shadow-lg">
          The Viral Note
        </h1>
        <button 
          onClick={redirectToSpotify}
          className="bg-spotifyGreen hover:bg-green-700 text-spotifyGray font-bold py-4 px-5 rounded-full 
          transition-all duration-200 transform hover:scale-105 shadow-lg text-lg font-gotham"
        >
          Login with Spotify
        </button>
      </div>
    </div>
  )
}