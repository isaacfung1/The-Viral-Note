export default function ModalOverlay(
    props: { gameWon: boolean; userScore: number; resetGame: () => void; quitGame: () => void }) {
  return (
    <>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="absolute inset-0 flex justify-center items-center z-10">
        <div className="bg-spotifyGray rounded-3xl p-12 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="mb-6">
              {props.gameWon ? (
                <div className="text-6xl mb-4">🎉</div>
              ) : (
                <div className="text-6xl mb-4">💀</div>
              )}
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              {props.gameWon ? "You Won!" : "Game Over"}
            </h1>

            <div className="mb-8">
              <p className="text-white text-lg mb-2">Final Score</p>
              <p className="text-5xl font-bold text-spotifyGreen">
                {props.userScore}
              </p>
              <p className="text-white text-sm mt-2">
                {props.gameWon
                  ? "You guessed all artists correctly!"
                  : "Better luck next time!"}
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={props.resetGame}
                className="w-full bg-spotifyGreen hover:bg-green-700 text-white 
                  font-bold py-4 px-8 rounded-xl transition-all duration-200 
                  transform hover:scale-105 shadow-lg text-lg font-gotham"
              >
                Play Again
              </button>
              <button
                onClick={props.quitGame}
                className="w-full border-2 text-white font-bold py-4 px-8 font-gotham
                  rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
              >
                Quit Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
