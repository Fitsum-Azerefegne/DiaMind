import { useState, useEffect } from "react";

const PAIRS = [
  { term: "Insulin", icon: "💉" },
  { term: "Glucose", icon: "🍬" },
  { term: "Pancreas", icon: "🫀" },
  { term: "CGM", icon: "📡" },
  { term: "Ketones", icon: "⚠️" },
  { term: "A1C", icon: "📊" },
  { term: "Basal", icon: "🌊" },
  { term: "Bolus", icon: "⚡" },
];

function newDeck() {
  const cards = PAIRS.flatMap(({ term, icon }) => [
    { id: term + "-word", pairId: term, display: term, type: "word" },
    { id: term + "-icon", pairId: term, display: icon, type: "icon" },
  ]);
  return cards.sort(() => Math.random() - 0.5);
}

export default function MemoryGame() {
  const [cards, setCards] = useState(newDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [bestMoves, setBestMoves] = useState(null);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(null);

  useEffect(() => {
    if (matched.size === PAIRS.length * 2) {
      setWon(true);
      if (bestMoves === null || moves < bestMoves) setBestMoves(moves);
    }
  }, [matched]);

  function newGame() {
    setCards(newDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLock(false);
    setWon(false);
    setShake(null);
  }

  function flip(idx) {
    if (lock || flipped.includes(idx) || matched.has(cards[idx].id)) return;
    const next = [...flipped, idx];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      setLock(true);
      const [a, b] = next;
      if (cards[a].pairId === cards[b].pairId) {
        setMatched((prev) => new Set([...prev, cards[a].id, cards[b].id]));
        setFlipped([]);
        setLock(false);
      } else {
        setShake(b);
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
          setShake(null);
        }, 700);
      }
    }
  }

  const remaining = PAIRS.length - matched.size / 2;

  if (won) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🎉</div>
        <h2 style={{ textAlign: "center" }}>You matched them all!</h2>
        <p style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", margin: "0 0 4px" }}>{moves} moves</p>
        {bestMoves !== null && <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>Best: {bestMoves} moves</p>}
        <button className="primary" onClick={newGame}>Play again</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h2 style={{ margin: 0 }}>Match the term 🔗</h2>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{remaining} left</span>
      </div>
      <p className="settings-copy" style={{ marginBottom: 14 }}>Match each T1D word with its emoji. Tap two cards to flip them.</p>

      <div className="memory-grid">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.has(card.id);
          const isMatched = matched.has(card.id);
          const isShaking = shake === i;
          return (
            <div
              key={card.id}
              className={`memory-card ${isFlipped ? "flipped" : ""} ${isMatched ? "matched" : ""}`}
              style={{
                fontSize: card.type === "icon" && isFlipped ? 22 : 11,
                animation: isShaking ? "shake 0.4s ease" : undefined,
                cursor: isMatched ? "default" : "pointer",
              }}
              onClick={() => flip(i)}
            >
              {isFlipped ? card.display : "?"}
            </div>
          );
        })}
      </div>

      <div className="actions">
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Moves: {moves}{bestMoves !== null ? ` · Best: ${bestMoves}` : ""}</span>
        <button className="primary" onClick={newGame}>New game</button>
      </div>

      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
    </div>
  );
}
