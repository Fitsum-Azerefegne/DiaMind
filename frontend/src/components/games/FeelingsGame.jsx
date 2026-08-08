import { useState } from "react";

const FEELINGS = [
  { emoji: "😊", label: "Doing well", color: "warm" },
  { emoji: "😤", label: "Frustrated", color: "" },
  { emoji: "😰", label: "Anxious", color: "" },
  { emoji: "😔", label: "Down", color: "" },
  { emoji: "😤", label: "Burnt out", color: "" },
  { emoji: "💪", label: "Proud of myself", color: "warm" },
];

const RESPONSES = {
  "Doing well": {
    text: "That's so good to hear! 🌟 Seriously — good days with T1D deserve to be celebrated. Whatever you did today, it worked. Hold onto that feeling.",
    prompt: "What made today feel good? (optional)",
    blue: false,
  },
  "Frustrated": {
    text: "Frustration with T1D is so valid. The unpredictability, the constant decisions, the numbers that don't cooperate — it's genuinely exhausting. You're not alone in this. 💙",
    prompt: "Want to say what's been frustrating? Sometimes just naming it helps.",
    blue: true,
  },
  "Anxious": {
    text: "Anxiety and T1D often go hand in hand — there's always something to watch, something to worry about. Take a breath. You're managing something really hard, and you're still here. 💙",
    prompt: "What's been on your mind? You can write it out here.",
    blue: true,
  },
  "Down": {
    text: "It's okay to have hard days. You don't have to be strong all the time. Living with T1D is a lot, and feeling down sometimes doesn't mean you're failing — it means you're human. 💙",
    prompt: "Want to share what's going on? No pressure at all.",
    blue: true,
  },
  "Burnt out": {
    text: "Diabetes burnout is real and it's recognized — it's not weakness, it's what happens when you've been managing something relentlessly for a long time. Please be kind to yourself today. 💙",
    prompt: "What's been the hardest part lately?",
    blue: true,
  },
  "Proud of myself": {
    text: "YES! 🎉 You should be proud. Managing T1D takes skill, discipline, and resilience every single day. Whatever you did — big or small — it counts. You're doing amazing.",
    prompt: "Tell me what you're proud of! I want to hear it 🌟",
    blue: false,
  },
};

const AFFIRMATIONS = [
  "You are more than your numbers. 💙",
  "Every day with T1D is a small act of courage.",
  "You don't have to be perfect — you just have to keep going.",
  "Your feelings about this are valid. All of them.",
  "Managing T1D is a full-time job. Give yourself credit.",
  "You are not alone in this. There's a whole community behind you.",
  "Bad days don't erase all the good ones.",
  "You showed up today. That matters.",
];

export default function FeelingsGame() {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [affirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);

  function reset() {
    setSelected(null);
    setNote("");
    setSubmitted(false);
  }

  const response = selected ? RESPONSES[selected.label] : null;

  return (
    <div className="card">
      <h2>How are you feeling right now?</h2>
      <p className="settings-copy">No wrong answers. This is just for you — a moment to check in with yourself. 💙</p>

      {!submitted ? (
        <>
          <div className="feelings-grid">
            {FEELINGS.map((f) => (
              <button
                key={f.label}
                className={`feeling-btn ${selected?.label === f.label ? `selected ${f.color}` : ""}`}
                onClick={() => setSelected(f)}
              >
                <span className="feeling-emoji">{f.emoji}</span>
                <span className="feeling-label">{f.label}</span>
              </button>
            ))}
          </div>

          {response && (
            <>
              <div className={`feeling-response ${response.blue ? "blue" : ""}`}>
                {response.text}
              </div>
              <p className="feeling-prompt">{response.prompt}</p>
              <textarea
                className="feeling-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write here... or leave it blank, that's okay too."
              />
              <div className="actions">
                <button className="primary" onClick={() => setSubmitted(true)}>Done ✓</button>
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
            Thanks for checking in with yourself today.
          </p>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20, fontStyle: "italic" }}>
            "{affirmation}"
          </p>
          <button className="ghost-btn on-paper" onClick={reset}>Check in again</button>
        </div>
      )}
    </div>
  );
}
