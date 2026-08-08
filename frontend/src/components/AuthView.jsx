import { useEffect, useRef, useState } from "react";
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
  const googleButtonRef = useRef(null);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setError("");
          setLoading(true);
          try {
            const resp = await api.googleLogin(response.credential);
            await loginWithToken(resp.access_token);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 380,
        text: isSignup ? "signup_with" : "signin_with",
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    const scriptId = "google-identity-services";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = renderGoogleButton;
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", renderGoogleButton, { once: true });
    }
  }, [googleClientId, isSignup, loginWithToken]);

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
    <div className="page auth-page">
      <div className="auth-shell">
        <section className="auth-intro">
          <div className="auth-brand-lockup">
            <div className="brand-mark brand-mark-large" aria-hidden="true">
              <span />
            </div>
            <div>
              <div className="auth-brand-name">DiaMind</div>
              <p className="auth-brand-tagline">A private place for the emotional side of T1D</p>
            </div>
          </div>

          <div className="auth-kicker">Track feelings. Surface patterns. Protect privacy.</div>
          <h1>{isSignup ? "Build a clearer picture of the hard days" : "Make the invisible load visible"}</h1>
          <p className="auth-lead">
            DiaMind turns your journal entries into a sharper view of overwhelm, guilt, fear, and isolation so you can see what keeps showing up instead of carrying it alone.
          </p>

          <div className="auth-stats">
            <div className="stat-card">
              <div className="stat-value">1</div>
              <div className="stat-label">private journal</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">3</div>
              <div className="stat-label">ways to reflect</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">medical advice</div>
            </div>
          </div>

          <div className="auth-feature-grid">
            <div className="auth-feature">
              <div className="auth-feature-index">01</div>
              <h3>Write plainly</h3>
              <p>Capture the day in your own words, without having to sanitize the hard parts.</p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-index">02</div>
              <h3>Read the signals</h3>
              <p>See the emotional patterns hidden inside the language you already use.</p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-index">03</div>
              <h3>Spot momentum</h3>
              <p>Watch the trend over time so one rough night does not define the story.</p>
            </div>
          </div>

          <div className="auth-proof-row">
            {LEGEND.slice(0, 3).map((item) => (
              <div className="auth-proof-pill" key={item.label}>
                <span />
                {item.label}
              </div>
            ))}
          </div>
        </section>

        <section className="auth-panel card">
          <div className="auth-panel-head">
            <div>
              <div className="auth-panel-kicker">{isSignup ? "Create your account" : "Welcome back"}</div>
              <h2>{isSignup ? "Start your private space" : "Sign in to continue"}</h2>
            </div>
            <div className="auth-panel-chip">Secure by design</div>
          </div>

          <p className="auth-panel-copy">
            {isSignup ? "Join DiaMind and start turning your entries into clear emotional patterns." : "Pick up where you left off and keep tracking what matters."}
          </p>

          <div className="google-auth-wrap">
            <div ref={googleButtonRef} className="google-button-slot" />
            {!googleClientId && (
              <p className="auth-helper-text">
                Add VITE_GOOGLE_CLIENT_ID on the frontend and GOOGLE_CLIENT_ID on the backend to enable Google sign-in.
              </p>
            )}
          </div>

          <div className="auth-divider"><span>or</span></div>

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
            <div className="actions auth-actions">
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
        </section>
      </div>
    </div>
  );
}
