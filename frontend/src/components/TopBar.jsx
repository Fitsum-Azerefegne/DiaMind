import { useAuth } from "../context/AuthContext";

export default function TopBar({ view, setView }) {
  const { user, logout } = useAuth();

  return (
    <div className="topbar">
      <div className="brand">DiaMind<span className="dot">.</span></div>
      {user && (
        <div className="user-chip">
          <span>{user.email}</span>
          <button className="link-btn" onClick={() => setView("games")}>Games</button>
          <button className="link-btn" onClick={() => setView("settings")}>Settings</button>
          <button className="link-btn" onClick={logout}>Log out</button>
        </div>
      )}
    </div>
  );
}
