import redirect_to_spotify from "./api/login";

export default function Home() {
  return (
    <div className = "">
      <button onClick={redirect_to_spotify}>
        Login With Spotify
      </button>
    </div>
  )
}