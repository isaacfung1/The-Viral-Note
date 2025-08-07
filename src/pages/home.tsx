import React from "react";
import { useState, useEffect, useRef } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";
import Image from "next/image";

interface Artist {
  username: string;
  popularity: number;
  imageUrl: string;
}

interface HomeProps {
  artistsData: Array<{
    username: string;
    popularity: number;
    image_url: string;
  }>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    console.log("=== DEBUG: getServerSideProps starting ===");
    const { req } = context;
    const cookies = req.headers.cookie || "";

    console.log("Cookies:", cookies);

    const protocol = req.headers.host?.includes("ngrok") ? "https" : "http";
    const baseUrl = `${protocol}://${req.headers.host}`;

    console.log("Base URL:", baseUrl);

    console.log("=== Calling /api/get-user ===");
    const userResponse = await axios.get(`${baseUrl}/api/get-user`, {
      headers: {
        cookie: cookies,
      },
    });
    console.log("User response:", userResponse.data);

    if (!userResponse.data.user || !userResponse.data.user.userId) {
      console.log("No user data found, returning empty artists");
      return {
        props: {
          artistsData: {},
        },
      };
    }

    console.log("=== Calling api-client ===");
    const artistsResponse = await axios.post(`${baseUrl}/api/api-client`, {
      userData: userResponse.data.user.userId,
    });

    return {
      props: {
        artistsData: artistsResponse.data.artistsData || {},
      },
    };
  } catch (error: any) {
    console.error("=== ERROR in getServerSideProps ===");
    console.error("Error message:", error.message);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);

    return {
      props: {
        artistsData: [],
      },
    };
  }
};

export default function Home({ artistsData }: HomeProps) {
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [nextArtist, setNextArtist] = useState<Artist | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);

  const availableArtists = useRef<
    Array<{ username: string; popularity: number; image_url: string }>
  >([...artistsData]);

  useEffect(() => {
    const firstArtist = getRandomArtist();
    const secondArtist = getRandomArtist();

    if (firstArtist) {
      setCurrentArtist(firstArtist);
    }

    if (secondArtist) {
      setNextArtist(secondArtist);
    }
  }, []);

  function getRandomArtist(): Artist | null {
    if (availableArtists.current.length === 0) {
      gameEnd();
      return null;
    }
    const randomArtistIndex = Math.floor(
      Math.random() * availableArtists.current.length
    );
    const randomArtist = availableArtists.current[randomArtistIndex];

    availableArtists.current.splice(randomArtistIndex, 1);

    return {
      username: randomArtist.username,
      popularity: randomArtist.popularity,
      imageUrl: randomArtist.image_url,
    };
  }

  function updateArtist() {
    const newArtist = getRandomArtist();

    if (newArtist) {
      setCurrentArtist(nextArtist);
      setNextArtist(newArtist);
    } else {
      gameEnd();
    }
  }

  function higher() {
    if (!currentArtist || !nextArtist) {
      return;
    }
    if (currentArtist.popularity <= nextArtist.popularity) {
      setUserScore(userScore + 1);
      updateArtist();
    } else {
      gameEnd();
    }
  }

  function lower() {
    if (!currentArtist || !nextArtist) {
      return;
    }
    if (currentArtist.popularity >= nextArtist.popularity) {
      setUserScore(userScore + 1);
      updateArtist();
    } else {
      gameEnd();
    }
  }
  function gameEnd() {
    setGameOver(true);
    // Check if the user won (no more artists available)
    if (availableArtists.current.length === 0) {
      setGameWon(true);
    }
  }

  function resetGame() {
    // Reset all game state
    availableArtists.current = [...artistsData];
    setUserScore(0);
    setGameOver(false);
    setGameWon(false);
    
    // Get new artists
    const firstArtist = getRandomArtist();
    const secondArtist = getRandomArtist();
    
    if (firstArtist) setCurrentArtist(firstArtist);
    if (secondArtist) setNextArtist(secondArtist);
  }

  function quitGame() {
    // Redirect to home page or show login screen
    window.location.href = '/';
  }

  return (
    <div className="w-screen h-screen bg-gray-950 flex justify-center items-center relative">
      {/* Score Display */}
      <div className="absolute top-6 right-6 bg-gray-900 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-300 text-sm">Score</p>
        <p className="text-2xl font-bold text-green-400">{userScore}</p>
      </div>

      <div className="h-screen w-screen flex-1 flex flex-col justify-center items-center">
        <div className="text-center">
          {currentArtist && (
            <div className="mb-4">
              <img
                src={
                  currentArtist.imageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    currentArtist.username
                  )}&background=10b981&color=fff&size=200&rounded=true`
                }
                alt={currentArtist.username}
                className="w-52 h-52 rounded-full object-cover border-4 border-green-500 shadow-lg mx-auto"
                onError={(e) => {
                  // Fallback to UI Avatars if the image fails to load
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    currentArtist.username
                  )}&background=10b981&color=fff&size=200&rounded=true`;
                }}
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">
            {currentArtist?.username || "Loading..."}
          </h1>
          <h1 className="text-xl text-gray-200">
            Popularity Score: {currentArtist?.popularity || "Loading..."}
          </h1>
        </div>
      </div>
      <div className="h-screen w-screen flex-1 flex flex-col justify-center items-center">
        <div className="text-center">
          {nextArtist && (
            <div className="mb-4">
              <img
                src={
                  nextArtist.imageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    nextArtist.username
                  )}&background=10b981&color=fff&size=200&rounded=true`
                }
                alt={nextArtist.username}
                className="w-52 h-52 rounded-full object-cover border-4 border-gray-600 shadow-lg mx-auto"
                onError={(e) => {
                  // Fallback to UI Avatars if the image fails to load
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    nextArtist.username
                  )}&background=10b981&color=fff&size=200&rounded=true`;
                }}
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">
            {nextArtist?.username || "Loading..."}
          </h1>
          {/* <h1 className="text-xl text-gray-200">
            Popularity Score: {nextArtist?.popularity || "Loading..."}
          </h1> */}
        </div>
        <div className="flex flex-col gap-10 mt-8">
          <button
            onClick={higher}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Higher
          </button>
          <button
            onClick={lower}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Lower
          </button>
        </div>
      </div>

      {/* Game Over Modal Overlay */}
      {gameOver && (
        <>
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          
          {/* Modal Content */}
          <div className="absolute inset-0 flex justify-center items-center z-10">
            <div className="bg-gray-900 rounded-3xl p-12 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
              <div className="text-center">
                {/* Game Result Icon */}
                <div className="mb-6">
                  {gameWon ? (
                    <div className="text-6xl mb-4">🎉</div>
                  ) : (
                    <div className="text-6xl mb-4">💀</div>
                  )}
                </div>

                {/* Game Result Title */}
                <h1 className="text-4xl font-bold text-white mb-4">
                  {gameWon ? "You Won!" : "Game Over"}
                </h1>

                {/* Score Display */}
                <div className="mb-8">
                  <p className="text-gray-300 text-lg mb-2">Final Score</p>
                  <p className="text-5xl font-bold text-green-400">{userScore}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {gameWon 
                      ? "You guessed all artists correctly!" 
                      : "Better luck next time!"
                    }
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={resetGame}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={quitGame}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
                  >
                    Quit Game
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );


}
