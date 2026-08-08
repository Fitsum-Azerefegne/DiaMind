import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import FactCard from "./FactCard";
import ResultBars from "./ResultBars";
import TrendChart from "./TrendChart";
import HistoryList from "./HistoryList";

export default function JournalView() {
  const { token } = useAuth();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [entries, setEntries] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadTrend = useCallback(async () => {
    try {
      const data = await api.trend(token);
      setEntries(data.entries);
    } catch (e) {
      // non-critical -- trend just won't populate
    }
  }, [token]);

  useEffect(() => {
    loadTrend();
  }, [loadTrend]);

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError("");
    try {
      const data = await api.analyze(token, trimmed);
      setResult(data);
      setText("");
      await loadTrend();
    } catch (e) {
      setError("Couldn't reach the DiaMind API — make sure the backend is running.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="hero">
        <div className="eyebrow">DiaMind — your private signal journal</div>
        <h1>Turn today into something you can actually read back</h1>
        <p>Write the pressure, the wins, the frustration, and the moments in between. DiaMind keeps the emotional pattern visible without getting in the way.</p>
      </header>

      <FactCard />

      <div className="card">
        <h2>Today's entry</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell me about your day... a win, a frustration, how your numbers were, how you're feeling. Anything goes 💙"
        />
        <div className="actions">
          <button className="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Reading..." : "Save entry"}
          </button>
        </div>
        {error && <div className="error-msg" style={{ marginTop: 14 }}>{error}</div>}
        <ResultBars result={result} />
      </div>

      <div className="trend-section">
        <h3>Trend across your entries</h3>
        <div className="trend-legend">Each point = the strongest signal detected that day, 0–100%</div>
        <TrendChart entries={entries} />
        <HistoryList entries={entries} />
        <div className="export-row">
          <button className="ghost-btn" onClick={() => api.exportFile(token, "csv")}>Export CSV</button>
          <button className="ghost-btn" onClick={() => api.exportFile(token, "pdf")}>Export PDF</button>
        </div>
      </div>

      <div className="disclaimer">
        DiaMind reflects language patterns associated with diabetes distress, based on a model grounded in validated clinical distress instruments. It does not diagnose any condition and does not give medical or dosing advice. If entries trend upward over time, consider talking to your care team or a mental health professional.
      </div>
    </>
  );
}
