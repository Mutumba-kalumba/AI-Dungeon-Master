import React, { useState, useEffect } from "react";
import "../pages/SideQuests.css";

const COOLDOWN_KEY = "memoryMazeCooldown";

const MemoryMaze = ({ goBack }) => {
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [showSequence, setShowSequence] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedOutUntil, setLockedOutUntil] = useState(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const storedCooldown = localStorage.getItem(COOLDOWN_KEY);
    if (storedCooldown && new Date() < new Date(storedCooldown)) {
      setLockedOutUntil(new Date(storedCooldown));
    }
  }, []);

  useEffect(() => {
    if (lockedOutUntil) {
      const interval = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.ceil((new Date(lockedOutUntil) - new Date()) / 1000)
        );
        setTimer(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          setLockedOutUntil(null);
          localStorage.removeItem(COOLDOWN_KEY);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockedOutUntil]);

  const wordOptions = ["dragon", "sword", "castle", "wizard", "shadow", "flame","cave", "forest", "quest", "treasure", "magic"];

  const generateSequence = () => {
    const newSequence = Array.from({ length: 4 }, () =>
      wordOptions[Math.floor(Math.random() * wordOptions.length)]
    );
    setSequence(newSequence);
    setShowSequence(true);
    setTimeout(() => {
      setShowSequence(false);
    }, 3000);
  };

  const startGame = () => {
    setGameStarted(true);
    setFeedback("");
    setUserInput([]);
    setAttempts(0);
    generateSequence();
  };

  const handleChange = (index, value) => {
    const newInput = [...userInput];
    newInput[index] = value.toLowerCase().trim();
    setUserInput(newInput);
  };

  const handleSubmit = () => {
    const normalizedSequence = sequence.map((word) => word.toLowerCase());
    const normalizedInput = userInput.map((word) => word.toLowerCase().trim());
    if (JSON.stringify(normalizedInput) === JSON.stringify(normalizedSequence)) {
      setFeedback("🎉 Correct! Next level loading...");
      setUserInput([]);
      generateSequence();
    } else {
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      if (nextAttempt >= 3) {
        const banUntil = new Date(Date.now() + 5 * 60 * 1000);
        setLockedOutUntil(banUntil);
        localStorage.setItem(COOLDOWN_KEY, banUntil);
        setFeedback("💀 You failed to solve the maze and are now banished for 5 minutes.");
        setGameStarted(false);
      } else {
        setFeedback(`❌ Incorrect! You have ${3 - nextAttempt} tries left.`);
      }
    }
  };

  const handleEndGame = () => {
    setGameStarted(false);
    setFeedback("Thanks for playing the Memory Maze!");
  };

  if (lockedOutUntil && new Date() < new Date(lockedOutUntil)) {
    return (
      <div className="sidequest-container">
        <h2>🚫 You are banished!</h2>
        <p>
          You may return in {Math.floor(timer / 60)}:
          {String(timer % 60).padStart(2, "0")} minutes.
        </p>
        <button onClick={goBack}>🔙 Return</button>
      </div>
    );
  }

  return (
    <div className="sidequest-container">
      <h1>🧠 Memory Maze</h1>
      {!gameStarted ? (
        <button onClick={startGame}>Start Memory Maze</button>
      ) : (
        <>
          {showSequence ? (
            <div className="memory-sequence">
              {sequence.map((word, index) => (
                <span key={index} className="memory-word">
                  {word}
                </span>
              ))}
            </div>
          ) : (
            <div className="memory-inputs">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Word ${i + 1}`}
                  onChange={(e) => handleChange(i, e.target.value)}
                />
              ))}
              <button onClick={handleSubmit}>Submit</button>
              <button onClick={handleEndGame} style={{ marginLeft: "1rem" }}>End Game</button>
            </div>
          )}
          {feedback && <p className="feedback">{feedback}</p>}
        </>
      )}
      <button onClick={goBack} style={{ marginTop: "1rem" }}>🔙 Return</button>
    </div>
  );
};

export default MemoryMaze;
