import React, { useState, useEffect } from "react";
import "../pages/SideQuests.css";

const WordChainDuel = ({ goBack }) => {
  const [words, setWords] = useState(["dragon"]);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(10);
  const [timerRunning, setTimerRunning] = useState(true);
  const [warnings, setWarnings] = useState(0);
  const [isUserTurn, setIsUserTurn] = useState(true);

  useEffect(() => {
    if (!timerRunning || attempts >= 3 || feedback.includes("Game over") || feedback.includes("Game ended")) return;

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(countdown);
          handleFail("⏰ Time's up! You missed your turn.");
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [timerRunning, attempts, feedback, isUserTurn]);

  const isValidWord = (word) => {
    const lastWord = words[words.length - 1];
    return (
      word.length > 1 &&
      word[0].toLowerCase() === lastWord[lastWord.length - 1].toLowerCase()
    );
  };

  const handleFail = (msg) => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (newAttempts >= 3) {
      setFeedback("💀 Game over! You failed 3 times.");
    } else {
      setFeedback(`${msg} ${3 - newAttempts} tries left.`);
    }
    setUserInput("");
    setTimer(10);
    setIsUserTurn(true);
  };

  const handleSubmit = () => {
    const input = userInput.trim().toLowerCase();

    if (words.includes(input)) {
      const newWarnings = warnings + 1;
      setWarnings(newWarnings);
      if (newWarnings >= 2) {
        setFeedback("🚫 You repeated a word twice. 💀 You are banned from the duel!");
        setAttempts(3);
        setTimerRunning(false);
        return;
      } else {
        setFeedback(`⚠️ That word was already used! Warning ${newWarnings}/2`);
        setUserInput("");
        return;
      }
    }

    if (isValidWord(input)) {
      setWords([...words, input]);
      setFeedback("✅ Good one!");
      setTimer(10);
      setUserInput("");
      setIsUserTurn(false);
      setTimeout(aiTurn, 1000);
    } else {
      handleFail("❌ Invalid word.");
    }
  };

  const aiTurn = () => {
    const lastLetter = words[words.length - 1].slice(-1).toLowerCase();
    const dictionary = [
      "night", "torch", "hammer", "raven", "nymph", "phantom", "mystic", "chalice", "echo", "oracle","people", "girls", "sword", "castle", "wizard", "shadow", "flame","cave", "forest", "quest", "treasure", "magic",
      "dragon", "sorcerer", "goblin", "troll", "elf", "dwarf", "giant", "spirit", "beast", "phoenix","boys","family", "friends", "adventure", "journey", "quest", "battle", "victory", "defeat", "treasure", "legend",
      "myth", "fable", "tale", "story", "chronicle", "saga", "epic", "odyssey", "quest","magic","spell","potion","amulet","ring","staff","wand","cloak","armor","shield","sword",
    ];

    const unusedWords = dictionary.filter(
      (word) => word.startsWith(lastLetter) && !words.includes(word)
    );

    if (unusedWords.length === 0) {
      setFeedback("🤖 AI failed to respond. You win!");
      setTimerRunning(false);
      return;
    }

    const aiWord = unusedWords[Math.floor(Math.random() * unusedWords.length)];
    setWords((prev) => [...prev, aiWord]);
    setFeedback(`🤖 AI plays: ${aiWord}`);
    setTimer(10);
    setIsUserTurn(true);
  };

  const handleEnd = () => {
    setFeedback("🛑 Game ended. Well played!");
    setTimerRunning(false);
  };

  return (
    <div className="sidequest-container">
      <h1>⚔️ Side Quest: Word Chain Duel</h1>
      <p>
        🔤 Starting word: <strong>{words[0]}</strong>
      </p>
      <ul>
        {words.slice(1).map((word, i) => (
          <li key={i}>➡️ {word}</li>
        ))}
      </ul>

      {attempts < 3 && !feedback.includes("Game over") && !feedback.includes("Game ended") && (
        isUserTurn ? (
          <>
            <p>⏳ Time left: {timer}s</p>
            <input
              type="text"
              placeholder="Your word..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <div style={{ marginTop: "1rem" }}>
              <button onClick={handleSubmit}>Submit Word</button>
              <button onClick={handleEnd} style={{ marginLeft: "1rem" }}>
                🔚 End Duel
              </button>
            </div>
          </>
        ) : (
          <p>🤖 AI is thinking...</p>
        )
      )}

      {feedback && <p className="feedback">{feedback}</p>}
      <button onClick={goBack} style={{ marginTop: "1rem" }}>
        🔙 Return
      </button>
    </div>
  );
};

export default WordChainDuel;