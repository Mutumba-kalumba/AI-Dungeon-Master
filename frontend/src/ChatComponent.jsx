import React, { useState } from "react";
import "./ChatComponent.css";

const ChatComponent = () => {
    const [messages, setMessages] = useState([]);
    const [choices, setChoices] = useState([]);
    const [inputMessage, setInputMessage] = useState("");

    const sendMessage = async (userChoice = "") => {
        if (!userChoice.trim()) return;

        const playerMessage = { sender: "player", text: userChoice };
        setMessages((prevMessages) => [...prevMessages, playerMessage]);

        try {
            const response = await fetch("http://127.0.0.1:5000/generate_story", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recent_choice: userChoice }),
            });

            const data = await response.json();

            // Debugging: Print response in console
            console.log("AI Response:", data);

            // Ensure AI response includes a valid story
            if (data.narrative && typeof data.narrative === "string" && data.narrative.trim().length > 0) {
                const formattedStory = `*NEW SECTION...*\n\n${data.narrative}\n\n---\n**What will you do?**`;
                
                setMessages((prevMessages) => [...prevMessages, { sender: "dm", text: formattedStory }]);

                // Ensure choices are separate and correctly formatted
                if (Array.isArray(data.choices) && data.choices.length > 0) {
                    setChoices(data.choices);
                } else {
                    setChoices([]);
                }
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: "dm", text: "*No valid story generated. Please try again.*" }
                ]);
                setChoices([]);
            }
        } catch (error) {
            console.error("Error fetching story:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { sender: "dm", text: "*Failed to connect to the AI Dungeon Master. Please try again.*" }
            ]);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === "player" ? "player-message" : "dm-message"}>
                        {msg.text}
                    </div>
                ))}
            </div>

            {choices.length > 0 && (
                <div className="choices-container">
                    {choices.map((choice, index) => (
                        <button key={index} onClick={() => sendMessage(choice)}>
                            {String.fromCharCode(65 + index)}) {choice}  {/* Adds A), B), C) formatting */}
                        </button>
                    ))}
                </div>
            )}

            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Type your own action..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(inputMessage)}
                />
                <button onClick={() => sendMessage(inputMessage)}>Send</button>
            </div>
        </div>
    );
};

export default ChatComponent;
