const API_BASE = "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // some endpoints (exports) aren't JSON -- caller handles those separately
  }
  if (!res.ok) {
    const message = (data && data.detail) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  signup: (email, password) =>
    request("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  login: (email, password) =>
    request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  me: (token) => request("/me", { headers: authHeaders(token) }),

  analyze: (token, text) =>
    request("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ text }),
    }),

  trend: (token) => request("/trend", { headers: authHeaders(token) }),

  factOfTheDay: () => request("/facts/today"),

  changePassword: (token, currentPassword, newPassword) =>
    request("/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),

  deleteAccount: (token, password) =>
    request("/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ password }),
    }),

  exportFile: async (token, format) => {
    const res = await fetch(`${API_BASE}/export/${format}`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diamind_journal_export.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default API_BASE;
