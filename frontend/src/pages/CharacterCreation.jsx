// src/CharacterCreation.jsx
import React, { useState } from "react";
import "./CharacterCreation.css";

const CharacterCreation = ({ onCreateCharacter }) => {
    const [name, setName] = useState("");
    const [charClass, setCharClass] = useState("Warrior");
    const [background, setBackground] = useState("Orphan");

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreateCharacter({ name, charClass, background });
    };

    return (
        <div className="character-creation">
            <h2>🎭 Create Your Character</h2>
            <form onSubmit={handleSubmit}>
                <label>Name:</label>
                <input
                    type="text"
                    placeholder="Enter character name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <label>Class:</label>
                <select value={charClass} onChange={(e) => setCharClass(e.target.value)}>
                    <option>Warrior</option>
                    <option>Mage</option>
                    <option>Rogue</option>
                    <option>Bard</option>
                    <option>Princess</option>
                </select>

                <label>Choose Background:</label>
                <select value={background} onChange={(e) => setBackground(e.target.value)}>
                    <option>Orphan</option>
                    <option>Noble</option>
                    <option>Outlander</option>
                    <option>Scholar</option>
                    <option>Merchant</option>
                </select>

                <button type="submit">🎲 Begin Adventure</button>
            </form>
        </div>
    );
};

export default CharacterCreation;
