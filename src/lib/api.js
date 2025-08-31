// src/lib/api.js
// Base URL from Vercel env. Local dev falls back to localhost.
export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://ft-backend-i2uk.onrender.com");

// Generic fetch wrapper that auto-attaches Authorization (if token exists)
export async function api(path, init = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

/* -------------------- Coaches -------------------- */
export function loginCoach(email, password) {
  return api("/coaches/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function getMyProfile() {
  return api("/coaches/me", { method: "GET" });
}

export function registerCoach(payload) {
  // NOTE trailing slash required by backend
  return api("/coaches/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateCoach(id, payload) {
  return api(`/coaches/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function listClientsForCoach(coachId) {
  return api(`/coaches/${coachId}/clients`, { method: "GET" });
}

/* -------------------- Clients -------------------- */
export const listClients   = () => api("/clients/", { method: "GET" });
export const getClient     = (id) => api(`/clients/${id}`, { method: "GET" });
export const createClient  = (payload) =>
  api("/clients/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
export const updateClient  = (id, payload) =>
  api(`/clients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
export const deleteClient  = (id) => api(`/clients/${id}`, { method: "DELETE" });

/* -------------------- Workouts ------------------- */
export const listWorkouts  = () => api("/workouts/", { method: "GET" });
export const getWorkout    = (id) => api(`/workouts/${id}`, { method: "GET" });
export const createWorkout = (payload) =>
  api("/workouts/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
export const updateWorkout = (id, payload) =>
  api(`/workouts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
export const deleteWorkout = (id) => api(`/workouts/${id}`, { method: "DELETE" });

/* -------------------- Exercises ------------------ */
export const listExercises   = () => api("/exercises/", { method: "GET" });
export const getExercise     = (id) => api(`/exercises/${id}`, { method: "GET" });
export const createExercise  = (payload) =>
  api("/exercises/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
export const updateExercise  = (id, payload) =>
  api(`/exercises/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
export const deleteExercise  = (id) => api(`/exercises/${id}`, { method: "DELETE" });

// available loads for an exercise: GET /exercises/:id/weights?unit=kg|lbs
export const getExerciseWeights = (exerciseId, unit = "kg") =>
  api(`/exercises/${exerciseId}/weights?unit=${encodeURIComponent(unit)}`, {
    method: "GET",
  });
