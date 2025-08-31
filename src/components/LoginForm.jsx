// login

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContextProvider";
import { loginCoach, fetchMe } from "../lib/api";

function safeJson(obj) {
  if (!obj || typeof obj !== "object") return {};
  return obj;
}
function extractToken(body) {
  const b = safeJson(body);
  return (
    b.token ||
    b.access_token ||
    b.jwt ||
    b.id_token ||
    (b.data && (b.data.token || b.data.access_token)) ||
    null
  );
}

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setToken } = useAuthContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);

      // 1) Login against the API_BASE backend
      const loginResponse = await loginCoach(form.email, form.password);

      const token = extractToken(loginResponse);
      if (!token) {
        setError("Invalid login response (no token).");
        return;
      }

      // 2) Fetch the profile using the token
      const meBody = await fetchMe(token);

      const coach =
        (meBody.coach || meBody.user) ??
        meBody.data ??
        (Array.isArray(meBody) ? meBody[0] : meBody);

      if (!coach || !(coach.id || coach.coach_id)) {
        setError("Profile missing id.");
        return;
      }

      // 3) Persist session
      localStorage.setItem("token", token);
      setToken(token);
      localStorage.setItem("coach", JSON.stringify(coach));

      // 4) Go to dashboard
      const coachId = coach.id ?? coach.coach_id;
      navigate(`/dashboard/coaches/${coachId}`);
    } catch (err) {
      setError(err?.message || "Network error");
    } finally {
      setSubmitting(false);
      setForm({ email: "", password: "" });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl p-6 sm:p-8">
        <h2 className="text-white text-2xl sm:text-3xl font-semibold mb-6 text-center">
          Login
        </h2>

        {error && <div className="text-red-300 text-sm mb-3" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-200 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full h-12 text-base rounded-md bg-white text-gray-900 px-4 py-2 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-200 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full h-12 text-base rounded-md bg-white text-gray-900 px-4 py-2 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-base rounded-xl bg-orange-500 text-white font-medium hover:bg-gray-400 transition focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
