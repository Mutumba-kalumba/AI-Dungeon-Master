import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const images = [
  "/assets/image1.png.webp",
  "/assets/image2.png.webp",
  "/assets/image3.png.webp",
  "/assets/image4.png.webp",
  "/assets/image5.png.webp",
  "/assets/image6.png.webp",
  "/assets/image7.png.webp",
  "/assets/image8.png.webp",
  "/assets/image9.png.webp",
  "/assets/image10.png.webp",
];

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      {/* Background Image */}
      <div
        className="background-image"
        style={{ backgroundImage: `url(${images[currentImage]})` }}
      ></div>

      {/* Navigation Bar */}
      <nav className="navbar">
        <span className="logo">AI Dungeon Master</span>
        <ul>
          <li><button onClick={() => navigate("/")}>Home</button></li>
          <li><button onClick={() => navigate("/saved")}>Saved Stories</button></li>
          <li><button onClick={() => navigate("/prompt-story")}>Generate Your own Story</button></li>
          <li><button onClick={() => navigate("/side-quests")}>Side Quests</button></li>
        </ul>
      </nav>

      {/* Main Content Box */}
      <div className="glass-box">
        <h1>Enter the Realm of the Unknown</h1>
        <p>Unleash the power of AI to craft your next adventure.</p>
        <button className="start-btn" onClick={() => navigate("/game")}>
          Begin Adventure →
        </button>
      </div>

      {/* Floating Image Cards */}
      <div className="floating-cards">
        <div className="card">
          <img src="/assets/image2.png.webp" alt="Adventure Preview" />
          <p>New Storyline Generator</p>
        </div>
        <div className="card">
          <img src="/assets/image4.png.webp" alt="Magic Theme" />
          <p>Magic Realms & Dark Legends</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
