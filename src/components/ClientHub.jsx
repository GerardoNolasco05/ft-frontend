import { useEffect, useMemo, useRef, useState } from "react";
import ClientForm from "./ClientForm";
import WorkoutForm from "./WorkoutForm";

function ClientHub() {
  const [search, setSearch] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);

  // Workout modals
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutEdit, setWorkoutEdit] = useState(null);

  // Delete confirmation
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [workoutToast, setWorkoutToast] = useState("");

  // Clients
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [notFound, setNotFound] = useState("");

  // Sticky selection (only search/click can change this)
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Workouts
  const [workouts, setWorkouts] = useState([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const [wPage, setWPage] = useState(0);
  const wPageSize = 5;

  // LEFT list pagination (does NOT affect selection)
  const [page, setPage] = useState(0);
  const pageSize = 8;

  // Tabs — default NOT workouts (user must click)
  const [activeTab, setActiveTab] = useState("progress");

  const coach = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("coach") || "{}"); }
    catch { return {}; }
  }, []);
  const coachId = coach?.id;

  // Load clients
  const loadClients = async () => {
    if (!coachId) return;
    setLoading(true);
    setErr("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/clients?coach_id=${encodeURIComponent(coachId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data && (data.error || data.message)) || `Failed (${res.status})`);
      const list = Array.isArray(data) ? data : data.clients || [];
      setClients(list);
      setPage(0);
      if (!selectedClientId && list.length) setSelectedClientId(list[0].id);
    } catch (e) {
      setErr(e.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadClients(); }, [coachId]);

  // Modal ESC + body scroll lock (safe even though we fix the layer)
  useEffect(() => {
    const anyOpen = showClientModal || showWorkoutModal || !!clientToDelete || !!workoutEdit;
    if (!anyOpen) return;
    const onKey = (e) => e.key === "Escape" && (setShowClientModal(false), setShowWorkoutModal(false), setClientToDelete(null), setWorkoutEdit(null));
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [showClientModal, showWorkoutModal, clientToDelete, workoutEdit]);

  // Helpers
  const totalPages = Math.max(1, Math.ceil(clients.length / pageSize));
  const start = page * pageSize;
  const pageClients = clients.slice(start, start + pageSize);
  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const getClientDisplayName = (c) =>
    (c?.profile_name && String(c.profile_name).trim()) ||
    [c?.name, c?.last_name].filter(Boolean).join(" ") ||
    "Client";

  const matchesQuery = (c, q) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return false;
    const fields = [c?.name, c?.last_name, c?.email, c?.profile_name]
      .filter(Boolean).map((s) => String(s).toLowerCase());
    const fullName = [c?.name, c?.last_name].filter(Boolean).join(" ").toLowerCase();
    if (fullName && fullName === needle) return true;
    return fields.some((f) => f.includes(needle));
  };

  // Search updates selection AND jumps the left pager to ensure visibility
  const performSearch = (e) => {
    if (e) e.preventDefault();
    setNotFound("");
    const q = search.trim();
    if (!q) return;
    const absIndex = clients.findIndex((c) => matchesQuery(c, q));
    if (absIndex === -1) { setNotFound("No client found for that search."); return; }
    const found = clients[absIndex];
    setSelectedClientId(found.id);
    setPage(Math.floor(absIndex / pageSize));
    setSearch("");
  };

  // Click on left list only changes selection (paging itself does not)
  const handleClientClick = (absoluteIndex) => {
    const c = clients[absoluteIndex];
    if (!c) return;
    setSelectedClientId(c.id);
    setPage(Math.floor(absoluteIndex / pageSize)); // keep it visible on the left
  };

  // ===== Workouts (load only when user is on Workouts tab) =====
  const lastLoadedClientIdRef = useRef(null);

  const loadWorkouts = async (client_id) => {
    if (!client_id) return;
    try {
      setWorkoutsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/workouts?client_id=${encodeURIComponent(client_id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data && (data.error || data.message)) || `Failed (${res.status})`);
      const list = Array.isArray(data) ? data : data.workouts || [];
      setWorkouts(list);
      setWPage(0);
    } catch (e) {
      console.error(e);
      setWorkouts([]);
      setWPage(0);
    } finally {
      setWorkoutsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "workouts") return;          // user must click "Workouts"
    if (!selectedClientId) return;
    if (lastLoadedClientIdRef.current === selectedClientId) return;
    lastLoadedClientIdRef.current = selectedClientId;
    loadWorkouts(selectedClientId);
  }, [activeTab, selectedClientId]);

  const wTotalPages = Math.max(1, Math.ceil(workouts.length / wPageSize));
  const wStart = wPage * wPageSize;
  const pageWorkouts = workouts.slice(wStart, wStart + wPageSize);

  // Toast auto-hide
  useEffect(() => {
    if (!workoutToast) return;
    const t = setTimeout(() => setWorkoutToast(""), 3000);
    return () => clearTimeout(t);
  }, [workoutToast]);

  return (
    <>
      {/* component-scoped CSS to hide inner scrollbars (content still scrolls) */}
      <style>{`
        .no-scrollbar { scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>

      {workoutToast && activeTab === "workouts" && (
        <div className="fixed top-24 left-10 z-[90] rounded-md bg-green-600 text-white px-4 py-2 shadow-lg">
          {workoutToast}
        </div>
      )}

      {/* Viewport-locked layer: isolates from page/body, prevents any width jump */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-transparent text-white">
        {/* Two-column grid: left fluid, right fixed 620px */}
        <div className="grid grid-cols-[minmax(0,1fr)_620px] gap-12 w-full h-full">
          {/* LEFT SIDE (clients list + search) — scrollable area, no visible bars */}
          <div className="min-w-0 h-full overflow-auto no-scrollbar pr-2">
            <h2 className="text-4xl font-bold text-white mt-5">Clients</h2>
            <p className="text-sm max-w-[45ch] leading-tight">
              Manage your clients with ease, create personalized workouts, track their progress,
              and keep all their information in one place.
            </p>

            {/* Search */}
            <form onSubmit={performSearch} className="mt-4 flex items-center max-w-sm border border-gray-500 rounded-sm overflow-hidden">
              <input
                type="text"
                placeholder="Search by name, email, or profile name…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setNotFound(""); }}
                className="flex-1 text-sm px-2 py-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                aria-label="Search client"
              />
              <button type="submit" className="p-2 hover:scale-90 cursor-pointer transition-transform duration-200" title="Search">
                <img src="/images/clients.svg" alt="Search client" className="w-5 h-5" />
              </button>
            </form>

            {notFound && <div className="text-amber-300 text-xs mt-2">{notFound}</div>}
            {err && <div className="text-red-300 text-sm mt-3" role="alert">{err}</div>}
            {loading && <div className="text-sm mt-3">Loading…</div>}

            {clients.length > pageSize && (
              <div className="text-sm mt-10 flex items-center gap-4">
                {/* ONLY affects left list slice */}
                <button onClick={() => setPage((p) => Math.max(p - 1, 0))} className="hover:text-orange-500 cursor-pointer">◄</button>
                <span>Page {page + 1} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))} className="hover:text-orange-500 cursor-pointer">►</button>
              </div>
            )}

            <div className="flex gap-12 mt-10">
              {/* Left column (first half) */}
              <div>
                {pageClients.slice(0, Math.ceil(pageClients.length / 2)).map((c, i) => {
                  const absoluteIndex = start + i;
                  const isSelected = c.id === selectedClientId;
                  return (
                    <div key={c.id} className="mb-6 cursor-pointer" onClick={() => handleClientClick(absoluteIndex)}>
                      <p className={`text-sm font-bold ${isSelected ? "text-white" : ""}`}>{getClientDisplayName(c)}</p>
                      <p className="text-sm">{c.email}</p>
                      <div className="my-6 border-t border-gray-600 w-50 mt-1" />
                    </div>
                  );
                })}
              </div>

              {/* Middle column (second half) */}
              <div>
                {pageClients.slice(Math.ceil(pageClients.length / 2)).map((c, j) => {
                  const i = j + Math.ceil(pageClients.length / 2);
                  const absoluteIndex = start + i;
                  const isSelected = c.id === selectedClientId;
                  return (
                    <div key={c.id} className="mb-6 cursor-pointer" onClick={() => handleClientClick(absoluteIndex)}>
                      <p className={`text-sm font-bold ${isSelected ? "text-white" : ""}`}>{getClientDisplayName(c)}</p>
                      <p className="text-sm">{c.email}</p>
                      <div className="my-6 border-t border-gray-600 w-50 mt-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (details + tabs) — fixed 620px, scrollable inside, no visible bars */}
          <div className="-mt-6 w-[620px] h-full overflow-auto no-scrollbar">
            <div className="flex items-start gap-3 p-6 border-b border-gray-600 ">
              <img src="/images/portrait.png" alt="Client portrait" className="w-19 h-19 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-bold text-white text-lg">
                  {selectedClient
                    ? `${selectedClient.name || ""} ${selectedClient.last_name || ""}`.trim() || (selectedClient.profile_name || "Client")
                    : "Client"}
                </p>
                <p className="text-sm text-white">
                  Phone: {selectedClient?.phone || "—"} <span className="mx-2">|</span>
                  Email: {selectedClient?.email || "—"} <span className="mx-2">|</span>
                  City: {selectedClient?.city || "—"}
                </p>

                <div className="mt-2 flex gap-3 text-xs">
                  <button onClick={() => setShowClientModal(true)} className="hover:text-orange-500 cursor-pointer">Update</button>
                  <span className="text-white">|</span>
                  <button className="text-red-400 cursor-pointer hover:text-red-300" onClick={() => setClientToDelete(selectedClient)}>Delete</button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center space-x-4 text-sm font-medium mt-4 ml-4">
              <button className={`hover:text-orange-500 ${activeTab === 'workouts' ? 'text-white' : ''}`} onClick={() => setActiveTab('workouts')}>Workouts</button>
              <span>|</span>
              <button className={`hover:text-orange-500 ${activeTab === 'progress' ? 'text-white' : ''}`} onClick={() => setActiveTab('progress')}>Progress</button>
              <span>|</span>
              <button className={`hover:text-orange-500 ${activeTab === 'nutrition' ? 'text-white' : ''}`} onClick={() => setActiveTab('nutrition')}>Nutrition</button>
              <span>|</span>
              <button className={`hover:text-orange-500 ${activeTab === 'readiness' ? 'text-white' : ''}`} onClick={() => setActiveTab('readiness')}>Health &amp; Readiness</button>
              <span>|</span>
              <button className={`hover:text-orange-500 ${activeTab === 'notes' ? 'text-white' : ''}`} onClick={() => setActiveTab('notes')}>Notes</button>
              <span>|</span>
              <button className={`hover:text-orange-500 ${activeTab === 'goals' ? 'text-white' : ''}`} onClick={() => setActiveTab('goals')}>Goals</button>
            </div>

            {/* Workouts tab content (loads only when clicked) */}
            {activeTab === 'workouts' && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => { setWorkoutEdit(null); setShowWorkoutModal(true); }}
                  className="group flex items-center cursor-pointer select-none"
                  aria-haspopup="dialog"
                  aria-expanded={showWorkoutModal}
                  aria-controls="create-workout-dialog"
                  disabled={!selectedClient}
                >
                  <img src="/images/workout.png" alt="Workout" className="w-8 h-8 transform transition-transform duration-200 group-hover:scale-95" />
                  <span className="text-sm ml-3 transition-colors group-hover:text-orange-500">Create Workout</span>
                </button>

                <div className="mt-4 space-y-3">
                  {workoutsLoading && <div className="text-sm text-gray-300">Loading workouts…</div>}

                  {!workoutsLoading && pageWorkouts.length === 0 && (
                    <div className="text-sm text-gray-300">No workouts yet.</div>
                  )}

                  {!workoutsLoading && pageWorkouts.map((w) => (
                    <div key={w.id} className="rounded-lg border border-white/15 p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">
                            {w.exercise_name || `Exercise #${w.exercise_id}`} &middot; {w.units?.toUpperCase() || 'kg'}
                          </p>
                          <p className="text-xs text-gray-200 mt-1">
                            1RM: {w.rm ?? '—'} ({w.rm_percentage ?? '—'}%) · Reps: {w.reps ?? '—'} · Sets: {w.sets ?? '—'}
                            <br />
                            Tempo: {w.cc_tempo ?? '—'}/{w.iso_tempo_one ?? '—'}/{w.ecc_tempo ?? '—'}/{w.iso_tempo_two ?? '—'}
                            {' · '}TUT: {w.tut ?? '—'}s · Density: {w.density ?? '—'}
                          </p>
                        </div>
                        <div className="text-xs flex gap-3">
                          <button className="hover:text-white" onClick={() => { setWorkoutEdit(w); setShowWorkoutModal(true); }}>Update</button>
                          <button className="text-red-400 hover:text-red-300" onClick={() => setWorkoutEdit({ ...w, __deleteConfirm: true })}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {workouts.length > wPageSize && (
                    <div className="text-sm mt-2 flex items-center gap-4 justify-center">
                      <button onClick={() => setWPage((p) => Math.max(p - 1, 0))} className="hover:text-orange-500">◄</button>
                      <span>Page {wPage + 1} / {Math.max(1, Math.ceil(workouts.length / wPageSize))}</span>
                      <button onClick={() => setWPage((p) => Math.min(p + 1, Math.max(1, Math.ceil(workouts.length / wPageSize)) - 1))} className="hover:text-orange-500">►</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Client Modal ===== */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowClientModal(false)} />
          <div className="relative z-[61] w-full max-w-3xl">
            <ClientForm
              mode="edit"
              initialData={selectedClient}
              coachId={coachId}
              onClose={() => setShowClientModal(false)}
              onSaved={() => { setShowClientModal(false); loadClients(); }}
            />
          </div>
        </div>
      )}

      {/* ===== Workout Modal ===== */}
      {(showWorkoutModal || workoutEdit) && selectedClient && (
        <div id="create-workout-dialog" className="fixed inset-0 z-[70] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Create workout">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowWorkoutModal(false); setWorkoutEdit(null); }} />
          <div className="relative z-[71] w-full max-w-[1400px]">
            <div className="relative rounded-xl border border-white/20 bg-stone-900 shadow-2xl p-7 max-h-[90vh] overflow-auto no-scrollbar">
              <button className="absolute top-3 right-9 w-7 hover:text-orange-500/70 cursor-pointer" aria-label="Close" onClick={() => { setShowWorkoutModal(false); setWorkoutEdit(null); }}>
                ✕
              </button>

              <WorkoutForm
                mode={workoutEdit && !workoutEdit.__deleteConfirm ? 'edit' : 'create'}
                initialData={workoutEdit && !workoutEdit.__deleteConfirm ? workoutEdit : null}
                clientId={selectedClient.id}
                coachId={coachId}
                onSaved={async () => {
                  setWorkoutToast(workoutEdit ? "Workout successfully updated" : "Successfully workout created");
                  await loadClients();
                  if (activeTab === "workouts") {
                    await loadWorkouts(selectedClient.id);
                  }
                  setTimeout(() => { setShowWorkoutModal(false); setWorkoutEdit(null); }, 2000);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Workout Confirmation ===== */}
      {workoutEdit?.__deleteConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setWorkoutEdit(null)} />
          <div className="relative z-[81] w-full max-w-sm rounded-xl bg-stone-900 border border-white/20 shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-5">Are you sure you want to delete this workout?</h3>
            <div className="flex justify-end gap-3">
              <button onClick={() => setWorkoutEdit(null)} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">No</button>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`/workouts/${workoutEdit.id}`, {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) console.error("Failed to delete workout", await res.text());
                    if (activeTab === "workouts" && selectedClientId) await loadWorkouts(selectedClientId);
                    setWorkoutToast("Workout deleted");
                  } catch (err) {
                    console.error("Error deleting workout", err);
                  } finally {
                    setWorkoutEdit(null);
                  }
                }}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-500"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Client Confirmation ===== */}
      {clientToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setClientToDelete(null)} />
          <div className="relative z-[81] w-full max-w-sm rounded-xl bg-stone-900 border border-white/20 shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-5">
              Are you sure you want to delete {`${clientToDelete?.name || ""} ${clientToDelete?.last_name || ""}`.trim() || "this client"}?
            </h3>
            <div className="flex justify-end gap-3">
              <button onClick={() => setClientToDelete(null)} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">No</button>
              <button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`/clients/${clientToDelete.id}`, {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) console.error("Failed to delete client", await res.text());
                    await loadClients();
                    const stillExists = clients.find(c => c.id === selectedClientId);
                    if (!stillExists && clients[0]) setSelectedClientId(clients[0].id);
                    setClientToDelete(null);
                  } catch (err) {
                    console.error("Error deleting client", err);
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-500 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ClientHub;
