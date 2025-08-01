import redirectToSpotify from "../pages/api/login";

export default function Main() {
  return (
    <div className = "relative flex flex-row items-center">
      <div className = "flex flex-row justify-center items-center">
        <h1 className = "font-bold text-7xl ">
          The Viral Note
        </h1>
        <button onClick={redirectToSpotify}>
          Login With Spotify
        </button>
      </div>
    </div>
    
  )
}