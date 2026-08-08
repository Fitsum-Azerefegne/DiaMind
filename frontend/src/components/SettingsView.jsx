import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function SettingsView({ setView }) {
  const { token, logout } = useAuth();

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [deletePending, setDeletePending] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  async function handleChangePassword() {
    setPwError("");
    setPwSuccess("");
    if (!currentPw || !newPw) { setPwError("Fill in both fields."); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }

    setPwLoading(true);
    try {
      await api.changePassword(token, currentPw, newPw);
      setPwSuccess("Password updated.");
      setCurrentPw("");
      setNewPw("");
    } catch (e) {
      setPwError(e.message);
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePending) {
      setDeletePending(true);
      return;
    }
    setDeleteError("");
    if (!deletePassword) { setDeleteError("Enter your password to confirm."); return; }
    try {
      await api.deleteAccount(token, deletePassword);
      logout();
    } catch (e) {
      setDeleteError(e.message);
    }
  }

  return (
    <>
      <header className="hero">
        <div className="eyebrow">DiaMind — account</div>
        <h1>Settings</h1>
        <p>Manage your account and your data.</p>
      </header>

      <div className="card">
        <h2>Change password</h2>
        {pwError && <div className="error-msg">{pwError}</div>}
        {pwSuccess && <div className="success-msg">{pwSuccess}</div>}
        <div className="field">
          <label>Current password</label>
          <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} autoComplete="current-password" />
        </div>
        <div className="field">
          <label>New password</label>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
        </div>
        <div className="actions">
          <button className="primary" onClick={handleChangePassword} disabled={pwLoading}>
            {pwLoading ? "Updating..." : "Update password"}
          </button>
        </div>
      </div>

      <div className="card danger-card">
        <h2>Export your data</h2>
        <p className="settings-copy">Download every journal entry you've written, with its detected signals — useful to bring to a care team conversation.</p>
        <div className="actions" style={{ justifyContent: "flex-start" }}>
          <button className="ghost-btn on-paper" onClick={() => api.exportFile(token, "csv")}>Export CSV</button>
          <button className="ghost-btn on-paper" onClick={() => api.exportFile(token, "pdf")}>Export PDF</button>
        </div>
      </div>

      <div className="card danger-card">
        <h2 className="danger-title">Delete account</h2>
        <p className="settings-copy">This permanently deletes your account and every journal entry. There's no undo.</p>
        {deleteError && <div className="error-msg">{deleteError}</div>}
        {deletePending && (
          <div className="field">
            <label>Enter your password to confirm</label>
            <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
          </div>
        )}
        <div className="actions" style={{ justifyContent: "flex-start" }}>
          <button
            className={`danger-btn ${deletePending ? "confirming" : ""}`}
            onClick={handleDeleteAccount}
          >
            {deletePending ? "Confirm permanent deletion" : "Delete my account"}
          </button>
        </div>
      </div>

      <div className="actions view-back" style={{ justifyContent: "flex-start" }}>
        <button className="link-btn" style={{ color: "var(--sage)" }} onClick={() => setView("app")}>
          &larr; Back to journal
        </button>
      </div>
    </>
  );
}
