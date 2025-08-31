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

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      mode: "cors",
      credentials: "omit",
    });

    // Read once; decide how to parse
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
    if (!ct.includes("application/json")) {
      // Helpful when a redirect/HTML page sneaks in
      console.error("Non-JSON response for", path, "→", text.slice(0, 300));
      throw new Error("API did not return JSON");
    }
    return JSON.parse(text || "{}");
  } catch (e) {
    // Surfaces the real reason instead of a generic "Failed to fetch"
    throw new Error(`Network error fetching ${path}: ${e?.message || e}`);
  }
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
    mode: "cors",
    credentials: "omit",
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
// Force trailing slash to match backend route behavior
export async function listExercises(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    )
  ).toString();
  const suffix = qs ? `?${qs}` : "";
  return api(`/exercises/${suffix}`, { method: "GET" });
}

export async function getExercise(id) {
  return api(`/exercises/${id}/`, { method: "GET" });
}

/* ========= LOAD WEIGHTS ========= */
// Updated: accept (exerciseId, unit) and call /exercises/:id/weights
export async function getExerciseWeights(exerciseId, unit = "kg") {
  const qs = new URLSearchParams({ unit }).toString();
  return api(`/exercises/${exerciseId}/weights?${qs}`, { method: "GET" });

  // If you want to use the alternate route added in load_weights_routes:
  // return api(`/load-weights/by-exercise/${exerciseId}/?${qs}`, { method: "GET" });
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
