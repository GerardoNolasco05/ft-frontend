// src/lib/api.js
export const API_BASE =
  (import.meta.env.VITE_API_BASE ) ??
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://api.example.com"); // fallback if env missing

export async function api(path, init = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
