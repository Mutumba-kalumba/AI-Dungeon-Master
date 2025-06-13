import React, { useEffect, useState } from "react";

const SavedStories = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("savedStories");
    if (saved) {
      setStories(JSON.parse(saved));
    }
  }, []);

  const deleteStory = (indexToDelete) => {
    const updatedStories = stories.filter((_, index) => index !== indexToDelete);
    setStories(updatedStories);
    localStorage.setItem("savedStories", JSON.stringify(updatedStories));
  };

  return (
    <div className="saved-stories" style={{ padding: "2rem", color: "#fff" }}>
      <h1>📖 Saved Stories</h1>
      {stories.length === 0 ? (
        <p>No stories saved yet.</p>
      ) : (
        stories
          .slice()
          .reverse()
          .map((story, idx) => {
            const actualIndex = stories.length - 1 - idx; // match original index before reversing
            return (
              <div
                key={idx}
                style={{
                  background: "rgba(0,0,0,0.4)",
                  margin: "1rem 0",
                  padding: "1rem",
                  borderRadius: "10px",
                  position: "relative",
                }}
              >
                <h3>{story.npc || "Unknown NPC"}</h3>
                <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                  Saved on: {new Date(story.timestamp).toLocaleString()}
                </p>
                <pre style={{ whiteSpace: "pre-wrap" }}>{story.text}</pre>
                <button
                  onClick={() => deleteStory(actualIndex)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "crimson",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            );
          })
      )}
    </div>
  );
};

export default SavedStories;
