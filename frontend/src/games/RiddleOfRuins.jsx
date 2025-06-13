import React, { useEffect, useState } from "react";
import axios from "axios";
import "../pages/SideQuests.css";

const COOLDOWN_KEY = "riddleCooldown";

const RiddleOfRuins = ({ goBack }) => {
  const [quest, setQuest] = useState("");
  const [riddle, setRiddle] = useState("");
  const [answer, setAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [hint, setHint] = useState("");
  const [feedback, setFeedback] = useState("");
  const [lockedOutUntil, setLockedOutUntil] = useState(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const storedCooldown = localStorage.getItem(COOLDOWN_KEY);
    if (storedCooldown && new Date() < new Date(storedCooldown)) {
      setLockedOutUntil(new Date(storedCooldown));
    } else {
      loadQuest();
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
          loadQuest();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockedOutUntil]);

  const loadQuest = async () => {
    try {
      const res = await axios.post("http://localhost:5000/side_quest", {
        prompt:
          `In 3 parts, generate an easy detailed riddle:\n1. Dialogue-style introduction (2-3 sentences)\n2. Riddle (preface with "Riddle:")\n3. Answer and one Hint (preface each with "Answer:" and "Hint:")\n\nKeep the riddle concise, clever, and accessible for players aged 10 and up. Use a mix of topics like nature, magic, creatures, objects, or logic.`,
      });

      const reply = res.data.reply;
      const match = reply.match(/Riddle:\s*([\s\S]*?)\n/i);
      const answerMatch = reply.match(/Answer:\s*(.*)/i);
      const hintMatch = reply.match(/Hint:\s*(.*)/i);

      const introText = reply.split("Riddle:")[0].trim();

      setQuest(introText);
      setRiddle(match ? match[1].trim() : "???");
      setAnswer(answerMatch ? answerMatch[1].toLowerCase().trim() : "");
      setHint(hintMatch ? hintMatch[1] : "");
    } catch (err) {
      console.error("Failed to load side quest", err);
    }
  };

  const isSimilarAnswer = (input, correct) => {
    const normalize = str => str.replace(/^(a|an|the)\s+/i, "").toLowerCase().trim();
    return normalize(input) === normalize(correct);
  };

  const handleSubmit = () => {
    const normalized = userAnswer.toLowerCase().trim();
    if (isSimilarAnswer(normalized, answer)) {
      setFeedback("🎉 Correct! You win a magical amulet of insight!");
    } else {
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      if (nextAttempt >= 3) {
        setFeedback(`💀 You have failed. The correct answer was: ${answer}. You are now banished for 5 minutes.`);
        const banUntil = new Date(Date.now() + 5 * 60 * 1000);
        setLockedOutUntil(banUntil);
        localStorage.setItem(COOLDOWN_KEY, banUntil);
      } else {
        setFeedback(`❌ Incorrect! You have ${3 - nextAttempt} tries left.`);
      }
    }
    setUserAnswer("");
  };

  const handleHint = () => {
    if (hintUsed || !hint) return;
    setHintUsed(true);
    setFeedback(`🧠 Hint: ${hint}`);
  };

  if (lockedOutUntil && new Date() < new Date(lockedOutUntil)) {
    return (
      <div className="sidequest-container">
        <h2>🚫 You are banished!</h2>
        <p>
          You may return in {Math.floor(timer / 60)}:
          {String(timer % 60).padStart(2, "0")} minutes.
        </p>
        <p>🧩 The last riddle's answer was: <strong>{answer}</strong></p>
        <button onClick={goBack}>🔙 Return</button>
      </div>
    );
  }

  return (
    <div className="sidequest-container">
      <h1>🧙 Side Quest: The Riddle Challenge</h1>
      <p className="quest-dialogue">{quest}</p>
      <p className="riddle">
        🧩 <strong>Riddle:</strong> {riddle}
      </p>

      <input
        type="text"
        placeholder="Your answer..."
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
      />
      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleSubmit}>Submit Answer</button>
        {!hintUsed && hint && (
          <button onClick={handleHint} className="hint-btn" style={{ marginLeft: "1rem" }}>
            🔍 Request Hint
          </button>
        )}
        <button onClick={goBack} style={{ marginLeft: "1rem" }}>🔙 Return</button>
      </div>

      {feedback && <p className="feedback">{feedback}</p>}
    </div>
  );
};

export default RiddleOfRuins;
