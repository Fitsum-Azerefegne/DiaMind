export default function TrendChart({ entries }) {
  const w = 600, h = 130, padTop = 10, padBottom = 26, padX = 34;

  if (entries.length < 2) {
    return (
      <svg className="trend-chart" viewBox={`0 0 ${w} ${h}`}>
        <text x="10" y="55" fill="#CFE0D9" fontSize="12" fontFamily="IBM Plex Sans">
          Add a couple more entries to see a trend line here.
        </text>
      </svg>
    );
  }

  const plotH = h - padTop - padBottom;
  const maxScores = entries.map((e) => Math.max(...Object.values(e.scores)));
  const stepX = (w - padX * 2) / (maxScores.length - 1);
  const points = maxScores.map((s, i) => [padX + i * stepX, padTop + plotH - s * plotH]);
  const pathD = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");

  const firstDate = new Date(entries[0].timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const lastDate = new Date(entries[entries.length - 1].timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <svg className="trend-chart" viewBox={`0 0 ${w} ${h}`}>
      {[0, 50, 100].map((pct) => {
        const y = padTop + plotH - (pct / 100) * plotH;
        return (
          <g key={pct}>
            <text x={padX - 8} y={y} fill="#7FA096" fontSize="10" fontFamily="IBM Plex Sans" textAnchor="end" dominantBaseline="middle">
              {pct}%
            </text>
            <line x1={padX} y1={y} x2={w - padX + 10} y2={y} stroke="#2E5D53" strokeWidth="0.5" strokeDasharray="2,3" />
          </g>
        );
      })}
      <path d={pathD} fill="none" stroke="#8FA998" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill="#E8927C" />
      ))}
      <text x={padX} y={h - 6} fill="#7FA096" fontSize="10" fontFamily="IBM Plex Sans">{firstDate}</text>
      <text x={w - padX} y={h - 6} fill="#7FA096" fontSize="10" fontFamily="IBM Plex Sans" textAnchor="end">{lastDate}</text>
    </svg>
  );
}
