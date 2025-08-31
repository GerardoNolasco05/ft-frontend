// src/pages/ExHub.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listExercises, getExercise } from "../lib/api";


// Local images (adjust paths if yours differ)
import orange from "/images/orange.png";
import dum from "/images/dum.png";
import plate from "/images/plate.png";
import stair from "/images/str.png";
import ext from "/images/ext.png";

function ExHub() {
  // minimal list: [{id, name, load_type_id}]
  const [list, setList] = useState([]);
  const [idx, setIdx] = useState(0);                 // current index (no wrap)
  const [cache, setCache] = useState({});            // { [id]: detailedExercise }
  const [shownId, setShownId] = useState(null);      // id currently rendered
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // if you store a JWT, your api.js uses it automatically; keeping this for consistency
  const token = useMemo(() => localStorage.getItem("token") || "", []);

  // Map index -> image (idx is 0-based)
  const imagesByIndex = {
    0: dum,     // 1st exercise
    1: plate,   // 2nd
    2: stair,   // 3rd
    3: ext,     // 4th
    4: orange,  // 5th
  };

  // Helper to format arrays of {id,name} into "A, B, C"
  const names = (arr) =>
    Array.isArray(arr) && arr.length
      ? arr.map((x) => x && x.name).filter(Boolean).join(", ")
      : "—";

  // Load minimal list once
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setErr("");
        const arr = await listExercises();  // 👈 hits `${API_BASE}/exercises`
        if (ignore) return;
        const safe = Array.isArray(arr) ? arr : [];
        setList(safe);
        setIdx(0);
        if (safe.length) setShownId(safe[0].id); // render first immediately
      } catch (e) {
        if (!ignore) setErr(e?.message || "Failed to load exercises");
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  // When index changes, fetch full details for that id if not cached.
  // Keep previous content visible until details are ready; then swap `shownId`.
  useEffect(() => {
    if (!list.length) return;
    const id = list[idx] && list[idx].id;
    if (!id) return;

    // If details are cached, swap instantly.
    if (cache[id]) {
      if (shownId !== id) setShownId(id);
      return;
    }

    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getExercise(id);  // 👈 hits `${API_BASE}/exercises/:id`
        if (ignore) return;
        setCache((c) => ({ ...c, [id]: data }));
        setShownId(id); // only swap view after details exist (no flicker)
      } catch (e) {
        if (!ignore) setErr(e?.message || "Failed to load exercise details");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => { ignore = true; };
  }, [idx, list, token]); // don't include cache/shownId to avoid loops

  // Navigation: no wrap-around; disable at ends
  const atStart = idx <= 0;
  const atEnd = idx >= Math.max(0, list.length - 1);

  const next = () => {
    if (!atEnd) setIdx((i) => Math.min(i + 1, list.length - 1));
  };
  const prev = () => {
    if (!atStart) setIdx((i) => Math.max(i - 1, 0));
  };

  if (!list.length) {
    return (
      <p className="text-white mt-10">
        {err ? `Error: ${err}` : "Loading exercises…"}
      </p>
    );
  }

  const activeId = shownId != null ? shownId : (list[idx] && list[idx].id);
  const listItem = (list.find((x) => x.id === activeId)) || list[idx] || {};
  const meta = (activeId != null && cache[activeId]) || {};
  const name = (meta && meta.name) || (listItem && listItem.name) || "Exercise";

  // Decide which image to show: by index -> API image -> orange fallback
  const currentImage = imagesByIndex[idx] || (meta && meta.image_url) || orange;

  return (
    <div className="flex bg-transparent text-white">
      <div>
        {/* LEFT SIDE (exercise info) */}
        <div className="flex-1">
          <h2 className="text-4xl font-bold text-white mt-1">Exercises</h2>
          <p className="text-sm max-w-[45ch] leading-tight">
            Discover a library of movements with images, instructions, and variations.
            Quickly find the right exercise for every client and training goal.
          </p>

          {/* Navigation */}
          <div className="flex gap-5 items-center mt-6">
            <button
              type="button"
              onClick={prev}
              className="px-3 py-1 border border-white/30 rounded hover:text-orange-500 disabled:opacity-50"
              disabled={loading || atStart}
              title="Previous exercise"
            >
              ◄
            </button>
            <span className="text-xs text-gray-400">
              {Math.min(idx + 1, list.length)} / {list.length}
            </span>
            <button
              type="button"
              onClick={next}
              className="px-3 py-1 border border-white/30 rounded hover:text-orange-500 disabled:opacity-50"
              disabled={loading || atEnd}
              title="Next exercise"
            >
              ►
            </button>
          </div>

          <div className="flex gap-12 mt-8">
            {/* Left column */}
            <div>
              <p className="text-sm font-bold">Name</p>
              <p className="text-xs">{name}</p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Movement Category</p>
              <p className="text-xs">{meta.movement_category || "—"}</p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Primary Muscles</p>
              <p className="text-xs break-words whitespace-normal max-w-[200px]">
                {names(meta.primary_muscles)}
              </p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Joint Involvement</p>
              <p className="text-xs">{meta.joint_involvement || "—"}</p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Joint Action</p>
              <p className="text-xs break-words whitespace-normal max-w-[200px]">
                {names(meta.joint_actions)}
              </p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />
            </div>

            {/* Middle column */}
            <div>
              <p className="text-sm font-bold">Type of Load</p>
              <p className="text-xs">
                {(meta.load_type && (meta.load_type.name || meta.load_type)) || meta.load_type || "—"}
              </p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Body Part</p>
              <p className="text-xs">{meta.body_part || "—"}</p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Secondary Muscles</p>
              <p className="text-xs break-words whitespace-normal max-w-[200px]">
                {names(meta.secondary_muscles)}
              </p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Movement Pattern</p>
              <p className="text-xs">{meta.movement_pattern || "—"}</p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Resistance Modality</p>
              <p className="text-xs">{meta.resistance_modality || "—"}</p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />
            </div>

            {/* Right column */}
            <div>
              <p className="text-sm font-bold">Type of Training</p>
              <p className="text-xs">{meta.type_training || meta.training_type || "—"}</p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Muscular Group</p>
              <p className="text-xs break-words whitespace-normal max-w-[200px]">
                {names(meta.muscular_groups)}
              </p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Muscle Action</p>
              <p className="text-xs">{meta.muscle_action || "—"}</p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Planes of Motion</p>
              <p className="text-xs">{meta.plane_of_motion || meta.plane_motion || "—"}</p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />

              <p className="text-sm font-bold">Equipment / Accessories</p>
              <p className="text-xs">{names(meta.equipments)}</p>
              <div className="my-6 border-t border-gray-600 w-50 mt-1" />
            </div>
          </div>

          {err && (
            <div className="text-red-300 text-sm mt-3" role="alert">
              {err}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE (image / placeholder) */}
      <div className="-mt-30 ml-40 flex-none w-[580px] flex flex-col items-center">
        <h3 className="text-xl text-white font-semibold mb-4 text-center">
          {(meta.load_type && (meta.load_type.name || meta.load_type)) || meta.load_type || "Exercise"}
        </h3>

        {/* Fix height to avoid layout jumps; show previous until new is ready */}
        <div className="relative w-[580px] h-[360px] flex items-center justify-center mt-30">
          <img
            src={currentImage}
            alt={name}
            className="max-h-[360px] w-auto object-contain"
          />
          {loading && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none"/>
          )}
        </div>

        <div className="flex justify-center space-x-4 text-sm font-medium mt-40">
          <button type="button" className="hover:text-orange-500">How To</button>
          <span>|</span>
          <button type="button" className="hover:text-orange-500">Steps</button>
          <span>|</span>
          <button type="button" className="hover:text-orange-500">Form Cues</button>
          <span>|</span>
          <button type="button" className="hover:text-orange-500">Muscles</button>
          <span>|</span>
          <button type="button" className="hover:text-orange-500">Errors</button>
          <span>|</span>
          <button type="button" className="hover:text-orange-500">Equipment</button>
        </div>
      </div>
    </div>
  );
}

export default ExHub;
