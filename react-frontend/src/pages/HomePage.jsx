import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const handleProceed = () => {
    console.log("Proceed clicked → redirecting to login");
    navigate("/login", { replace: true });
  };

  console.log("HomePage component rendered – no auto-login");

  /* ================= CRYSTAL ================= */
  const Crystal = () => {
    return (
      <div className="crystal-wrapper">
        <div className="crystal"></div>
        <div className="crystal-glow"></div>
      </div>
    );
  };

  /* ================= SHOOTING STARS ================= */
  const ShootingStars = () => {
    return (
      <div className="stars-container">
        {Array.from({ length: 15 }).map((_, i) => (
          <span
            key={i}
            className="shooting-star"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Audiowide&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&display=swap"
        rel="stylesheet"
      />

      <div className="home-container">

        {/* 🌌 BACKGROUND */}
        <ShootingStars />

        {/* 💎 CENTER CRYSTAL */}
        <Crystal />

        {/* ================= TOP LEFT SMALL SHOPMAN BRAND ================= */}
        <div className="shopman-brand-top">
          <div className="shopman-mini-badge">
            <img
              src="/images/shopman-logo.jpeg"
              alt="ShopMan"
              className="shopman-mini-logo"
            />
            <span>SHopMan</span>
          </div>
        </div>

        {/* ================= MAIN CENTER CONTENT ================= */}
        <div className="home-card">

          {/* BIG SPINNING LOGO IN MIDDLE */}
          <div className="shopman-center-logo-wrapper">
            <img
              src="/images/shopman-logo.jpeg"
              alt="ShopMan Logo"
              className="shopman-center-logo"
            />
          </div>

          {/* TEXT (UNCHANGED IDEA) */}
          <div className="hems-text">
            <span className="hems-letter">SH</span>
            <span className="hems-letter">op</span>
            <span className="hems-letter">M</span>
            <span className="hems-letter">an</span>
          </div>

          {/* WELCOME TEXT */}
          <div className="welcome-text">
            <h1>Welcome to Shopman Business Platform</h1>
            <p>
              Your trusted and reliable solution for managing and growing your business efficiently.
            </p>
          </div>

          <button
            className="proceed-button"
            onClick={handleProceed}
            type="button"
          >
            Proceed &gt;&gt;
          </button>

        </div>

        {/* FOOTER */}
        <footer className="home-footer">
          <div>
            Produced & Licensed by School of Accounting Package © 2026
          </div>
        </footer>

      </div>
    </>
  );
};

export default HomePage;
