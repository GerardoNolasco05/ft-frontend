import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import portrait from "/images/portrait.png";
import clientsIcon from "/images/clients.svg";
import addClientIcon from "/images/addClient.svg";

import ClientForm from "./ClientForm";
import RegisterForm from "./RegisterForm";

// normalize: handle snake_case or camelCase from backend
function normalizeCoach(src) {
  if (!src || typeof src !== "object") return {};
  const id = src.id ?? src.coach_id ?? src.user_id ?? null;
  const name = src.name ?? "";
  const last_name = src.last_name ?? src.lastName ?? src.surname ?? "";
  const profile_name = src.profile_name ?? src.profileName ?? src.profile ?? "";
  const email = src.email ?? "";
  const phone = src.phone ?? "";
  const city = src.city ?? "";
  const training_speciality =
    src.training_speciality ?? src.trainingSpeciality ?? "";

  return {
    id,
    name,
    last_name,
    profile_name,
    email,
    phone,
    city,
    training_speciality,
    lastName: last_name,
    profileName: profile_name,
    trainingSpeciality: training_speciality,
  };
}

function CoachDashboard() {
  const [open, setOpen] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [savingClient, setSavingClient] = useState(false);
  const [clientError, setClientError] = useState("");

  const [coach, setCoach] = useState(() => {
    try {
      return normalizeCoach(JSON.parse(localStorage.getItem("coach") || "{}"));
    } catch {
      return {};
    }
  });

  const coachName = [coach?.name, coach?.last_name]
    .filter(Boolean)
    .join(" ") || "Coach";

  // fetch /coaches/me on mount to ensure full, fresh profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch("/coaches/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const normalized = normalizeCoach(
            data.coach || data.user || data.data || (Array.isArray(data) ? data[0] : data)
          );
          if (normalized?.id) {
            localStorage.setItem("coach", JSON.stringify(normalized));
            setCoach(normalized);
          }
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (!showClientModal && !showRegisterModal) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showClientModal) setShowClientModal(false);
      if (showRegisterModal) setShowRegisterModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showClientModal, showRegisterModal]);

  const handleSaveClient = async (data) => {
    setClientError("");
    const token = localStorage.getItem("token");

    const payload = {
      name: data.name,
      last_name: data.lastName,
      profile_name: data.profileName || "",
      phone: data.phone || "",
      email: data.email,
      city: data.city || "",
      coach_id: coach?.id,
    };

    const required = ["name", "last_name", "email", "coach_id"];
    const missing = required.filter((k) => !payload[k]);
    if (missing.length) {
      setClientError(`Missing: ${missing.join(", ")}`);
      return;
    }

    try {
      setSavingClient(true);
      const res = await fetch("/clients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          (body && (body.error || body.message)) ||
          `Failed to save client (${res.status})`;
        setClientError(msg);
        return;
      }
      setShowClientModal(false);
    } catch (err) {
      setClientError(err?.message || "Network error");
    } finally {
      setSavingClient(false);
    }
  };

  const handleCoachUpdated = (updatedCoach) => {
    const normalized = normalizeCoach(updatedCoach);
    localStorage.setItem("coach", JSON.stringify(normalized));
    setCoach(normalized);
    setShowRegisterModal(false);
  };

  return (
    <>
      <div className="flex-col mt-30 ml-15">
        <img
          src={portrait}
          alt="Portrait"
          className="w-32 h-auto transform transition-transform duration-200"
        />

        <div className="flex flex-col items-start">
          <h2 className="text-base font-semibold mt-1">{coachName}</h2>
          <h2 className="text-sm "> {coach?.training_speciality || "—"}</h2>
          <Link
            to={`/dashboard/coaches/${coach.id}`}
            onClick={() => setOpen(false)}
            className="hover:text-orange-500 transition-colors cursor-pointer"
          >
            <p className="text-sm mt-15">Dashboard</p>
          </Link>

          {/* Edit profile */}
          <button
            onClick={() => setShowRegisterModal(true)}
            className="hover:text-orange-500 text-sm mt-2 cursor-pointer"
          >
            Edit Profile
          </button>

          {/* Knowledge Hub toggle */}
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex mt-2 text-sm hover:text-orange-500 cursor-pointer"
              aria-expanded={open}
              aria-controls="knowledge-menu"
            >
              <p>Knowledge Hub</p>
            </button>

            {open && (
              <div
                id="knowledge-menu"
                className="absolute w-30 bg-gray-800 rounded-md shadow-lg p-2 flex flex-col space-y-2 text-sm max-h-40 overflow-y-auto z-10"
              >
                <Link
                  to="/dashboard/exercises"
                  onClick={() => setOpen(false)}
                  className="hover:text-orange-500 text-sm transition-colors cursor-pointer"
                >
                  Exercises
                </Link>
              </div>
            )}
          </div>

          <p className="text-sm mt-2">Schedule</p>
          <p className="text-sm mt-2">Tools</p>
          <p className="text-sm mt-2">Community</p>

          {/* Manage Clients */}
          <Link
            to="/dashboard/clients"
            className="group cursor-pointer"
            title="Manage your Clients"
          >
            <img
              src={clientsIcon}
              alt="Clients"
              className="w-10 h-auto mt-30 group-hover:scale-95"
            />
            <span className="text-xs group-hover:text-orange-500">
              Manage your Clients
            </span>
          </Link>

          {/* Add Client */}
          <button
            type="button"
            onClick={() => setShowClientModal(true)}
            className="group mt-10 cursor-pointer"
            aria-haspopup="dialog"
            aria-controls="add-client-modal"
            aria-expanded={showClientModal}
            title="Add a Client"
          >
            <img
              src={addClientIcon}
              alt="Add Client"
              className="w-10 h-auto group-hover:scale-95"
            />
            <span className="text-xs group-hover:text-orange-500 transition">
              Add a Client
            </span>
          </button>

          {clientError && (
            <div
              className="mt-3 text-xs text-red-300 max-w-[200px]"
              role="alert"
            >
              {clientError}
            </div>
          )}
        </div>
      </div>

      {/* ===== Modal: Add Client ===== */}
      {showClientModal && (
        <div
          id="add-client-modal"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClientModal(false)}
          />
          <div className="relative z-10 w-full max-w-3xl">
            <ClientForm
              coachId={coach?.id}
              onClose={() => setShowClientModal(false)}
              onSubmit={handleSaveClient}
              saving={savingClient}
            />
          </div>
        </div>
      )}

      {/* ===== Modal: Edit (RegisterForm prefilled with full coach) ===== */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRegisterModal(false)}
          />
          <div className="relative z-[61] w-full max-w-3xl">
            <RegisterForm
              mode="edit"
              initialData={coach}
              onUpdated={handleCoachUpdated}
              onClose={() => setShowRegisterModal(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}

export default CoachDashboard;
