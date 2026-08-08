import { useState } from "react";

const WORDS = [
  { word: "INSULIN", hint: "The hormone T1D bodies can't make 💉" },
  { word: "GLUCOSE", hint: "The sugar your cells use for energy 🍬" },
  { word: "PANCREAS", hint: "The organ with the beta cells 🫀" },
  { word: "KETONES", hint: "Build up when there's not enough insulin ⚠️" },
  { word: "GLUCAGON", hint: "Raises blood sugar in an emergency 🚨" },
  { word: "BOLUS", hint: "The dose you take to cover a meal ⚡" },
  { word: "BASAL", hint: "The slow background insulin 🌊" },
  { word: "SENSOR", hint: "What a CGM uses to read your glucose 📡" },
  { word: "HORMONE", hint: "Chemical messenger in your body 📬" },
  { word: "MONITOR", hint: "What you do to your blood sugar 👀" },
  { word: "CARBS", hint: "The macronutrient that raises glucose most 🍞" },
  { word: "PUMP", hint: "A device that delivers insulin continuously 🔧" },
];

function scramble(word) {
  const arr = word.split("");
  let out;
  do { out = [...arr].sort(() => Math.random() - 0.5); }
  while (out.join("") === word);
  return out;
}

function pickWord(exclude = "") {
  const pool = WORDS.filter((w) => w.word !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function ScrambleGame() {
  const [entry, setEntry] = useState(() => pickWord());
  const [tiles, setTiles] = useState(() => scramble(entry.word).map((l, i) => ({ l, i, used: false })));
  const [chosen, setChosen] = useState([]);
  const [feedback, setFeedback] = useState(null); // null | "correct" | "wrong"
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  function loadWord(exclude = "") {
    const next = pickWord(exclude);
    setEntry(next);
    setTiles(scramble(next.word).map((l, i) => ({ l, i, used: false })));
    setChosen([]);
    setFeedback(null);
    setShowHint(false);
  }

  function pickTile(tile) {
    if (tile.used || feedback) return;
    setTiles((prev) => prev.map((t) => t.i === tile.i ? { ...t, used: true } : t));
    setChosen((prev) => [...prev, tile]);
  }

  function removeLast() {
    if (!chosen.length || feedback) return;
    const last = chosen[chosen.length - 1];
    setTiles((prev) => prev.map((t) => t.i === last.i ? { ...t, used: false } : t));
    setChosen((prev) => prev.slice(0, -1));
  }

  function check() {
    const guess = chosen.map((t) => t.l).join("");
    if (guess === entry.word) {
      setFeedback("correct");
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setTimeout(() => loadWord(entry.word), 1400);
    } else {
      setFeedback("wrong");
      setStreak(0);
      setTimeout(() => {
        setFeedback(null);
        setChosen([]);
        setTiles(scramble(entry.word).map((l, i) => ({ l, i, used: false })));
      }, 900);
    }
  }

  const guessWord = chosen.map((t) => t.l).join("");
  const isFull = chosen.length === entry.word.length;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>Word scramble 🔤</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {streak >= 2 && <span style={{ fontSize: 12, background: "#FEF9C3", color: "#B45309", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>🔥 {streak}</span>}
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>Score: {score}</span>
        </div>
      </div>

      <p className="settings-copy">Tap the letters in the right order to spell the T1D term.</p>

      {/* Answer slots */}
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 18, flexWrap: "wrap" }}>
        {Array.from({ length: entry.word.length }).map((_, i) => {
          const letter = chosen[i]?.l ?? "";
          const bg = feedback === "correct" ? "#DCFCE7" : feedback === "wrong" ? "#FEE2E2" : letter ? "var(--accent-light)" : "#F1F5F9";
          const border = feedback === "correct" ? "#16A34A" : feedback === "wrong" ? "#DC2626" : letter ? "var(--accent)" : "#CBD5E1";
          return (
            <div key={i} style={{
              width: 40, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
              background: bg, border: `2px solid ${border}`, borderRadius: 8,
              fontSize: 18, fontWeight: 700, color: "var(--ink)", transition: "all 0.15s",
            }}>
              {letter}
            </div>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback === "correct" && <div style={{ textAlign: "center", fontSize: 16, fontWeight: 700, color: "#16A34A", marginBottom: 10 }}>🎉 Correct!</div>}
      {feedback === "wrong" && <div style={{ textAlign: "center", fontSize: 15, fontWeight: 600, color: "#DC2626", marginBottom: 10 }}>Not quite — try again!</div>}

      {/* Scrambled tiles */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 18 }}>
        {tiles.map((tile) => (
          <button
            key={tile.i}
            onClick={() => pickTile(tile)}
            disabled={tile.used || !!feedback}
            style={{
              width: 42, height: 46, fontSize: 18, fontWeight: 700,
              background: tile.used ? "#F1F5F9" : "var(--accent)",
              color: tile.used ? "#CBD5E1" : "white",
              border: "none", borderRadius: 8, cursor: tile.used ? "default" : "pointer",
              transition: "all 0.15s", transform: tile.used ? "scale(0.9)" : "scale(1)",
            }}
          >
            {tile.l}
          </button>
        ))}
      </div>

      {/* Hint */}
      {showHint
        ? <div style={{ fontSize: 13, color: "var(--text-muted)", background: "var(--warm)", border: "1px solid var(--warm-border)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>💡 {entry.hint}</div>
        : <button className="ghost-btn on-paper" style={{ marginBottom: 14, fontSize: 12 }} onClick={() => setShowHint(true)}>Show hint</button>
      }

      <div className="actions">
        <button className="ghost-btn on-paper" onClick={removeLast} disabled={!chosen.length || !!feedback}>⌫ Undo</button>
        <button className="ghost-btn on-paper" onClick={() => loadWord(entry.word)}>Skip</button>
        <button className="primary" onClick={check} disabled={!isFull || !!feedback}>Check ✓</button>
      </div>
    </div>
  );
}
