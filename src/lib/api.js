// src/lib/api.js
export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://ft-backend-i2uk.onrender.com");

// Core fetch wrapper
export async function api(path, init = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  // read text once; decide how to parse
  const text = await res.text().catch(() => "");

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text || "{}");
      msg = j.error || j.message || msg;
    } catch {}
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? JSON.parse(text || "{}") : null;
}

/* ========= AUTH ========= */
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

/* ========= COACHES ========= */
export async function registerCoach(payload) {
  return api(`/coaches/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateCoach(id, payload) {
  return api(`/coaches/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/* ========= CLIENTS ========= */
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

/* ========= EXERCISES ========= */
export async function listExercises(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    )
  ).toString();
  const suffix = qs ? `?${qs}` : "";
  return api(`/exercises${suffix}`, { method: "GET" }); // no trailing slash needed
}

// 👇 NEW: fetch one exercise by id (used by ExHub.jsx)
export async function getExercise(id) {
  return api(`/exercises/${id}`, { method: "GET" });
}

/* ========= LOAD WEIGHTS ========= */
export async function getExerciseWeights(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    )
  ).toString();
  const suffix = qs ? `?${qs}` : "";
  return api(`/load-weights${suffix}`, { method: "GET" });
}

/* ========= WORKOUTS ========= */
export async function createWorkout(payload) {
  return api(`/workouts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateWorkout(id, payload) {
  return api(`/workouts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteWorkout(id) {
  return api(`/workouts/${id}`, { method: "DELETE" });
}
