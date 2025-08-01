import React from "react";
import { useState, useEffect, useRef } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";

interface Artist {
    username: string;
    popularity: number;
}

interface HomeProps {
    artistsData: { [username: string]: number };
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const { req } = context;
        const cookies = req.headers.cookie || '';
        
        const protocol = req.headers.host?.includes('ngrok') ? 'https' : 'http';
        const baseUrl = `${protocol}://${req.headers.host}`;
        
        const userResponse = await axios.get(`${baseUrl}/api/get-user`, {
            headers: {
                cookie: cookies
            }
        });
        
        const artistsResponse = await axios.post(`${baseUrl}/api/api-client`, {
            userData: userResponse.data
        });

        return {
            props: {
                artistsData: artistsResponse.data.artistsData || {}
            }
        };
    } 
    catch (error) {
        console.error('Error fetching data for home page:', error);
        return {
            props: {
                artistsData: {}
            }
        };
    }
};

export default function Home({ artistsData }: HomeProps) {
    const [currentUsername, setCurrentUsername] = useState<string>("");
    const [currentPopularity, setCurrentPopularity] = useState<number>(0);
    const [newUsername, setNewUsername] = useState<string>("");
    const [newPopularity, setNewPopularity] = useState<number>(0);
    

    const availableArtistsRef = useRef<{ [username: string]: number }>({ ...artistsData });

    useEffect(() => {
        const firstArtist = getRandomArtist();
        const secondArtist = getRandomArtist();
        
        if (firstArtist) {
            setCurrentUsername(firstArtist.username);
            setCurrentPopularity(firstArtist.popularity);
        }
        
        if (secondArtist) {
            setNewUsername(secondArtist.username);
            setNewPopularity(secondArtist.popularity);
        }
    }, []);

    function getRandomArtist(): Artist | null {
        const artistsUsernames = Object.keys(availableArtistsRef.current);
        if (artistsUsernames.length === 0) {
            console.log("No more artists available");
            return null;
        }
        const randomArtistIndex = Math.floor(Math.random() * artistsUsernames.length);
        const randomArtist = artistsUsernames[randomArtistIndex];
        const artistPopularity = availableArtistsRef.current[randomArtist];
        
        delete availableArtistsRef.current[randomArtist];

        return { username: randomArtist, popularity: artistPopularity };
    }

    function updateArtist() {
        setCurrentUsername(newUsername);
        setCurrentPopularity(newPopularity);
        const nextArtist = getRandomArtist();
        
        if (nextArtist) {
            setNewUsername(nextArtist.username);
            setNewPopularity(nextArtist.popularity);
        } else {
            setNewUsername("You Win!");
            setNewPopularity(0);
        }
    }

    function higher() {
        if (currentPopularity <= newPopularity) {
            updateArtist();
        } else {
            console.log("Wrong! Game Over!");
        }
    }
    
    function lower() {
        if (currentPopularity >= newPopularity) {
            updateArtist();
        } else {
            console.log("Wrong! Game Over!");
        }
    }

return (
    <div className="w-screen h-screen flex justify-center items-center">
    <div className="h-screen w-screen flex-1 flex flex-row justify-center items-center">
        <h1>{currentUsername}</h1>
    </div>
    <div className="h-screen w-screen flex-1 flex flex-col justify-center items-center gap-10">
        <button onClick={higher} className="">Higher</button>
        <button onClick={lower}>Lower</button>
    </div>
    </div>
);
}


