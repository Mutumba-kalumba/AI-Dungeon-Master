import React, { useEffect, useState } from "react";
import "../pages/SideQuests.css";

const COOLDOWN_KEY = "runestoneCooldown";

const RunestoneDecoder = ({ goBack }) => {
  const [originalMessage, setOriginalMessage] = useState("");
  const [scrambledMessage, setScrambledMessage] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [lockedOutUntil, setLockedOutUntil] = useState(null);
  const [timer, setTimer] = useState(0);

  const messages = [
    "the forest hides many secrets",
    "magic flows through ancient stones",
    "beware the shadow beneath the moon",
    "light the torch to reveal the truth",
    "speak friend and enter"
  ];

  useEffect(() => {
    const storedCooldown = localStorage.getItem(COOLDOWN_KEY);
    if (storedCooldown && new Date() < new Date(storedCooldown)) {
      setLockedOutUntil(new Date(storedCooldown));
    } else {
      startNewPuzzle();
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
          startNewPuzzle();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockedOutUntil]);

  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const scrambleWord = (word) => {
    if (word.length <= 2) return word;
    const middle = shuffleArray(word.slice(1, -1).split(""));
    return word[0] + middle.join("") + word[word.length - 1];
  };

  const scrambleMessage = (sentence) => {
    const words = sentence.split(" ").map(scrambleWord);
    return shuffleArray(words).join(" ");
  };

  const startNewPuzzle = () => {
    const random = messages[Math.floor(Math.random() * messages.length)];
    const scrambled = scrambleMessage(random);
    setOriginalMessage(random);
    setScrambledMessage(scrambled);
    setAttempts(0);
    setFeedback("");
  };

  const handleSubmit = () => {
    const normalized = userAnswer.toLowerCase().trim();
    if (normalized === originalMessage.toLowerCase().trim()) {
      setFeedback("✨ Correct! You deciphered the ancient script!");
      setTimeout(() => startNewPuzzle(), 2000);
    } else {
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      if (nextAttempt >= 3) {
        const banUntil = new Date(Date.now() + 5 * 60 * 1000);
        setLockedOutUntil(banUntil);
        localStorage.setItem(COOLDOWN_KEY, banUntil);
        setFeedback(`💀 You failed to decode it. The message was: "${originalMessage}". You are now banished for 5 minutes.`);
      } else {
        setFeedback(`❌ Incorrect! ${3 - nextAttempt} tries remaining.`);
      }
    }
    setUserAnswer("");
  };

  if (lockedOutUntil && new Date() < new Date(lockedOutUntil)) {
    return (
      <div className="sidequest-container">
        <h2>🚫 Banished from the Runestones!</h2>
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
      <h1>🗿 Side Quest: Runestone Decoder</h1>
      <p className="quest-dialogue">
        Ancient runes shift and scramble before your eyes. Decode the hidden message!
      </p>
      <p className="riddle">
        🧩 <strong>Scrambled Message:</strong> {scrambledMessage}
      </p>
      <input
        type="text"
        placeholder="Your decoded message..."
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />
      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleSubmit}>Submit Answer</button>
        <button onClick={goBack} style={{ marginLeft: "1rem" }}>🔙 End</button>
      </div>
      {feedback && <p className="feedback">{feedback}</p>}
    </div>
  );
};

export default RunestoneDecoder;