import React, { useState, useEffect } from 'react' 
import './App.css' 

const MAX_ATTEMPTS = 6 

function App() {
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isWinner, setIsWinner] = useState(false)
  const [wordToGuess, setWordToGuess] = useState('')

  useEffect(() => {
    if (!gameOver && wordToGuess.length > 0) {
      const firstEmptyIndex = currentGuess.findIndex(letter => letter === '')
      if (firstEmptyIndex !== -1) {
        document.getElementById(`input-${firstEmptyIndex}`)?.focus()
      }
    }
  }, [currentGuess, gameOver, wordToGuess])

  const handleInputChange = (e, index) => {
    if (gameOver) return 

    const value = e.target.value.toUpperCase() 
    if (value.match(/^[A-Z]?$/)) {
      let newGuess = [...currentGuess] 
      newGuess[index] = value 
      setCurrentGuess(newGuess) 

      if (value && index < wordToGuess.length - 1) {
        document.getElementById(`input-${index + 1}`).focus() 
      }
    }
  } 

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      let newGuess = [...currentGuess] 

      if (newGuess[index] === '' && index > 0) {
        newGuess[index - 1] = '' 
        setCurrentGuess(newGuess) 
        document.getElementById(`input-${index - 1}`).focus() 
      } else {
        newGuess[index] = '' 
        setCurrentGuess(newGuess) 
      }
    }
  } 

  const handleGuessSubmit = (e) => {
    e.preventDefault() 
    if (gameOver) return 

    const guessString = currentGuess.join('') 
    if (guessString.length === wordToGuess.length && guesses.length < MAX_ATTEMPTS) {
      setGuesses([...guesses, guessString]) 
      setCurrentGuess(Array(wordToGuess.length).fill('')) 

      if (guessString === wordToGuess) {
        setIsWinner(true) 
        setGameOver(true) 
      } else if (guesses.length + 1 === MAX_ATTEMPTS) {
        setGameOver(true) 
      }
    }
  } 

  const handleStartGame = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/getWord', {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json' 
        }
      }) 

      if (!response.ok) {
        throw new Error("Failed to fetch data") 
      }

      const data = await response.json() 
      console.log(data)  

      
      const word = data.word 
      setWordToGuess(word) 
      setGuesses([]) 
      setCurrentGuess(Array(word.length).fill('')) 
      setGameStarted(true) 
      setGameOver(false) 
      setIsWinner(false) 
    } 
    catch (error) {
      console.error("Error Retrieving Data:", error) 
    }
  } 

  const renderFeedback = (guess) => {
    return guess.split('').map((letter, index) => {
      let className = 'letter' 
      if (letter === wordToGuess[index]) {
        className += ' correct' 
      } else if (wordToGuess.includes(letter)) {
        className += ' present' 
      }
      return <span key={index} className={className}>{letter}</span> 
    }) 
  } 

  return (
    <>
      <header className="glass-header">
        <h1>Welcome To Wordle</h1>
      </header>

      <main>
        {!gameStarted && (
          <button onClick={handleStartGame} className="start-button">Start Game</button>
        )}
        {gameStarted && (
          <>
            <div className="guesses">
              {guesses.map((guess, index) => (
                <div key={index} className="guess-row">
                  {renderFeedback(guess)}
                </div>
              ))}
            </div>
            {!gameOver && (
              <form onSubmit={handleGuessSubmit}>
                <div className="guess-row">
                  {currentGuess.map((letter, index) => {
                    const isDisabled = index > 0 && currentGuess[index - 1] === '' 
                    return (
                      <input 
                        key={index}
                        id={`input-${index}`}
                        type="text" 
                        value={letter} 
                        onChange={(e) => handleInputChange(e, index)} 
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        maxLength="1"
                        className="guess-input"
                        disabled={isDisabled || gameOver}
                      />
                    ) 
                  })}
                </div>
                <button type="submit" className="submit-button" disabled={gameOver}>
                  Submit
                </button>
              </form>
            )}
            {isWinner && <p className="success-message"> Congratulations! You guessed the word!</p>}
            {gameOver && !isWinner && <p className="failure-message"> Game Over! The word was {wordToGuess}.</p>}
            {gameOver && <button onClick={handleStartGame} className="start-button">Start New Game</button>
            }
          </>
        )}
      </main>

    </>
  ) 
}

export default App 
