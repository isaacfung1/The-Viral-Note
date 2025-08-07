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
    artistsData: Array<{username: string, popularity: number, image_url: string}>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        console.log('=== DEBUG: getServerSideProps starting ===');
        const { req } = context;
        const cookies = req.headers.cookie || '';
        
        console.log('Cookies:', cookies);
        
        const protocol = req.headers.host?.includes('ngrok') ? 'https' : 'http';
        const baseUrl = `${protocol}://${req.headers.host}`;
        
        console.log('Base URL:', baseUrl);
        
        console.log('=== Calling /api/get-user ===');
        const userResponse = await axios.get(`${baseUrl}/api/get-user`, {
            headers: {
                cookie: cookies
            }
        });
        console.log('User response:', userResponse.data);
        
        if (!userResponse.data.user || !userResponse.data.user.userId) {
            console.log('No user data found, returning empty artists');
            return {
                props: {
                    artistsData: {}
                }
            };
        }
        
        console.log('=== Calling api-client ===');
        const artistsResponse = await axios.post(`${baseUrl}/api/api-client`, {
            userData: userResponse.data.user.userId
        });

        return {
            props: {
                artistsData: artistsResponse.data.artistsData || {}
            }
        };
    } 
    catch (error: any) {
        console.error('=== ERROR in getServerSideProps ===');
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        return {
            props: {
                artistsData: []
            }
        };
    }
};

export default function Home({ artistsData }: HomeProps) {
    const [currentUsername, setCurrentUsername] = useState<string>("");
    const [currentPopularity, setCurrentPopularity] = useState<number>(0);
    const [currentImage, setCurrentImage] = useState<string>("");
    const [newUsername, setNewUsername] = useState<string>("");
    const [newPopularity, setNewPopularity] = useState<number>(0);
    const [newImage, setNewImage] = useState<string>("");
    
    const availableArtists = useRef<Array<{username: string, popularity: number, image_url: string}>>([...artistsData]);

    useEffect(() => {
        const firstArtist = getRandomArtist();
        const secondArtist = getRandomArtist();
        
        if (firstArtist) {
            setCurrentUsername(firstArtist.username);
            setCurrentPopularity(firstArtist.popularity);
            setCurrentImage(firstArtist.imageUrl);
        }
        
        if (secondArtist) {
            setNewUsername(secondArtist.username);
            setNewPopularity(secondArtist.popularity);
            setNewImage(secondArtist.imageUrl);
        }
    }, []);

    function getRandomArtist(): Artist | null {
        if (availableArtists.current.length === 0) {
            console.log("No more artists available");
            return null;
        }
        const randomArtistIndex = Math.floor(Math.random() * availableArtists.current.length);
        const randomArtist = availableArtists.current[randomArtistIndex];
        
        availableArtists.current.splice(randomArtistIndex, 1);

        return { 
            username: randomArtist.username, 
            popularity: randomArtist.popularity,
            imageUrl: randomArtist.image_url
        };
    }

    function updateArtist() {
        setCurrentUsername(newUsername);
        setCurrentPopularity(newPopularity);
        setCurrentImage(newImage);

        const nextArtist = getRandomArtist();

        if (nextArtist) {
            setNewUsername(nextArtist.username);
            setNewPopularity(nextArtist.popularity);
            setNewImage(nextArtist.imageUrl);
        } 
        else {
            setNewUsername("You Win!");
            setNewPopularity(0);
        }
    }

    function higher() {
        if (currentPopularity <= newPopularity) {
            updateArtist();
        } 
        else {
        }
    }
    
    function lower() {
        if (currentPopularity >= newPopularity) {
            updateArtist();
        } 
        else {
        }
    }
    function gameEnd(){}

return (
    <div className="w-screen h-screen flex justify-center items-center">
    <div className="h-screen w-screen flex-1 flex flex-col justify-center items-center">
        <Image alt ="current" src={currentImage} width={500} height={500}/>
        <h1>{currentUsername}</h1>
    </div>
    <div className="h-screen w-screen flex-1 flex flex-col justify-center items-center">
        <h1 className="">{newUsername}</h1>
        <div className="flex flex-col gap-10">
            <button onClick={higher} className="">Higher</button>
            <button onClick={lower}>Lower</button>
        </div>
    </div>
    </div>
);
}


