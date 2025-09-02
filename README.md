# The Viral Note

A web app that lets you play a **Higher or Lower** style game with Spotify tracks and artists.  
Built with **Next.js**, **Supabase**, and the **Spotify API**.

## Tech Stack
- Next.js (TypeScript)
- Supabase (Postgres)
- Spotify Web API
- Vercel (deployment)

## Features
- Spotify OAuth login
- Fetches and stores user + top artist data
- Persistent database storage with Supabase
- Deployed on Vercel

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Add .env.local with your credentials
   ```
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=
   NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```
3. run locally
   ```
   npm run dev
   ```
   
