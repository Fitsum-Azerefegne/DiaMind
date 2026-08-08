import { useState } from "react";
import TriviaGame from "./games/TriviaGame";
import MemoryGame from "./games/MemoryGame";
import ScrambleGame from "./games/ScrambleGame";
import FeelingsGame from "./games/FeelingsGame";

const TABS = [
  { key: "feelings", label: "💙 Feelings Check-in" },
  { key: "trivia", label: "Trivia" },
  { key: "memory", label: "Memory Match" },
  { key: "scramble", label: "Word Scramble" },
];

export default function GamesView({ setView }) {
  const [active, setActive] = useState("feelings");

  return (
    <>
      <header className="hero">
        <div className="eyebrow">DiaMind — take a breather</div>
        <h1>You deserve a break 💙</h1>
        <p>Check in with how you're feeling, or play a light game. No pressure, no scores that matter — just a moment for you.</p>
      </header>

      <div className="game-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`game-tab ${active === tab.key ? "active" : ""}`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "feelings" && <FeelingsGame />}
      {active === "trivia" && <TriviaGame />}
      {active === "memory" && <MemoryGame />}
      {active === "scramble" && <ScrambleGame />}

      <div className="actions view-back" style={{ justifyContent: "flex-start" }}>
        <button className="link-btn" onClick={() => setView("app")}>
          &larr; Back to journal
        </button>
      </div>
    </>
  );
}
