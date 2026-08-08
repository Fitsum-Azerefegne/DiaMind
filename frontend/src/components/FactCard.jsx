import { useEffect, useState } from "react";
import { api } from "../api";

export default function FactCard() {
  const [fact, setFact] = useState(null);

  useEffect(() => {
    api.factOfTheDay().then(setFact).catch(() => {});
  }, []);

  if (!fact) return null;

  return (
    <div className="fact-card">
      <div className="fact-eyebrow">Fact of the day — {fact.category}</div>
      <p>{fact.text}</p>
    </div>
  );
}
