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
      {/* Wrapper: stacks on mobile, row on desktop */}
      <section className="relative z-0 pt-20 md:pt-0 px-4 md:px-0">
        <div className="flex flex-col md:flex-row gap-12 bg-transparent text-white">
          {/* LEFT SIDE */}
          <div className="flex-1">
            {/* Intro ONLY on desktop */}
            <div className="hidden md:block">
              <h2 className="text-4xl font-bold text-white mt-5">Dashboard</h2>
              <p className="text-sm max-w-[100ch]">
                Welcome to your trainer dashboard! Here you can easily manage all the tools you need
                in one place; from adding new clients and creating personalized workout plans to
                tracking progress and organizing your sessions. Everything is designed to help you
                stay efficient and focused on what matters most: helping your clients achieve their
                fitness goals.
              </p>
            </div>

            {/* Tools (ONLY on desktop) */}
            <div className="hidden md:flex md:flex-nowrap gap-x-12 mt-15">
              {/* Left column */}
              <div>
                <img src={healthIcon} alt="Health Icon" className="w-15 h-auto ml-8" />
                <p className="text-xs font-bold mt-2 ml-11">Health</p>

                <img
                  src={stopwatchIcon}
                  alt="Stopwatch Icon"
                  className="w-15 h-auto mt-15 ml-8"
                />
                <p className="text-xs font-bold mt-2 ml-11">Timers</p>
              </div>

              {/* Middle column */}
              <div>
                <img src={strenghtIcon} alt="Strenght Icon" className="w-15 h-auto ml-8" />
                <p className="text-xs font-bold mt-2 ml-9">Strenght</p>

                <div className="group">
                  <button
                    onClick={openProfileModal}
                    className="flex flex-col items-center mt-15 group-hover:text-orange-500 focus:outline-none"
                    title="Open Profile"
                  >
                    <img
                      src={trainerIcon}
                      alt="Trainer Icon"
                      className="w-15 h-auto ml-8 group-hover:scale-95 cursor-pointer transition-transform"
                    />
                    <p className="text-xs font-bold mt-2 ml-9 cursor-pointer">Profile</p>
                  </button>
                </div>
              </div>

              {/* Right column */}
              <div>
                <img src={suplementsIcon} alt="Suplements Icon" className="w-15 h-auto ml-8" />
                <p className="text-xs font-bold mt-2 ml-7">Suplements</p>

                <img
                  src={ClipIcon}
                  alt="Clip Icon"
                  className="w-15 h-auto mt-15 ml-8"
                />
                <p className="text-xs font-bold mt-2 ml-11">Cicles</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (visual) — only visible on desktop */}
          <div className="hidden md:block md:-mt-50 md:-ml-50">
            <img src={dumbbellOrange} alt="Dumbbell Orange" className="w-200 h-auto mt-30" />
          </div>
        </div>
      </section>

      {/* ===== Modal: Coach Profile ===== */}
      {showProfileModal && coach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          />
          <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl p-4 sm:p-6 text-white">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-200 mb-1">Name</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.name || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Last name</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.last_name || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Profile name</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.profile_name || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Phone</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.phone || "—"}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-200 mb-1">Email</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.email || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">City</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.city || "—"}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1 -mt-15">Training speciality</label>
                <div className="text-base rounded-sm text-orange-500 ">
                  {coach?.training_speciality || "—"}
                </div>
              </div>
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
