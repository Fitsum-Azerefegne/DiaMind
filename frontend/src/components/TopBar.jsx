import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function TopBar({ view, setView }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(v) {
    setView(v);
    setMenuOpen(false);
  }

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><span /></div>
          <div className="brand-copy">
            <div className="brand-name">DiaMind</div>
            <div className="brand-subtitle">T1D emotional signal journal</div>
          </div>
        </div>

        {user && (
          <>
            {/* Desktop nav */}
            <div className="nav-links nav-desktop">
              <button className={`nav-btn ${view === "app" ? "active" : ""}`} onClick={() => navigate("app")}>Journal</button>
              <button className={`nav-btn ${view === "games" ? "active" : ""}`} onClick={() => navigate("games")}>Games</button>
              <button className={`nav-btn ${view === "settings" ? "active" : ""}`} onClick={() => navigate("settings")}>Settings</button>
              <button className="nav-btn logout" onClick={logout}>Log out</button>
            </div>

            {/* Mobile hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              <span className={menuOpen ? "ham-line open" : "ham-line"} />
              <span className={menuOpen ? "ham-line open" : "ham-line"} />
              <span className={menuOpen ? "ham-line open" : "ham-line"} />
            </button>
          </>
        )}
      </div>

      {/* Mobile dropdown */}
      {user && menuOpen && (
        <div className="mobile-nav">
          <button className={`mobile-nav-btn ${view === "app" ? "active" : ""}`} onClick={() => navigate("app")}>✍️ Journal</button>
          <button className={`mobile-nav-btn ${view === "games" ? "active" : ""}`} onClick={() => navigate("games")}>🎮 Games</button>
          <button className={`mobile-nav-btn ${view === "settings" ? "active" : ""}`} onClick={() => navigate("settings")}>⚙️ Settings</button>
          <button className="mobile-nav-btn logout" onClick={() => { logout(); setMenuOpen(false); }}>Log out</button>
        </div>
      )}
    </>
  );
}
