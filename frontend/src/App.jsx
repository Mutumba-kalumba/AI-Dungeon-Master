import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import SavedStories from "./pages/SavedStories";
import PromptStory from "./pages/PromptStory";
import SideQuests from "./pages/SideQuests";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/saved" element={<SavedStories />} />
        <Route path="/prompt-story" element={<PromptStory />} />
        <Route path="/side-quests" element={<SideQuests />} />
      </Routes>
    </Router>
  );
};

export default App;
