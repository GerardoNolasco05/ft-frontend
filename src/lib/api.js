// src/lib/api.js
export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://ft-backend-i2uk.onrender.com"); // safe fallback

export async function api(path, init = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text || "{}");
      msg = j.error || j.message || msg;
    } catch {}
    throw new Error(msg);
  }
  // Allow endpoints that return no content
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : null;
}

/* ---- Auth helpers ---- */
export async function loginCoach(email, password) {
  return api(`/coaches/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe(token) {
  const res = await fetch(`${API_BASE}/coaches/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text || "{}");
      msg = j.error || j.message || msg;
    } catch {}
    throw new Error(msg);
  }
  try { return JSON.parse(text || "{}"); } catch { return {}; }
}

/* ---- Clients ---- */
export async function createClient(payload) {
  return api(`/clients/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
export async function updateClient(id, payload) {
  return api(`/clients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
export async function deleteClient(id) {
  return api(`/clients/${id}`, { method: "DELETE" });
}

/* ---- Workouts ---- */
export async function deleteWorkout(id) {
  return api(`/workouts/${id}`, { method: "DELETE" });
}
