import { LABEL_NAMES, LABEL_DESCRIPTIONS, LABEL_ICONS } from "../constants";

function getLevel(score) {
  if (score >= 0.6) return { label: "Noticeable", cls: "high" };
  if (score >= 0.35) return { label: "A little", cls: "medium" };
  return { label: "Not much", cls: "low" };
}

export default function ResultBars({ result }) {
  if (!result) return null;

  const isPositive = !result.top_label;
  const activeLabel = result.top_label;

  return (
    <div className="result">
      <div className={`message ${isPositive ? "positive" : ""}`}>
        {result.context_message}
      </div>
      <div className="signal-cards">
        {Object.entries(result.scores).map(([label, score]) => {
          const level = getLevel(score);
          const isActive = label === activeLabel;
          return (
            <div className={`signal-card ${isActive ? "active" : ""}`} key={label}>
              <div className="signal-icon">{LABEL_ICONS[label]}</div>
              <div className="signal-body">
                <div className="signal-name">{LABEL_NAMES[label]}</div>
                <div className="signal-desc">{LABEL_DESCRIPTIONS[label]}</div>
              </div>
              <div className={`signal-level ${level.cls}`}>{level.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
