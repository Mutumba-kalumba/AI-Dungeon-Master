import React, { useState, useEffect } from "react";
import "../pages/SideQuests.css";

const words = [
  "magic", "silver", "dragon", "crystal", "golden", "ancient", "phantom",
  "forest", "shadow", "riddle", "enigma", "whisper", "spell", "mystic",
  "charm", "potion", "sorcery", "guardian", "quest", "treasure", "cursed", "elixir"
];

const scrambleWord = (word) => {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

const getHint = (word) => {
  return `The word starts with '${word[0]}' and has ${word.length} letters.`;
};

const EnchantersCode = ({ goBack }) => {
  const [originalWord, setOriginalWord] = useState("");
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [hint, setHint] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [xp, setXp] = useState(0);
  const [xpFeedback, setXpFeedback] = useState("");

  useEffect(() => {
    const storedXp = localStorage.getItem("playerXP");
    setXp(storedXp ? parseInt(storedXp) : 0);
    startNewRound();
  }, []);

  const updateXP = (change, message) => {
    const newXp = Math.max(0, xp + change); // No negative XP
    setXp(newXp);
    localStorage.setItem("playerXP", newXp);
    setXpFeedback(message);
  };

  const startNewRound = () => {
    const word = words[Math.floor(Math.random() * words.length)].toLowerCase();
    setOriginalWord(word);
    setScrambled(scrambleWord(word));
    setInput("");
    setAttempts(0);
    setHintUsed(false);
    setHint("");
    setFeedback("");
    setXpFeedback("");
    setGameOver(false);
  };

  const handleSubmit = () => {
    const guess = input.trim().toLowerCase();
    if (guess === originalWord) {
      const xpGain = hintUsed ? 5 : 10;
      updateXP(xpGain, `🧙 You gained +${xpGain} XP!`);
      setFeedback("🎉 Correct! You've decoded the Enchanter's Code! Another challenge awaits...");
      setTimeout(() => {
        startNewRound();
      }, 1500);
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= 3) {
      setFeedback(`💀 You failed. The answer was '${originalWord}'.`);
      updateXP(-10, "❌ You lost 10 XP.");
      setGameOver(true);
    } else {
      setFeedback(`❌ Incorrect! ${3 - newAttempts} tries left.`);
    }
    setInput("");
  };

  const handleHint = () => {
    if (!hintUsed) {
      const generatedHint = getHint(originalWord);
      setHint(generatedHint);
      setHintUsed(true);
    }
  };

  const handleEnd = () => {
    setGameOver(true);
    setFeedback("🛑 Game ended by user.");
  };

  return (
    <div className="sidequest-container">
      <h1>🔐 Side Quest: Enchanter's Code</h1>
      <p>✨ XP: <strong>{xp}</strong></p>
      {!gameOver ? (
        <>
          <p>🧩 Unscramble the magical word below.</p>
          <p><strong>🔐 Coded Message:</strong> {scrambled}</p>
          {hintUsed && <p><strong>🔍 Hint:</strong> {hint}</p>}
          <p className="feedback">{feedback}</p>
          <input
            type="text"
            placeholder="Enter your decoded word..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div style={{ marginTop: "1rem" }}>
            <button onClick={handleSubmit}>Submit Answer</button>
            <button onClick={handleHint} style={{ marginLeft: "1rem" }}>🔍 Hint</button>
            <button onClick={handleEnd} style={{ marginLeft: "1rem" }}>🔚 End Challenge</button>
          </div>
        </>
      ) : (
        <>
          <p className="feedback">{feedback}</p>
          <p className="feedback">{xpFeedback}</p>
          <button onClick={goBack} style={{ marginTop: "1rem" }}>
            🔙 Return
          </button>
        </>
      )}
    </div>
  );
};

export default EnchantersCode;
