import { useAuth } from "../context/AuthContext";

export default function TopBar({ view, setView }) {
  const { user, logout } = useAuth();

  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <span />
        </div>
        <div className="brand-copy">
          <div className="brand-name">DiaMind</div>
          <div className="brand-subtitle">T1D emotional signal journal</div>
        </div>
      </div>
      {user && (
        <div className="nav-links">
          <button className={`nav-btn ${view === "app" ? "active" : ""}`} onClick={() => setView("app")}>Journal</button>
          <button className={`nav-btn ${view === "games" ? "active" : ""}`} onClick={() => setView("games")}>Games</button>
          <button className={`nav-btn ${view === "settings" ? "active" : ""}`} onClick={() => setView("settings")}>Settings</button>
          <button className="nav-btn logout" onClick={logout}>Log out</button>
        </div>
      )}
    </div>
  );
}
