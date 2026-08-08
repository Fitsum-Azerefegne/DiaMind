import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const LEGEND = [
  { label: "Management overwhelm", desc: "Exhaustion from the daily workload of carbs, dosing, monitoring" },
  { label: "Guilt / shame", desc: "Self-blame tied to numbers or perceived management \"failures\"" },
  { label: "Fear of complications", desc: "Anxiety centered on long-term health outcomes" },
  { label: "Social isolation", desc: "Feeling unseen or misunderstood by people around you" },
  { label: "Hopelessness", desc: "\"What's the point\" language, or a sense of futility" },
];

export default function AuthView() {
  const { loginWithToken } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }
    if (isSignup && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const resp = isSignup ? await api.signup(email, password) : await api.login(email, password);
      await loginWithToken(resp.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">DiaMind<span className="dot">.</span></div>
      </div>

      <header className="hero">
        <div className="eyebrow">DiaMind — daily check-in</div>
        <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p>A private, reflective space for how managing type 1 diabetes actually feels day to day. Not a diagnosis tool — a mirror.</p>
      </header>

      <div className="steps">
        <div className="step-row">
          <div className="step-num">01</div>
          <div><h4>Write</h4><p>A few honest lines about today — no formatting, no filter, whatever's actually true.</p></div>
        </div>
        <div className="step-row">
          <div className="step-num">02</div>
          <div><h4>Reflect</h4><p>See which language patterns showed up, described plainly, with the words that drove it.</p></div>
        </div>
        <div className="step-row">
          <div className="step-num">03</div>
          <div><h4>Track</h4><p>Watch the pattern over weeks, not just one hard day — that's where it actually means something.</p></div>
        </div>
      </div>

      <div className="legend">
        <div className="legend-title">What DiaMind listens for</div>
        {LEGEND.map((item) => (
          <div className="legend-row" key={item.label}>
            <div className="legend-dot" />
            <div className="legend-label">{item.label}</div>
            <div className="legend-desc">{item.desc}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>{isSignup ? "Sign up for DiaMind" : "Log in to your account"}</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </div>
          <div className="actions">
            <button className="primary" type="submit" disabled={loading}>
              {loading ? (isSignup ? "Signing up..." : "Logging in...") : (isSignup ? "Sign up" : "Log in")}
            </button>
          </div>
        </form>
        <div className="switch-line">
          {isSignup ? (
            <>Already have an account? <button onClick={() => { setIsSignup(false); setError(""); }}>Log in</button></>
          ) : (
            <>Don't have an account? <button onClick={() => { setIsSignup(true); setError(""); }}>Sign up</button></>
          )}
        </div>
      </div>
    </div>
  );
}
