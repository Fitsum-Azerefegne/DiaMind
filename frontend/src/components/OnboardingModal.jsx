import { useState } from "react";

const SLIDES = [
  {
    icon: "💎",
    title: "Welcome to DiaMind",
    subtitle: "Your private safe space for the emotional side of living with T1D.",
    steps: [
      { icon: "✍️", cls: "blue", title: "Write freely", desc: "Tell DiaMind how your day went — good days, hard days, frustrating numbers, small wins. No filter needed." },
      { icon: "🔍", cls: "yellow", title: "See your signals", desc: "DiaMind reads your language patterns and reflects back what it notices — things like overwhelm, guilt, or isolation." },
    ],
  },
  {
    icon: "📊",
    title: "Track over time",
    subtitle: "One entry is a moment. A week of entries is a pattern.",
    steps: [
      { icon: "📈", cls: "green", title: "Your trend chart", desc: "Watch how your emotional signals shift over days and weeks — that's where the real insight lives." },
      { icon: "💙", cls: "purple", title: "Games & check-ins", desc: "Head to Games for a feelings check-in, T1D trivia, and more — a break when you need one." },
    ],
  },
  {
    icon: "🛡️",
    title: "This is your space",
    subtitle: "Private, judgment-free, and built for T1D humans.",
    steps: [
      { icon: "🔒", cls: "blue", title: "Only you can see this", desc: "Your entries are private. DiaMind never shares your data or diagnoses anything." },
      { icon: "🩺", cls: "yellow", title: "Not a medical tool", desc: "DiaMind reflects language patterns — it's not a substitute for your care team. If something feels urgent, reach out to them." },
    ],
  },
];

export default function OnboardingModal({ onDone }) {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-icon">{current.icon}</div>
          <h2>{current.title}</h2>
          <p>{current.subtitle}</p>
        </div>
        <div className="modal-body">
          <div className="onboard-steps">
            {current.steps.map((s, i) => (
              <div className="onboard-step" key={i}>
                <div className={`onboard-step-icon ${s.cls}`}>{s.icon}</div>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="modal-dots">
            {SLIDES.map((_, i) => (
              <div key={i} className={`modal-dot ${i === slide ? "active" : ""}`} />
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="primary"
            style={{ width: "100%" }}
            onClick={() => isLast ? onDone() : setSlide(s => s + 1)}
          >
            {isLast ? "Let's go 💙" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
