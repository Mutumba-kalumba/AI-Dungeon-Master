import React, { useState } from "react";
import axios from "axios";

const PromptStory = () => {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setStory("");

    try {
      const res = await axios.post("http://localhost:5000/story_from_prompt", { prompt });
      setStory(res.data.story);
    } catch (err) {
      setStory("⚠️ Failed to generate story.");
    }

    setLoading(false);
  };

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem("savedStories")) || [];
    saved.push(`Prompt: ${prompt}\n\nStory: ${story}`);
    localStorage.setItem("savedStories", JSON.stringify(saved));
    alert("✅ Story saved!");
  };

  return (
    <div className="prompt-story" style={{ padding: "2rem", color: "#fff" }}>
      <h1>🧙 Generate a Custom Fantasy Story</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        placeholder="Type your story prompt here..."
        style={{ width: "100%", padding: "1rem", borderRadius: "10px" }}
      />

      <button onClick={handleGenerate} disabled={loading} style={{ marginTop: "1rem" }}>
        {loading ? "Generating..." : "✨ Generate Story"}
      </button>

      {story && (
        <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", padding: "1rem", borderRadius: "10px" }}>
          <h2>📖 Your Story:</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{story}</pre>
          <button onClick={handleSave} style={{ marginTop: "1rem" }}>💾 Save Story</button>
        </div>
      )}
    </div>
  );
};

export default PromptStory;
