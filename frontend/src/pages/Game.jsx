import React, { useState, useEffect } from "react";
import CharacterCreation from "../pages/CharacterCreation"; 
import "./Game.css";

const Navbar = ({ onFetchStory, onRollDice, onEndStory, onSaveStory, theme, setTheme }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="navbar-logo">🧙‍♂️Welcome to AI Dungeon Master</div>
            <ul className="navbar-links">
                <li><button onClick={() => onFetchStory(false)}>📖 Story</button></li>
                <li><button onClick={onRollDice}>🎲 Roll</button></li>
                <li><button onClick={onEndStory}>🛑 End</button></li>
                <li><button onClick={onSaveStory}>💾 Save</button></li>
            </ul>
            <div className="navbar-theme">
                <button onClick={() => setMenuOpen(!menuOpen)}>☰</button>
                {menuOpen && (
                    <div className="theme-dropdown">
                        <button onClick={() => setTheme("light-theme")}>☀️ Light</button>
                        <button onClick={() => setTheme("dark-theme")}>🌙 Dark</button>
                        <button onClick={() => window.location.href = "/"}>🏠 Home</button>
                    </div>
                )}
            </div>
        </nav>
    );
};
const predefinedCharacters = [
    {
      name: "Default Player",
      charClass: "Strong",
      background: "A fierce warrior from the frozen north",
      traits: "Brave, Reckless, Loyal"
    },
  ];
  
const Game = () => {
    const [story, setStory] = useState("");
    const [choices, setChoices] = useState([]);
    const [diceRoll, setDiceRoll] = useState(null);
    const [selectedChoice, setSelectedChoice] = useState("");
    const [npc, setNpc] = useState("");
    const [npcImage, setNpcImage] = useState("");
    const [previousStory, setPreviousStory] = useState("");
    const [theme, setTheme] = useState("dark-theme");
    const [rolling, setRolling] = useState(false);
    const [npcInput, setNpcInput] = useState("");
    const [npcResponse, setNpcResponse] = useState("");
    const [character, setCharacter] = useState(null);
    const [showCreation, setShowCreation] = useState(false);
    
    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    const handleCreateCharacter = (charData) => {
        setCharacter(charData);
        setShowCreation(false);
    };

    

    const fetchStory = async (useCustomStory = false) => {
        try {
            const endpoint = useCustomStory ? "generate_custom_story" : "tell_story";
            const response = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ character }) // Always send character info
            });
    
            const data = await response.json();
            if (data.story && data.choices.length > 0) {
                setStory(`<p>${data.story}</p>`);
                setPreviousStory(data.story);
                setChoices(data.choices);
                setNpc(data.npc);
                setNpcImage(data.npc_image);
                setSelectedChoice("");
                setDiceRoll(null);
            }
        } catch (error) {
            console.error("Error fetching story:", error);
        }
    };
    

    const selectChoice = async (choice) => {
        setSelectedChoice(choice);
        try {
            const response = await fetch("http://127.0.0.1:5000/generate_story", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recent_choice: choice, npc, previous_story: previousStory }),
            });

            const data = await response.json();
            if (data.narrative && data.choices.length > 0) {
                const styledChoice = `<p class="user-choice">You chose: <em>${choice}</em></p>`;
                setStory(prev => `${prev}<br/>${styledChoice}<br/><p>${data.narrative}</p>`);
                setPreviousStory(prev => prev + " " + data.narrative);
                setChoices(data.choices);
                setDiceRoll(null);
            }
        } catch (error) {
            console.error("Error updating story:", error);
        }
    };

    const rollDice = async () => {
        setRolling(true);
        setTimeout(async () => {
            try {
                const response = await fetch("http://127.0.0.1:5000/roll_dice");
                const data = await response.json();
                const rolledNumber = data.dice_roll;
                setDiceRoll(rolledNumber);

                const index = (rolledNumber - 1) % choices.length;
                const chosenOption = choices[index];

                if (chosenOption) {
                    setSelectedChoice(chosenOption);
                    await selectChoice(chosenOption);
                }

                setRolling(false);
            } catch (error) {
                console.error("Error rolling dice:", error);
                setRolling(false);
            }
        }, 1500);
    };

    const handleSaveStory = () => {
        const plainText = story.replace(/<[^>]+>/g, "");
        const savedStories = JSON.parse(localStorage.getItem("savedStories")) || [];
        const newStory = {
            npc: npc || "Unknown NPC",
            text: plainText,
            timestamp: new Date().toISOString()
        };
        savedStories.push(newStory);
        localStorage.setItem("savedStories", JSON.stringify(savedStories));

        const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "my_story.txt";
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const endStory = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/end_story", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ previous_story: previousStory, npc }),
            });

            const data = await response.json();
            if (data.ending) {
                setStory(prev => `${prev}<br/><p>${data.ending}</p>`);
                setChoices([]);
                setSelectedChoice("The End");
            }
        } catch (error) {
            console.error("Error ending story:", error);
        }
    };

    const handleTalkToNpc = async () => {
        if (!npcInput.trim()) return;

        try {
            const response = await fetch("http://127.0.0.1:5000/talk_to_npc", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ npc, player_input: npcInput, previous_story: previousStory })
            });

            const data = await response.json();
            const playerTalk = `<p class="user-input"><em>You said to ${npc}: "${npcInput}"</em></p>`;
            const npcTalk = `<p><strong>${npc}:</strong> ${data.reply}</p>`;
            setStory(prev => `${prev}<br/>${playerTalk}<br/>${npcTalk}`);
            setNpcResponse(data.reply);
            setNpcInput("");

            if (data.choices && data.choices.length > 0) {
                setChoices(data.choices);
            }

        } catch (error) {
            console.error("Error talking to NPC:", error);
            setNpcResponse("❌ Failed to talk to the NPC.");
        }
    };

    // 🧙 Initial screens
    if (!character) {
        return (
            <div className="character-choice-screen">
                <h2>🧙 Choose Your Adventurer</h2>
                <div className="character-options">
                    {predefinedCharacters.map((char, idx) => (
                    <div key={idx} className="character-card" onClick={() => handleCreateCharacter(char)}>
                        <h3>{char.name}</h3>
                        <p><strong>Class:</strong> {char.charClass}</p>
                        <p><strong>Background:</strong> {char.background}</p>
                        <p><strong>Traits:</strong> {char.traits}</p>
                    </div>
                    ))}

                    {/* Create Character Card */}
                    <div className="character-card" onClick={() => setShowCreation(true)}>
                    <h3>➕ Create New Character</h3>
                    <p>Design your own hero with a unique story!</p>
                    </div>

                    
                </div>

                {/* Render the creation form if toggled */}
                {showCreation && (
                    <CharacterCreation onCreateCharacter={handleCreateCharacter} />
                )}
            </div>

        

        );
    }

    if (character && story === "") {
        return (
            <div className="story-choice-screen">
                <h2>✨ Welcome, {character.name} the {character.charClass}!</h2>
                <p>How would you like to begin your adventure?</p>
                <button onClick={() => fetchStory(false)}>📖 Default Story</button>
                <button onClick={() => fetchStory(true)}>🧠 Story About Me</button>
            </div>
        );
    }

    // 🌟 Game UI
    return (
        <>
            <Navbar
                onFetchStory={fetchStory}
                onRollDice={rollDice}
                onEndStory={endStory}
                onSaveStory={handleSaveStory}
                theme={theme}
                setTheme={setTheme}
            />

            <div className="game-container">
                <h1>✨ Welcome, {character.name} the {character.charClass}!</h1>

                <div
                    className="story-container"
                    style={{ backgroundImage: npcImage ? `url(/assets/${npcImage})` : "none" }}
                >
                    <div className="story-overlay">
                        <p style={{ whiteSpace: "pre-line" }} dangerouslySetInnerHTML={{ __html: story || "Click 'Story' to begin your adventure!" }}></p>
                    </div>
                </div>

                <div className="choices-container">
                    {choices.map((choice, index) => (
                        <button
                            key={index}
                            className={`choice-button ${selectedChoice === choice ? "selected" : ""}`}
                            onClick={() => selectChoice(choice)}
                        >
                            {choice}
                        </button>
                    ))}
                </div>

                <div className="talk-container">
                    <input
                        type="text"
                        placeholder={`Talk to ${npc || "the NPC"}...`}
                        value={npcInput}
                        onChange={(e) => setNpcInput(e.target.value)}
                        className="talk-input"
                    />
                    <button onClick={handleTalkToNpc} className="talk-button">💬 Talk</button>
                </div>

                {diceRoll !== null && <p className="dice-result">🎲 Dice Roll: {diceRoll}</p>}
                {selectedChoice && <p className="selected-choice">✅ {selectedChoice}</p>}
            </div>
        </>
    );
};

export default Game;
