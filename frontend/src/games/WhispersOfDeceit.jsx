import React, { useEffect, useState } from "react";
import axios from "axios";
import "../pages/SideQuests.css";

const WhispersOfDeceit = ({ goBack }) => {
  const [story, setStory] = useState("");
  const [npcs, setNpcs] = useState([]);
  const [responses, setResponses] = useState([]);
  const [question, setQuestion] = useState("");
  const [questionsLeft, setQuestionsLeft] = useState(5);
  const [suspect, setSuspect] = useState("");
  const [result, setResult] = useState("");
  const [liar, setLiar] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [npcMemory, setNpcMemory] = useState({});
  const [guessAttempts, setGuessAttempts] = useState(0);

  const highlightAlibis = (text) => {
    npcs.forEach((name) => {
      if (!name) return;
      const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${safeName}\\b`, "g");
      text = text.replace(regex, `<span class="alibi-name">${name}</span>`);
    });
    return text;
  };

  const initGame = async () => {
    try {
      const res = await axios.post("http://localhost:5000/side_quest", {
        prompt: `
Create a fantasy mystery scene. There are exactly 3 named NPCs (with simple names like Lyra, Brom, Elric). One of them has stolen a magical item, but the others don't know who. 
Start with a short 3-10 sentence story about what happened and what item was stolen.
Internally choose one of the NPCs as the thief (do not reveal it in the story). 
All NPCs have unique quirky personalities, and they may joke, mock, or roast the player.
The thief is allowed to lie and mislead the player.
The innocent NPCs will answer truthfully, but they must never directly reveal who the thief is.
At least one NPC can vouch for another, truthfully or not.
Format:
Story: <story>
NPCs: name1, name2, name3
Thief: <name>
`
      });

      const data = res.data.reply;
      const storyMatch = data.match(/Story:\s*(.*?)(?=NPCs:)/s);
      const namesMatch = data.match(/NPCs:\s*(.*)/);
      const liarMatch = data.match(/Thief:\s*(.*)/);

      const fullStory = storyMatch ? storyMatch[1].trim() : "A mysterious theft has occurred...";
      const npcNames = namesMatch ? namesMatch[1].split(",").map(n => n.trim()) : ["Lyra", "Brom", "Elric"];
      const chosenLiar = liarMatch ? liarMatch[1].trim() : npcNames[Math.floor(Math.random() * npcNames.length)];

      setStory(fullStory);
      setNpcs(npcNames);
      setLiar(chosenLiar);

      const memoryInit = {};
      npcNames.forEach(n => memoryInit[n] = []);
      setNpcMemory(memoryInit);
      setResponses([]);
      setQuestionsLeft(5);
      setResult("");
      setGameOver(false);
      setSuspect("");
      setGuessAttempts(0);
    } catch (err) {
      console.error("Failed to load mystery scene", err);
      setStory("A mysterious crime has occurred, but the story failed to load.");
      setNpcs(["Lyra", "Brom", "Elric"]);
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  const extractTargetNpc = (questionText) => {
    for (const name of npcs) {
      if (questionText.toLowerCase().startsWith(name.toLowerCase())) {
        return name;
      }
    }
    return null;
  };

  const handleQuestion = async () => {
    if (!question || questionsLeft <= 0 || gameOver) return;

    const npc = extractTargetNpc(question) || null;
    let targets = npc ? [npc] : [...npcs];

    for (const targetNpc of targets) {
      const userText = `*You ask ${targetNpc}:* _${question}_`;
      const memory = npcMemory[targetNpc]?.join("\n") || "";

      try {
        const res = await axios.post("http://localhost:5000/side_quest", {
          prompt: `
You are ${targetNpc}, an NPC in a fantasy mystery. 
${targetNpc === liar ? "You are the thief and may lie, confuse the player, or mock them." : "You are innocent and must answer truthfully, but never reveal who the thief is."}
You are quirky, funny, and sarcastic. You may roast the player or comment on their deduction skills.
You may vouch for another NPC, truthfully or not.
Your personality must be clear in your responses.
Previous things you’ve said:\n${memory || "Nothing yet."}
Someone is questioning you: "${question}"

Respond in-character, with emotion, humor, or dramatic flair.
          `
        });

        const reply = res.data.reply.trim();
        setNpcMemory((prev) => ({
          ...prev,
          [targetNpc]: [...(prev[targetNpc] || []), `Q: ${question}\nA: ${reply}`]
        }));
        setResponses((prev) => [...prev, userText, `${targetNpc}: ${reply}`]);
      } catch (err) {
        console.error("Error asking question", err);
      }
    }

    setQuestion("");
    setQuestionsLeft(questionsLeft - 1);
  };

  const handleGuess = () => {
    if (!suspect) return;

    const newAttempt = guessAttempts + 1;
    setGuessAttempts(newAttempt);

    if (suspect === liar) {
      setResult(`✅ Correct! ${suspect} was the deceiver.`);
      setGameOver(true);
    } else {
      if (newAttempt >= 2) {
        setResult(`❌ Wrong again. The real deceiver was ${liar}.`);
        setGameOver(true);
      } else {
        setResult(`❌ Wrong. That wasn't the liar. You may interrogate the NPCs again with 3 new questions.`);
        setQuestionsLeft(3);
        setSuspect(""); // Reset for new guess
      }
    }
  };

  return (
    <div className="sidequest-container">
      <h1>🕵️ Side Quest: Whispers of Deceit</h1>
      <p><em>Here's the scene:</em></p>
      <p className="quest-dialogue">{story}</p>

      {!gameOver && (
        <>
          <p>
            Ask your questions to identify the liar. Refer to NPCs by name to question them. <br />
            If no name is given, all will respond.
          </p>
          <textarea
            rows="2"
            value={question}
            placeholder="Type your question here..."
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div style={{ marginTop: "1rem" }}>
            <button onClick={handleQuestion} disabled={questionsLeft <= 0}>Ask Question</button>
          </div>
          <p style={{ marginTop: "0.5rem", color: "red" }}>❓ Questions remaining: {questionsLeft}</p>
          <p style={{ marginTop: "0.5rem", color: "orange" }}>🧠 Guesses used: {guessAttempts}/2</p>
          <div className="response-log">
            {responses.map((r, i) => (
              <p
                key={i}
                className={r.startsWith("*You ask") ? "player-question" : ""}
                dangerouslySetInnerHTML={{ __html: highlightAlibis(r) }}
              />
            ))}
          </div>
          {questionsLeft === 0 && (
            <>
              <p>🤔 Who do you think is the liar?</p>
              <select value={suspect} onChange={(e) => setSuspect(e.target.value)}>
                <option value="">-- Select Suspect --</option>
                {npcs.map((npc, i) => (
                  <option key={i} value={npc}>{npc}</option>
                ))}
              </select>
              <button onClick={handleGuess} style={{ marginLeft: "1rem" }}>Accuse</button>
            </>
          )}
        </>
      )}

      {gameOver && (
        <>
          <p className="feedback">{result}</p>
          <button onClick={initGame} style={{ marginTop: "1rem" }}>🔁 Play Again</button>
          <button onClick={goBack} style={{ marginTop: "1rem", marginLeft: "1rem" }}>🔙 Return</button>
        </>
      )}
    </div>
  );
};

export default WhispersOfDeceit;
