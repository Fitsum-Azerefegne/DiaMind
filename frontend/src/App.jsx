import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TopBar from "./components/TopBar";
import AuthView from "./components/AuthView";
import JournalView from "./components/JournalView";
import GamesView from "./components/GamesView";
import SettingsView from "./components/SettingsView";
import OnboardingModal from "./components/OnboardingModal";

function AppShell() {
  const { user, checkingSession } = useAuth();
  const [view, setView] = useState("app");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const key = `diamind_onboarded_${user.email}`;
      if (!localStorage.getItem(key)) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  function finishOnboarding() {
    localStorage.setItem(`diamind_onboarded_${user.email}`, "1");
    setShowOnboarding(false);
  }

  if (checkingSession) return null;
  if (!user) return <AuthView />;

  return (
    <div className="page app-page">
      {showOnboarding && <OnboardingModal onDone={finishOnboarding} />}
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
