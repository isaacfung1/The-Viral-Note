import GamemodeButton from '@/components/gamemode-button';
import React from 'react';

export default function Home() {
    return (
        <div className="w-screen h-screen flex flex-row justify-center items-center bg-spotifyGray">
            <h1 className="absolute top-0 mt-[2rem] text-4xl font-gotham text-white">
                Gamemodes
            </h1>
            <div className = "flex flex-col gap-[3rem]">
                <GamemodeButton>User Top Artists 👤 👤</GamemodeButton>
                <GamemodeButton>User Top Songs 👤 🎤 🎹</GamemodeButton>
                <GamemodeButton>Random Songs 🎤 🎹</GamemodeButton>
                <GamemodeButton>Random Artists 👤</GamemodeButton>
            </div>
        </div>
    )
}