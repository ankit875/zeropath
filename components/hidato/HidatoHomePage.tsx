import React, { useState } from "react";
import "./HidatoHomePage.css"; // We'll create this CSS file separately
import HidatoGrid from "./HidatoGrid";
import GameControls from "./GameControls";

const HidatoHomePage = () => {
  const [selectedTournament, setSelectedTournament] = useState("weekly");

  // Sample tournament data
  const tournaments = [
    {
      id: "weekly",
      name: "Weekly Challenge",
      endDate: "May 14, 2025",
      prize: "500 Coins",
      players: 856,
    },
    {
      id: "monthly",
      name: "Monthly Masters",
      endDate: "May 31, 2025",
      prize: "2000 Coins + Badge",
      players: 1243,
    },
    {
      id: "special",
      name: "Spring Championship",
      endDate: "June 7, 2025",
      prize: "5000 Coins + Trophy",
      players: 2187,
    },
  ];

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <div className="logo">Zeropath</div>
        </div>
        <nav className="main-nav">
          <button>Tournaments</button>
          <button>Leaderboard</button>
          <button>Rewards</button>
          <button>How to Play</button>
        </nav>
        <button className="menu-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="menu-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </header>

      {/* Hero Section */}
      <main className="main-content">
        <div className="hero-section">
          <h1 className="hero-title">Zeropath Tournaments</h1>
          <p className="hero-subtitle">
            Compete against players worldwide and win amazing rewards
          </p>
          <div className="hero-buttons">
            <button className="primary-button">Join Tournament</button>
            <button className="secondary-button">View Leaderboard</button>
          </div>
        </div>

        {/* Example Grid Preview with Tournament Info */}
        <div className="preview-container">
          <div className="preview-content">
            <div className="preview-section">
              <HidatoGrid />
            </div>
            <div className="preview-section">
              <GameControls />
            </div>
          </div>
        </div>
        {/* Active Tournaments */}
        <div className="tournaments-container">
          <h2 className="section-title">Active Tournaments</h2>
          <div className="tournaments-grid">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                onClick={() =>
                  tournament.id === "weekly" && setSelectedTournament(tournament.id)
                }
                className={`tournament-card ${
                  selectedTournament === tournament.id
                    ? "tournament-card-selected"
                    : ""
                } ${tournament.id !== "weekly" ? "tournament-card-disabled" : ""}`}
              >
                <h3 className="tournament-name">{tournament.name}</h3>
                <div className="tournament-detail">
                  <span className="detail-label">Ends:</span>
                  <span className="detail-value">{tournament.endDate}</span>
                </div>
                <div className="tournament-detail">
                  <span className="detail-label">Prize:</span>
                  <span className="detail-value prize">{tournament.prize}</span>
                </div>
                <div className="tournament-detail">
                  <span className="detail-label">Players:</span>
                  <span className="detail-value">{tournament.players}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all">
            <button className="link-button">View All Tournaments</button>
          </div>
        </div>
       

        {/* Features */}
        <div className="features-grid">
          <FeatureCard
            title="Weekly Tournaments"
            description="Join new tournaments every week with fresh puzzles and challenges."
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="feature-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <FeatureCard
            title="Win Rewards"
            description="Earn coins, badges, and trophies based on your tournament performance."
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="feature-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <FeatureCard
            title="Global Rankings"
            description="Compete with players worldwide and climb the global leaderboard."
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="feature-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
            }
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Zeropath Tournament | All Rights Reserved</p>
        <div className="footer-links">
          <button>Terms</button>
          <button>Privacy</button>
          <button>Contact</button>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => (
  <div className="feature-card">
    <div className="feature-icon-container">{icon}</div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-description">{description}</p>
  </div>
);

export default HidatoHomePage;
