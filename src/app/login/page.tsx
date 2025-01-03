"use client";
import querystring from "querystring";
import crypto from "crypto";

function generateRandomString(length: number) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

export default function login() {
  function redirect_to_spotify() {
    const params = {
      response_type: "code",
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      scope: "user-read-private user-read-email",
      redirect_uri: "localhost:3000/callback",
      state: generateRandomString(16),
    };
    const url =
      "https://accounts.spotify.com/authorize?" + querystring.stringify(params);
    window.location.href = url;
  }
  return (
    <div>
      <button onClick={redirect_to_spotify}>
        Login with Spotify
      </button>
    </div>
  );
}
