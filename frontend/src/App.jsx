import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TopBar from "./components/TopBar";
import AuthView from "./components/AuthView";
import JournalView from "./components/JournalView";
import GamesView from "./components/GamesView";
import SettingsView from "./components/SettingsView";

function AppShell() {
  const { user, checkingSession } = useAuth();
  const [view, setView] = useState("app");

  if (checkingSession) {
    return null; // avoid a login-screen flash while we verify a saved session
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="page">
      <TopBar view={view} setView={setView} />
      {view === "app" && <JournalView />}
      {view === "games" && <GamesView setView={setView} />}
      {view === "settings" && <SettingsView setView={setView} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
