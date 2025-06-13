import { useState } from "react";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "You", text: input };
    setMessages([...messages, userMessage]);

    // Simulating AI Response (Replace this with actual API call)
    const aiResponse = { sender: "AI", text: "This is your AI Dungeon Master's response!" };
    setTimeout(() => {
      setMessages([...messages, userMessage, aiResponse]);
    }, 1000);

    setInput(""); // Clear input field
  };

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === "You" ? "user" : "ai"}`}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your action..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatBox;
