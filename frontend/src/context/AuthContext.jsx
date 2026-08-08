import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("diamind_token"));
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("diamind_token");
  }, []);

  const loginWithToken = useCallback(async (newToken) => {
    localStorage.setItem("diamind_token", newToken);
    setToken(newToken);
    const me = await api.me(newToken);
    setUser(me);
  }, []);

  useEffect(() => {
    async function checkSession() {
      if (!token) {
        setCheckingSession(false);
        return;
      }
      try {
        const me = await api.me(token);
        setUser(me);
      } catch (e) {
        logout();
      } finally {
        setCheckingSession(false);
      }
    }
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loginWithToken, logout, checkingSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
