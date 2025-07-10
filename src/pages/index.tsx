import redirect_to_spotify from "./api/login";

export default function Home() {
  return (
    <div className = "relative flex flex-row items-center">
      <div className = "flex flex-row justify-center items-center">
        <h1 className = "font-bold text-7xl ">
          The Viral Note
        </h1>
        <button onClick={redirect_to_spotify}>
          Login With Spotify
        </button>
      </div>
      <div className="bottom-0">
        Not affiliated with Spotify AB in any way.
      </div>
    </div>
  )
}