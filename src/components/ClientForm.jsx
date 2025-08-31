import { useEffect, useMemo, useState } from "react";
import { createClient, updateClient } from "../lib/api";

const emptyForm = {
  name: "",
  lastName: "",
  profileName: "",
  phone: "",
  email: "",
  city: "",
};

// normalize any client object to our form shape
function normalizeClient(src) {
  if (!src || typeof src !== "object") return null;
  return {
    id: src.id ?? null,
    name: src.name ?? "",
    lastName: src.last_name ?? src.lastName ?? "",
    profileName: src.profile_name ?? src.profileName ?? "",
    phone: src.phone ?? "",
    email: src.email ?? "",
    city: src.city ?? "",
    coachId: src.coach_id ?? src.coachId ?? null,
  };
}

export default function ClientForm({
  mode = "create",            // "create" | "edit"
  coachId = null,             // preferred source for Coach ID
  initialData = null,         // client object for edit
  onClose,
  onSaved,
}) {
  const isEdit = mode === "edit";
  const heading = isEdit ? "Update Client" : "New Client";

  const prefill = useMemo(() => normalizeClient(initialData), [initialData]);

  // Resolve coach id automatically
  const effectiveCoachId = useMemo(() => {
    if (coachId) return coachId;
    if (prefill?.coachId) return prefill.coachId;
    try {
      const me = JSON.parse(localStorage.getItem("coach") || "null");
      return me?.id ?? null;
    } catch {
      return null;
    }
  }, [coachId, prefill]);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // prefill in edit mode
  useEffect(() => {
    if (isEdit && prefill) {
      setForm({
        name: prefill.name,
        lastName: prefill.lastName,
        profileName: prefill.profileName,
        phone: prefill.phone,
        email: prefill.email,
        city: prefill.city,
      });
    } else if (!isEdit) {
      setForm(emptyForm);
    }
  }, [isEdit, prefill]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const required = ["name", "lastName", "email"];
    const missing = required.filter((k) => !form[k]?.trim());
    if (!effectiveCoachId) missing.push("coach_id");
    if (missing.length) {
      setError(`Missing: ${missing.join(", ")}`);
      return;
    }

    const payload = {
      name: form.name.trim(),
      last_name: form.lastName.trim(),
      profile_name: form.profileName?.trim() || "",
      phone: form.phone?.trim() || "",
      email: form.email.trim(),
      city: form.city?.trim() || "",
      coach_id: effectiveCoachId,
    };

    try {
      setSubmitting(true);

      let saved;
      if (isEdit) {
        const id = prefill?.id;
        if (!id) {
          setError("Missing client id for update.");
          return;
        }
        saved = await updateClient(id, payload);
      } else {
        saved = await createClient(payload);
      }

      if (typeof onSaved === "function") onSaved(saved?.client || saved || payload);
      if (typeof onClose === "function") onClose();
    } catch (err) {
      setError(err?.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-xl border border-white/20 bg-stone-900 shadow-2xl p-6 max-h-[90vh] overflow-auto">
      {/* ❌ close */}
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center 
                     rounded-full bg-black/40 text-white text-xl 
                     hover:bg-black/60 hover:text-orange-400 
                     focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          &times;
        </button>
      )}

      <h2 className="text-white text-2xl font-semibold mb-4">{heading}</h2>

      {error && (
        <div role="alert" className="mb-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-200 mb-1">Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-3 py-2 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-200 mb-1">Last name</label>
          <input
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            required
            className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-3 py-2 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-200 mb-1">Profile name</label>
          <input
            name="profileName"
            type="text"
            value={form.profileName}
            onChange={handleChange}
            className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-3 py-2 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-200 mb-1">Phone</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-3 py-2 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-gray-200 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-3 py-2 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-200 mb-1">City</label>
          <input
            name="city"
            type="text"
            value={form.city}
            onChange={handleChange}
            className="w-full h-11 text-base rounded-sm bg-white text-gray-900 px-3 py-2 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-white/40"
          />
        </div>

        {/* Coach ID moved to bottom-right */}
        <div className="flex flex-col items-end md:col-span-1">
          <label className="block text-sm text-gray-200 mb-1">Coach ID</label>
          <input
            type="text"
            value={effectiveCoachId ?? ""}
            readOnly
            className="w-40 h-11 text-base rounded-sm bg-gray-700/60 text-gray-200 px-3 py-2 cursor-not-allowed text-right"
          />
          <p className="text-[11px] text-gray-400 mt-1">Assigned automatically</p>
        </div>

        {/* Submit button */}
        <div className="md:col-span-2 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 text-base rounded-xl bg-orange-500 text-white font-medium hover:bg-gray-400 transition focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (isEdit ? "Updating…" : "Saving…") : (isEdit ? "Update Client" : "Save Client")}
          </button>
        </div>
      </form>
    </div>
  );
}
