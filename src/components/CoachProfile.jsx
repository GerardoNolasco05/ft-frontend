import React, { useEffect, useState } from "react";
import dumbbellOrange from "/images/dumbbell_orange.png";
import healthIcon from "/images/health_icon.png";
import strenghtIcon from "/images/strenght_icon.png";
import suplementsIcon from "/images/suplements_icon.png";
import stopwatchIcon from "/images/stopwatch_icon.png";
import trainerIcon from "/images/trainer_icon.png";
import ClipIcon from "/images/clip_icon.png";

function CoachProfile() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [coach, setCoach] = useState(null);

  const loadCoachFromStorage = () => {
    try {
      const data = JSON.parse(localStorage.getItem("coach") || "null");
      if (data) setCoach(data);
    } catch {
      // ignore
    }
  };

  // Load on mount
  useEffect(() => {
    loadCoachFromStorage();
  }, []);

  // Auto-refresh when RegisterForm broadcasts an update
  useEffect(() => {
    const onCoachUpdated = (e) => {
      if (e?.detail) setCoach(e.detail);
      else loadCoachFromStorage();
    };
    window.addEventListener("coach:updated", onCoachUpdated);
    return () => window.removeEventListener("coach:updated", onCoachUpdated);
  }, []);

  const openProfileModal = () => {
    loadCoachFromStorage();
    setShowProfileModal(true);
  };

  return (
    <>
      <div className="flex gap-12 bg-transparent text-white ">
        {/* LEFT SIDE */}
        <div className="flex-1">
          <h2 className="text-4xl font-bold text-white mt-5">Dashboard</h2>
          <p className="text-sm max-w-[100ch]">
            Welcome to your trainer dashboard! Here you can easily manage all the tools you need
            in one place; from adding new clients and creating personalized workout plans to
            tracking progress and organizing your sessions. Everything is designed to help you
            stay efficient and focused on what matters most: helping your clients achieve their
            fitness goals.
          </p>

          <div className="flex gap-12 mt-15">
            {/* Left column */}
            <div>
              <img src={healthIcon} alt="Health Icon" className="w-15 ml-8 h-auto" />
              <p className="text-xs font-bold ml-11 mt-2">Health</p>

              <img src={stopwatchIcon} alt="Stopwatch Icon" className="w-15 ml-8 h-auto mt-15" />
              <p className="text-xs font-bold ml-11 mt-2">Timers</p>
            </div>

            {/* Middle column */}
            <div>
              <img src={strenghtIcon} alt="Strenght Icon" className="w-15 ml-8 h-auto" />
              <p className="text-xs font-bold ml-9 mt-2">Strenght</p>

              {/* Profile button → opens modal */}
              <div className="group">
                <button
                  onClick={openProfileModal}
                  className="flex flex-col items-center mt-15 group-hover:text-orange-500 focus:outline-none"
                  title="Open Profile"
                >
                  <img
                    src={trainerIcon}
                    alt="Trainer Icon"
                    className="w-15 ml-8 h-auto group-hover:scale-95 cursor-pointer transition-transform"
                  />
                  <p className="text-xs font-bold ml-9 mt-2 cursor-pointer">Profile</p>
                </button>
              </div>
            </div>

            {/* Right column */}
            <div>
              <img src={suplementsIcon} alt="Suplements Icon" className="w-15 ml-8 h-auto" />
              <p className="text-xs font-bold ml-7 mt-2">Suplements</p>

              <img src={ClipIcon} alt="Clip Icon" className="w-15 ml-8 h-auto mt-15" />
              <p className="text-xs font-bold ml-11 mt-2">Cicles</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (visual) */}
        <div className="-mt-50 -ml-50">
          <img src={dumbbellOrange} alt="Dumbbell Orange" className="w-200 h-auto mt-30" />
        </div>
      </div>

      {/* ===== Modal: Coach Profile (RegisterForm-like style) ===== */}
      {showProfileModal && coach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          />

          {/* Card (same look as RegisterForm) */}
          <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl p-4 sm:p-6 text-white">
            {/* ❌ Close (same design as RegisterForm) */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowProfileModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center 
                         rounded-full bg-black/40 text-white text-xl 
                         hover:bg-black/60 hover:text-orange-400 
                         focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
            >
              &times;
            </button>

            <h2 className="text-white text-2xl sm:text-3xl font-semibold mb-4">
              Coach Profile
            </h2>

            {/* Read-only grid matching RegisterForm rhythm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Name</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.name || "—"}
                </div>
              </div>

              {/* Last name */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Last name</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.last_name || "—"}
                </div>
              </div>

              {/* Profile name */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Profile name</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.profile_name || "—"}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">Phone</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.phone || "—"}
                </div>
              </div>

              {/* Email (full width) */}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-200 mb-1">Email</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.email || "—"}
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">City</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.city || "—"}
                </div>
              </div>

              {/* Training speciality */}
              <div>
                <label className="block text-sm text-gray-200 mb-1 -mt-15">Training speciality</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.training_speciality || "—"}
                </div>
              </div>

              {/* ID */}
              <div>
                <label className="block text-sm text-gray-200 mb-1">ID</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.id ?? "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CoachProfile;
