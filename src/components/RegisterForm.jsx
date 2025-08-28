import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const emptyForm = {
  name: "",
  lastName: "",
  profileName: "",
  email: "",
  phone: "",
  city: "",
  trainingSpeciality: "",
  password: "",
  confirmPassword: "",
};

function normalizeToFormShape(src) {
  if (!src || typeof src !== "object") return null;
  const name = src.name ?? "";
  const lastName = src.lastName ?? src.last_name ?? src.surname ?? "";
  const profileName = src.profileName ?? src.profile_name ?? src.profile ?? "";
  const email = src.email ?? "";
  const phone = src.phone ?? "";
  const city = src.city ?? "";
  const trainingSpeciality =
    src.trainingSpeciality ?? src.training_speciality ?? "";
  return {
    id: src.id ?? src.coach_id ?? src.user_id ?? null,
    name,
    lastName,
    profileName,
    email,
    phone,
    city,
    trainingSpeciality,
  };
}

function RegisterForm({ mode = "create", initialData = null, onUpdated, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isEdit = mode === "edit";
  const heading = isEdit ? "Update Your Profile" : "Create your account";
  const cta     = isEdit ? "Update Profile"       : "Create account";

  const prefill = useMemo(() => {
    const fromProp = normalizeToFormShape(initialData);
    if (fromProp) return fromProp;
    try {
      const fromLocal = normalizeToFormShape(
        JSON.parse(localStorage.getItem("coach") || "null")
      );
      return fromLocal;
    } catch {
      return null;
    }
  }, [initialData]);

  useEffect(() => {
    if (isEdit && prefill) {
      setForm({
        name: prefill.name,
        lastName: prefill.lastName,
        profileName: prefill.profileName,
        email: prefill.email,
        phone: prefill.phone,
        city: prefill.city,
        trainingSpeciality: prefill.trainingSpeciality,
        password: "",
        confirmPassword: "",
      });
    }
  }, [isEdit, prefill]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEdit && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (isEdit && form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const basePayload = {
      name: form.name,
      last_name: form.lastName,
      profile_name: form.profileName?.trim() || "",
      phone: form.phone,
      email: form.email,
      city: form.city,
      training_speciality: form.trainingSpeciality,
    };

    const payload = {
      ...basePayload,
      ...(isEdit
        ? (form.password ? { password: form.password } : {})
        : { password: form.password }),
    };

    try {
      setSubmitting(true);

      if (isEdit) {
        const token = localStorage.getItem("token");
        const id = prefill?.id;
        if (!id) {
          setError("Missing coach id for update.");
          return;
        }
        const res = await fetch(`/coaches/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = (body && (body.error || body.message)) || `Update failed (${res.status})`;
          setError(msg);
          return;
        }
        const updatedCoach = body?.coach || { id, ...basePayload };

        // Notify parent
        if (typeof onUpdated === "function") onUpdated(updatedCoach);

        // Broadcast app-wide so other components (e.g., CoachProfile modal) refresh instantly
        window.dispatchEvent(new CustomEvent("coach:updated", { detail: updatedCoach }));
      } else {
        const res = await fetch("/coaches/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, password: form.password }),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            (body && (body.error || body.message)) ||
            `Registration failed (${res.status})`;
          setError(msg);
          return;
        }
        setForm(emptyForm);
        navigate("/login");
      }
    } catch (err) {
      setError(err?.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      <div className="w-full max-w-3xl rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl p-4 sm:p-6 relative">
        {/* ❌ close button */}
        {onClose && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center 
                      rounded-full bg-black/40 text-white text-xl 
                      hover:bg-black/60 hover:text-orange-400 
                      focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
          >
            &times;
          </button>
        )}

        <h2 className="text-white text-2xl sm:text-3xl font-semibold mb-4">
          {heading}
        </h2>

        {error && (
          <div role="alert" className="mb-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-4 py-2"
            />
          </div>

          {/* Last name */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">Last name</label>
            <input
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-4 py-2"
            />
          </div>

          {/* Profile name */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">Profile name</label>
            <input
              name="profileName"
              type="text"
              value={form.profileName}
              onChange={handleChange}
              required
              className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-4 py-2"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-4 py-2"
            />
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-200 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-4 py-2"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">City</label>
            <input
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-4 py-2"
            />
          </div>

          {/* Training speciality */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">Training speciality</label>
            <input
              name="trainingSpeciality"
              type="text"
              value={form.trainingSpeciality}
              onChange={handleChange}
              required
              className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-4 py-2"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">
              Password{isEdit ? " (optional)" : ""}
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              {...(isEdit ? {} : { required: true })}
              minLength={isEdit && !form.password ? undefined : 6}
              className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-4 py-2"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-gray-200 mb-1">
              Confirm password{isEdit ? " (if changing)" : ""}
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              {...(isEdit ? {} : { required: true })}
              minLength={isEdit && !form.password ? undefined : 6}
              className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-4 py-2"
            />
          </div>

          <div className="md:col-span-2 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-base rounded-xl bg-orange-500 text-white font-medium cursor-pointer"
            >
              {submitting ? (isEdit ? "Updating…" : "Creating…") : cta}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
