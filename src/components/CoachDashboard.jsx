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
  const training_speciality =
    src.training_speciality ?? src.trainingSpeciality ?? "";

  return {
    id,
    name,
    last_name,
    profile_name,
    training_speciality,
  };
}

function CoachDashboard() {
  const [showClientModal, setShowClientModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [savingClient, setSavingClient] = useState(false);
  const [clientError, setClientError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [coach, setCoach] = useState(() => {
    try {
      return normalizeCoach(JSON.parse(localStorage.getItem("coach") || "{}"));
    } catch {
      return {};
    }
  });

  const coachName =
    [coach?.name, coach?.last_name].filter(Boolean).join(" ") || "Coach";

  // fetch /coaches/me on mount
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
            data.coach ||
              data.user ||
              data.data ||
              (Array.isArray(data) ? data[0] : data)
          );
          if (normalized?.id) {
            localStorage.setItem("coach", JSON.stringify(normalized));
            setCoach(normalized);
          }
        }
      } catch {
        // ignore errors
      }
    })();
  }, []);

  const handleSaveClient = async (data) => {
    setClientError("");
    const token = localStorage.getItem("token");

    const payload = {
      name: data.name,
      last_name: data.lastName,
      email: data.email,
      coach_id: coach?.id,
    };

    if (!payload.name || !payload.last_name || !payload.email) {
      setClientError("Missing required fields");
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
      if (!res.ok) throw new Error("Failed to save client");
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
      {/* ===== Desktop Sidebar (unchanged original) ===== */}
      <div className="hidden md:block shadow-[6px_0_6px_-1px_rgba(0,0,0,0.2)]">
        <div className="flex-col h-screen ml-15">
          <img
            src={portrait}
            alt="Portrait"
            className="w-32 h-auto mt-30 transform transition-transform duration-200"
          />

          <div className="flex flex-col  items-start">
            <h2 className="text-base font-semibold mt-1">{coachName}</h2>
            <h2 className="text-sm ">{coach?.training_speciality || "—"}</h2>
            <Link
              to={`/dashboard/coaches/${coach.id}`}
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
              <div className="mt-3 text-xs text-red-300 max-w-[200px]">
                {clientError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Mobile Toolbar (transparent, below navbar, full shadow) ===== */}
      <div className="md:hidden relative w-screen mt-20 -ml-4 z-30 bg-transparent shadow-[0_15px_15px_-6px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Portrait + profile name */}
          <div className="flex items-center gap-3">
            <img
              src={portrait}
              alt="Portrait"
              className="w-12 h-12 rounded-full border"
            />
            <span className="font-medium">
              {coach?.profile_name || coachName}
            </span>
          </div>

          {/* Manage Clients + Add Client + Hamburger */}
          <div className="flex items-center mr-6">
            <Link
              to="/dashboard/clients"
              className="flex items-center px-3 py-2"
            >
              <img src={clientsIcon} alt="" className="w-8 h-8" />
              <span className="text-xs ml-2">Manage Clients</span>
            </Link>

            <button
              onClick={() => setShowClientModal(true)}
              className="flex items-center px-3 py-2"
            >
              <img src={addClientIcon} alt="" className="w-8 h-8" />
              <span className="text-xs ml-2">Add Client</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="ml-6 cursor-pointer"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="block w-5 h-0.5 bg-white" />
              <span className="block w-5 h-0.5 bg-white mt-1" />
              <span className="block w-5 h-0.5 bg-white mt-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Modals ===== */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowClientModal(false)}
          />
          <ClientForm
            coachId={coach?.id}
            onClose={() => setShowClientModal(false)}
            onSubmit={handleSaveClient}
            saving={savingClient}
          />
        </div>
      )}

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowRegisterModal(false)}
          />
          <RegisterForm
            mode="edit"
            initialData={coach}
            onUpdated={handleCoachUpdated}
            onClose={() => setShowRegisterModal(false)}
          />
        </div>
      )}
    </>
  );
}

export default CoachDashboard;
