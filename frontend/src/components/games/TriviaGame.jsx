import { useState, useEffect, useRef } from "react";

const TRIVIA_QUESTIONS = [
  { q: "What organ produces insulin?", options: ["Liver", "Kidney", "Pancreas", "Spleen"], correct: 2, fun: "The pancreas has special beta cells that make insulin — in T1D, the immune system attacks them." },
  { q: "Type 1 diabetes is caused by what?", options: ["Eating too much sugar", "An autoimmune attack on beta cells", "A viral infection alone", "Lack of exercise"], correct: 1, fun: "T1D is an autoimmune condition — your immune system mistakenly destroys the insulin-making cells." },
  { q: "What does CGM stand for?", options: ["Clinical Glucose Model", "Continuous Glucose Monitor", "Combined Glucose Meter", "Certified Glucose Machine"], correct: 1, fun: "CGMs measure glucose in interstitial fluid every few minutes — a game changer for T1D management!" },
  { q: "In what year was insulin discovered?", options: ["1901", "1921", "1945", "1965"], correct: 1, fun: "1921 — Banting and Best at the University of Toronto. Before that, T1D was a death sentence." },
  { q: "What hormone raises blood glucose (opposite of insulin)?", options: ["Cortisol", "Glucagon", "Adrenaline", "Thyroxine"], correct: 1, fun: "Glucagon is released by alpha cells in the pancreas and tells the liver to release stored glucose." },
  { q: "The A1C test estimates average blood glucose over roughly how long?", options: ["1 day", "1 week", "2–3 months", "1 year"], correct: 2, fun: "A1C measures how much glucose has stuck to red blood cells, which live about 3 months." },
  { q: "What does 'diabetes' literally mean in Greek?", options: ["Sweet blood", "Siphon", "Silent illness", "Fatigue"], correct: 1, fun: "It means 'siphon' — referring to the excessive urination that was one of the first observed symptoms." },
  { q: "When is World Diabetes Day?", options: ["June 21", "September 1", "November 14", "December 25"], correct: 2, fun: "November 14 is Frederick Banting's birthday — one of the co-discoverers of insulin." },
  { q: "What is the 'dawn phenomenon'?", options: ["A type of insulin", "A morning rise in blood glucose from overnight hormones", "A CGM sensor error", "A form of exercise"], correct: 1, fun: "Growth hormone and cortisol spike in the early morning, causing blood sugar to rise — super common in T1D." },
  { q: "Ketones build up when the body breaks down what for energy (due to lack of insulin)?", options: ["Protein", "Fat", "Glycogen only", "Water"], correct: 1, fun: "Without insulin, cells can't use glucose, so the body burns fat instead — producing ketones as a byproduct." },
  { q: "What are the insulin-producing cell clusters in the pancreas called?", options: ["Islets of Langerhans", "Nephrons", "Alveoli", "Villi"], correct: 0, fun: "Named after Paul Langerhans who discovered them in 1869 — these tiny clusters contain beta cells." },
  { q: "Who was the first person successfully treated with insulin?", options: ["Frederick Banting", "Leonard Thompson", "Charles Best", "James Collip"], correct: 1, fun: "Leonard Thompson, a 14-year-old boy, received the first successful insulin injection in January 1922." },
  { q: "What year did biosynthetic human insulin (Humulin) become available?", options: ["1965", "1982", "1999", "2010"], correct: 1, fun: "Humulin was the first genetically engineered human medicine — made using E. coli bacteria." },
  { q: "What does 'basal' insulin do?", options: ["Covers meals", "Provides background insulin all day", "Lowers ketones fast", "Replaces glucagon"], correct: 1, fun: "Basal insulin mimics the slow, steady trickle your pancreas would normally release between meals." },
  { q: "What is a normal fasting blood glucose range (mg/dL)?", options: ["40–60", "70–99", "120–140", "150–180"], correct: 1, fun: "70–99 mg/dL is the target range. For T1D, hitting this consistently is a real achievement!" },
];

const TIMER_SECONDS = 15;

const CORRECT_MSGS = ["🎉 Nailed it!", "⚡ You got it!", "🌟 Correct!", "💪 That's right!", "🔥 On fire!"];
const WRONG_MSGS = ["No worries — now you know!", "Close one! Check the highlight.", "Learning moment! 💙", "It's all good — keep going!"];

function shuffledIndices(n) {
  return [...Array(n).keys()].sort(() => Math.random() - 0.5);
}

export default function TriviaGame() {
  const [order] = useState(() => shuffledIndices(TRIVIA_QUESTIONS.length));
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  const question = TRIVIA_QUESTIONS[order[index % order.length]];
  const total = TRIVIA_QUESTIONS.length;

  useEffect(() => {
    if (chosen !== null || timedOut) return;
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          setStreak(0);
          setFeedbackMsg("⏰ Time's up! The answer is highlighted.");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [index, chosen, timedOut]);

  function answer(i) {
    if (chosen !== null || timedOut) return;
    clearInterval(timerRef.current);
    setChosen(i);
    const correct = i === question.correct;
    if (correct) {
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setFeedbackMsg(CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)]);
    } else {
      setStreak(0);
      setFeedbackMsg(WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)]);
    }
  }

  function next() {
    if (index + 1 >= total) { setDone(true); return; }
    setChosen(null);
    setTimedOut(false);
    setFeedbackMsg("");
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setChosen(null);
    setTimedOut(false);
    setScore(0);
    setStreak(0);
    setFeedbackMsg("");
    setDone(false);
  }

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft <= 5 ? "#DC2626" : timeLeft <= 9 ? "#F59E0B" : "var(--accent)";
  const answered = chosen !== null || timedOut;

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>{pct >= 80 ? "🏆" : pct >= 50 ? "🌟" : "💙"}</div>
        <h2 style={{ textAlign: "center" }}>Quiz complete!</h2>
        <p style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", margin: "0 0 4px" }}>{score} / {total}</p>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 6 }}>
          {pct >= 80 ? "Incredible — you really know your T1D stuff! 🔥" : pct >= 50 ? "Solid effort! You're learning 💪" : "Every question is a learning moment 💙"}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Best streak: {bestStreak} in a row</p>
        <button className="primary" onClick={restart}>Play again</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Question {index + 1} / {total}</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {streak >= 2 && <span style={{ fontSize: 12, background: "#FEF9C3", color: "#B45309", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>🔥 {streak} streak</span>}
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>Score: {score}</span>
        </div>
      </div>

      {/* Timer bar */}
      <div style={{ height: 6, background: "#E2E8F0", borderRadius: 4, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: 4, transition: "width 1s linear, background 0.3s" }} />
      </div>
      <div style={{ fontSize: 12, color: timerColor, textAlign: "right", marginTop: -14, marginBottom: 10, fontWeight: 600 }}>{timeLeft}s</div>

      <p className="trivia-question">{question.q}</p>

      <div className="trivia-options">
        {question.options.map((opt, i) => {
          let cls = "trivia-opt-btn";
          if (answered) {
            if (i === question.correct) cls += " correct";
            else if (i === chosen) cls += " incorrect";
          }
          return (
            <button key={i} className={cls} disabled={answered} onClick={() => answer(i)}>
              {answered && i === question.correct && "✓ "}{opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: chosen === question.correct ? "#16A34A" : "#DC2626", marginBottom: 6 }}>
            {feedbackMsg}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", background: "var(--accent-light)", padding: "10px 12px", borderRadius: 8, lineHeight: 1.6 }}>
            💡 {question.fun}
          </div>
        </div>
      )}

      <div className="actions" style={{ marginTop: 16 }}>
        <button className="primary" onClick={next} disabled={!answered}>
          {index + 1 >= total ? "See results →" : "Next →"}
        </button>
      </div>
    </div>
  );
}
