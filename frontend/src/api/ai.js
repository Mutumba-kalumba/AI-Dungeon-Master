// src/api/ai.js

export async function sendQuestPromptToAI(prompt) {
    try {
      const response = await fetch("http://localhost:5000/side_quest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });
  
      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error("Failed to fetch side quest:", error);
      return "⚠️ An error occurred while fetching the side quest.";
    }
  }
  