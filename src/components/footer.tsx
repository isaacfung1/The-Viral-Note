export default async function Footer() {
    return (
        <div className="flex flex-col items-center justify-center w-full p-4 bg-gray-800 text-white">
            <div className="text-sm">
                Not affiliated with Spotify AB in any way.
            </div>
            <div className="text-xs mt-2">
                © {new Date().getFullYear()} The Viral Note
            </div>
        </div>
    )
}