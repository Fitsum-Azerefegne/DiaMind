import { LABEL_NAMES } from "../constants";

export default function HistoryList({ entries }) {
  const recent = entries.slice().reverse().slice(0, 8);

  return (
    <div className="history-list">
      {recent.map((e, i) => {
        const top = Object.entries(e.scores).sort((a, b) => b[1] - a[1])[0];
        const date = new Date(e.timestamp).toLocaleString();
        const text = e.text.length > 90 ? e.text.slice(0, 90) + "…" : e.text;
        return (
          <div className="history-item" key={i}>
            <div className="h-text">{text}</div>
            <div className="h-meta">
              {date} · top signal: {LABEL_NAMES[top[0]] || top[0]} ({(top[1] * 100).toFixed(0)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
}
