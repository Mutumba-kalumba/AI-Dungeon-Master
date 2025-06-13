import React, { useState } from "react";
import RiddleOfRuins from "../games/RiddleOfRuins";
import MemoryMaze from "../games/MemoryMaze";
import RunestoneDecoder from "../games/RunestoneDecoder";
import WordChainDuel from "../games/WordChainDuel";
import EnchantersCode from "../games/EnchantersCode";
import WhispersOfDeceit from "../games/WhispersOfDeceit";
import "./SideQuests.css";

const SideQuests = () => {
  const [selectedGame, setSelectedGame] = useState("");

  return (
    <div className="sidequest-container">
      {!selectedGame && (
        <>
          <h2>🧭 Choose Your Mini-Quest</h2>
          <button onClick={() => setSelectedGame("riddle")}>🧙 Riddle of Ruins</button>
          <button onClick={() => setSelectedGame("memory")}>🧠 Memory Maze</button>
          <button onClick={() => setSelectedGame("rune")}>🗿 Rune Decoder</button>
          <button onClick={() => setSelectedGame("WordChain")}>🔗 Word Chain Duel</button>
          <button onClick={() => setSelectedGame("EnchantersCode")}>🔮 Enchanter's Code</button>
          <button onClick={() => setSelectedGame("whispers")}>🕵️‍♂️ Whispers of Deceit</button>
        </>
      )}

      {selectedGame === "riddle" && <RiddleOfRuins goBack={() => setSelectedGame("")} />}
      {selectedGame === "memory" && <MemoryMaze goBack={() => setSelectedGame("")} />}
      {selectedGame === "rune" && <RunestoneDecoder goBack={() => setSelectedGame("")} />}
      {selectedGame === "WordChain" && <WordChainDuel goBack={() => setSelectedGame("")} />}
      {selectedGame === "EnchantersCode" && <EnchantersCode goBack={() => setSelectedGame("")} />}
      {selectedGame === "whispers" && <WhispersOfDeceit goBack={() => setSelectedGame("")} />}
    </div>
  );
};

export default SideQuests;
