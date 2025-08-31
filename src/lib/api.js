// src/lib/api.js
// Base URL: comes from Vercel env (VITE_API_BASE). Fallbacks for dev/prod.
export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://ft-backend-i2uk.onrender.com");

// Generic API wrapper that auto-attaches the JWT (if present)
export async function api(path, init = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  // Let callers get readable error text
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  // Try JSON, else return raw text
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

// ---- Specific endpoint helpers ----

// Login (POST /coaches/login)
export function loginCoach(email, password) {
  return api("/coaches/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

// Me (GET /coaches/me)
export function getMyProfile() {
  return api("/coaches/me", { method: "GET" });
}

// Register (POST /coaches/)  <-- NOTE the trailing slash!
export function registerCoach(payload) {
  return api("/coaches/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Update coach (PUT /coaches/:id)
export function updateCoach(id, payload) {
  return api(`/coaches/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
