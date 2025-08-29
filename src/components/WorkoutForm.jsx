import React, { useEffect, useMemo, useState } from 'react';

/**
 * WorkoutForm
 * - mode: "create" | "edit"
 * - clientId: number (required)
 * - coachId: number (optional for backend)
 * - initialData: workout object (for edit)
 * - onSaved(workout): callback after successful POST/PUT
 * - onClose(): close modal
 */
export default function WorkoutForm({
  mode = 'create',
  clientId,
  coachId,
  initialData = null,
  onSaved,
  onClose,
  className = '',
}) {
  const isEdit = mode === 'edit';

  // --------- Remote data (exercises + weights) ---------
  const [exercises, setExercises] = useState([]);        // [{id, name}, ...]
  const [exerciseId, setExerciseId] = useState('');      // selected exercise id
  const [exLoading, setExLoading] = useState(false);
  const [exError, setExError] = useState('');

  // Available implementable loads for this exercise+unit (e.g., 2.5kg steps, dumbbells, etc.)
  const [availLoads, setAvailLoads] = useState([]);      // [{value, unit, ...}] absolute weights
  const [loadsLoading, setLoadsLoading] = useState(false);
  const [loadsError, setLoadsError] = useState('');

  // --------- Top block (your workout inputs) ---------
  const emptyTop = {
    units: 'kg',
    rm: '',
    rm_percentage: '',
    max_repetitions: '',
    rir_repetitions: '',
    cc_tempo: '',
    iso1: '',
    ecc: '',
    iso2: '',
  };
  const [top, setTop] = useState(emptyTop);

  // Precomputed/filtered % options you can actually load
  // Each item: { pct: number, load: number }
  const [achievablePercents, setAchievablePercents] = useState([]);

  // --------- Bottom block (set/rep meta) ---------
  const emptyBottom = {
    reps: '',
    sets: '',
    exercise_time: '',
    rom: '',
    weight: '',        // working load auto-set when %1RM chosen
    repetitions: '',
    total_tempo: '',
    tut: '',
    total_rest: '',
    density: '',
  };
  const [bottom, setBottom] = useState(emptyBottom);

  // --------- Submit status ---------
  const [submitStatus, setSubmitStatus] = useState({ status: 'idle', message: '' }); // 'idle' | 'saving' | 'success' | 'error'

  // Auto-hide inline success after 2s (parent will close the modal)
  useEffect(() => {
    if (submitStatus.status !== 'success') return;
    const t = setTimeout(() => setSubmitStatus({ status: 'idle', message: '' }), 2000);
    return () => clearTimeout(t);
  }, [submitStatus.status]);

  // ======== Helpers ========
  const uniqueSortedLoads = (rows) => {
    const map = new Map();
    rows.forEach((r) => {
      const v = Number(r.value);
      if (!Number.isFinite(v)) return;
      if (!map.has(v)) map.set(v, { ...r, value: v });
    });
    return Array.from(map.values()).sort((a, b) => a.value - b.value);
  };

  // ======== Prefill in edit mode ========
  useEffect(() => {
    if (!isEdit || !initialData) return;
    setExerciseId(String(initialData.exercise_id ?? ''));
    setTop({
      units: initialData.units ?? 'kg',
      rm: initialData.rm ?? '',
      rm_percentage: initialData.rm_percentage ?? '',
      max_repetitions: initialData.max_repetitions ?? '',
      rir_repetitions: initialData.rir_repetitions ?? '',
      cc_tempo: initialData.cc_tempo ?? '',
      iso1: initialData.iso_tempo_one ?? '',
      ecc: initialData.ecc_tempo ?? '',
      iso2: initialData.iso_tempo_two ?? '',
    });
    setBottom({
      reps: initialData.reps ?? '',
      sets: initialData.sets ?? '',
      exercise_time: initialData.exercise_time ?? '',
      rom: initialData.rom ?? '',
      weight: initialData.weight ?? '',
      repetitions: initialData.repetitions ?? '',
      total_tempo: initialData.total_tempo ?? '',
      tut: initialData.tut ?? '',
      total_rest: initialData.total_rest ?? '',
      density: initialData.density ?? '',
    });
  }, [isEdit, initialData]);

  // ======== Load exercises on mount ========
  useEffect(() => {
    const token = localStorage.getItem('token');
    const ctrl = new AbortController();
    setExLoading(true);
    setExError('');
    fetch('/exercises/', { headers: { Authorization: `Bearer ${token}` }, signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load exercises (${res.status})`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.exercises || [];
        setExercises(list);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setExError(err.message || 'Failed to load exercises');
      })
      .finally(() => setExLoading(false));
    return () => ctrl.abort();
  }, []);

  // ======== Load available loads when exercise or units change ========
  useEffect(() => {
    if (!exerciseId) return;
    const token = localStorage.getItem('token');
    const unit = top.units.toLowerCase();
    const ctrl = new AbortController();

    setLoadsLoading(true);
    setLoadsError('');
    setAvailLoads([]);
    setAchievablePercents([]);

    fetch(`/exercises/${exerciseId}/weights?unit=${encodeURIComponent(unit)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load weights (${res.status})`);
        const data = await res.json();
        const rows = Array.isArray(data) ? data : [];
        const unique = uniqueSortedLoads(rows);
        setAvailLoads(unique);

        // Clear RM/Percent if now incompatible
        setTop((t) => ({ ...t, rm: '', rm_percentage: '' }));
        setBottom((b) => ({ ...b, weight: '' }));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setLoadsError(err.message);
        }
      })
      .finally(() => setLoadsLoading(false));

    return () => ctrl.abort();
  }, [exerciseId, top.units]);

  // ======== Recompute achievable %1RM options whenever RM or loads change ========
  useEffect(() => {
    const rmVal = Number(top.rm);
    if (!Number.isFinite(rmVal) || rmVal <= 0 || availLoads.length === 0) {
      setAchievablePercents([]);
      setTop((t) => ({ ...t, rm_percentage: '' }));
      return;
    }
    // Only consider loads you can actually lift (<= RM)
    const candidates = availLoads
      .map((w) => w.value)
      .filter((w) => w > 0 && w <= rmVal);

    const seen = new Set();
    const options = [];
    for (const load of candidates) {
      const pct = Math.round((load / rmVal) * 100);
      const key = `${pct}`;
      if (!seen.has(key)) {
        seen.add(key);
        options.push({ pct, load });
      }
    }
    options.sort((a, b) => a.pct - b.pct);
    setAchievablePercents(options);

    const ok = options.some((o) => String(o.pct) === String(top.rm_percentage));
    if (!ok) {
      setTop((t) => ({ ...t, rm_percentage: '' }));
      setBottom((b) => ({ ...b, weight: '' }));
    }
  }, [top.rm, availLoads]);

  // ======== Derived calculations (client-side preview) ========
  useEffect(() => {
    const toNum = (v) => {
      const n = parseFloat(String(v).replace(',', '.'));
      return Number.isFinite(n) ? n : 0;
    };
    const total_tempo =
      toNum(top.cc_tempo) + toNum(top.iso1) + toNum(top.ecc) + toNum(top.iso2);
    const tut = total_tempo * toNum(bottom.reps) * toNum(bottom.sets);
    const total_rest = toNum(bottom.sets) > 1 ? (toNum(bottom.sets) - 1) * 60 : 0; // preview only
    const duration = tut + total_rest;
    const density = duration > 0 ? (toNum(bottom.weight) * toNum(bottom.reps) * toNum(bottom.sets)) / duration : 0;

    setBottom((b) => ({
      ...b,
      total_tempo: total_tempo || '',
      tut: tut || '',
      total_rest: total_rest || '',
      density: density ? density.toFixed(2) : '',
    }));
  }, [top.cc_tempo, top.iso1, top.ecc, top.iso2, bottom.reps, bottom.sets, bottom.weight]);

  // ======== Submit to backend (/workouts/ POST or PUT) ========
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const toNum = (v) => {
      const n = parseFloat(String(v).replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    };

    try {
      setSubmitStatus({ status: 'saving', message: '' });

      const payload = {
        client_id: clientId,
        coach_id: coachId,
        exercise_id: exerciseId ? Number(exerciseId) : null,
        units: top.units,
        rm: toNum(top.rm),
        rm_percentage: toNum(top.rm_percentage),
        max_repetitions: toNum(top.max_repetitions),
        rir_repetitions: toNum(top.rir_repetitions),
        cc_tempo: toNum(top.cc_tempo),
        iso_tempo_one: toNum(top.iso1),
        ecc_tempo: toNum(top.ecc),
        iso_tempo_two: toNum(top.iso2),
        reps: toNum(bottom.reps),
        sets: toNum(bottom.sets),
        exercise_time: toNum(bottom.exercise_time),
        rom: toNum(bottom.rom),
        weight: toNum(bottom.weight),
        repetitions: toNum(bottom.repetitions),
      };

      let res;
      if (isEdit && initialData?.id) {
        res = await fetch(`/workouts/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/workouts/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to save workout');
      }

      const saved = await res.json().catch(() => null);
      setSubmitStatus({
        status: 'success',
        message: isEdit ? 'Workout successfully updated!!' : 'Workout successfully created!!',
      });

      if (typeof onSaved === 'function') onSaved(saved?.workout || saved || payload);

      if (!isEdit) {
        setExerciseId('');
        setTop(emptyTop);
        setBottom(emptyBottom);
        setAchievablePercents([]);
      }
    } catch (err) {
      setSubmitStatus({ status: 'error', message: err.message || 'Failed to save workout' });
    }
  };

  // ======== STYLES ========
  const baseInput =
    'w-full h-8 sm:h-9 bg-transparent text-center px-2 py-1 border border-white/15 rounded ' +
    'focus:outline-none focus:border-white/40 placeholder-white/30';

  return (
    <div className={`w-full border border-white/40 rounded-2xl p-4 sm:p-5 bg-stone-600/50 text-white text-xs sm:text-[12px] ${className}`}>
      {/* Title row with inline success beside it */}
      <div className="mb-3 flex items-center gap-3">
        <h4 className="text-sm sm:text-base font-semibold">
          {isEdit ? 'Update Workout' : 'Workout'}
        </h4>

        {submitStatus.status === 'success' && (
          <span
            className="text-green-300 text-[11px] sm:text-xs"
            role="status"
            aria-live="polite"
          >
            {submitStatus.message}
          </span>
        )}
      </div>

      {/* Error (keep separate so it remains obvious) */}
      {submitStatus.status === 'error' && (
        <div className="mb-2 text-red-300 text-xs" role="alert">{submitStatus.message}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 overflow-x-hidden">
        {/* ===== TOP BLOCK ===== */}
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-orange-500/70 text-neutral-200">
              <tr className="text-center">
                <th className="border border-white/10 px-2 py-2 whitespace-normal leading-tight" rowSpan={2}>
                  Exercise Name
                </th>
                <th className="border border-white/10 px-5 py-2" rowSpan={2}>Units</th>
                <th className="border border-white/10 px-15 py-2" rowSpan={2}>1RM</th>
                <th className="border border-white/10 px-2 py-2" rowSpan={2}>%1RM</th>
                <th className="border border-white/10 px-2 py-2" colSpan={2}>Repetitions</th>
                <th className="border border-white/10 px-2 py-2" colSpan={4}>Tempo (seconds)</th>
              </tr>
              <tr className="text-center">
                <th className="border border-white/10 px-2 py-2">Max</th>
                <th className="border border-white/10 px-2 py-2">RIR</th>
                <th className="border border-white/10 px-2 py-2">CC</th>
                <th className="border border-white/10 px-2 py-2">ISO 1</th>
                <th className="border border-white/10 px-2 py-2">ECC</th>
                <th className="border border-white/10 px-2 py-2">ISO 2</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center align-top">
                {/* Exercise dropdown */}
                <td className="border border-white/10 px-2 py-2 min-w-[180px]">
                  <select
                    value={exerciseId}
                    onChange={(e) => {
                      setExerciseId(e.target.value);
                    }}
                    disabled={exLoading}
                    className={`${baseInput} text-left`}
                  >
                    <option value="">
                      {isEdit && initialData?.exercise_name
                        ? `${initialData.exercise_name} (loaded)`
                        : exLoading
                        ? 'Loading…'
                        : exError
                        ? `Error: ${exError}`
                        : 'Select an exercise…'}
                    </option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </td>

                {/* Units */}
                <td className="border border-white/10 px-1 py-2">
                  <select
                    value={top.units}
                    onChange={(e) => {
                      setTop((t) => ({ ...t, units: e.target.value, rm: '', rm_percentage: '' }));
                      setBottom((b) => ({ ...b, weight: '' }));
                    }}
                    className={baseInput}
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </td>

                {/* 1RM (choose from available loads) */}
                <td className="border border-white/10 px-1 py-2">
                  <select
                    value={String(top.rm)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTop((t) => ({ ...t, rm: value, rm_percentage: '' }));
                      setBottom((b) => ({ ...b, weight: '' }));
                    }}
                    disabled={!exerciseId || loadsLoading}
                    className={baseInput}
                  >
                    <option value="">
                      {!exerciseId ? 'Pick exercise first'
                        : loadsLoading ? 'Loading…'
                        : loadsError ? `Error: ${loadsError}`
                        : 'Select 1RM…'}
                    </option>
                    {availLoads.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.value}
                      </option>
                    ))}
                  </select>
                </td>

                {/* %1RM (only achievable percentages; scrollable) */}
                <td className="border border-white/10 px-1 py-2">
                  <select
                    value={String(top.rm_percentage)}
                    onChange={(e) => {
                      const pct = Number(e.target.value);
                      const opt = achievablePercents.find((o) => o.pct === pct);
                      setTop((t) => ({ ...t, rm_percentage: pct }));
                      setBottom((b) => ({ ...b, weight: opt ? opt.load : '' }));
                    }}
                    disabled={!top.rm || achievablePercents.length === 0}
                    className={`${baseInput} text-left max-h-36 overflow-y-auto`}
                  >
                    <option value="">
                      {!top.rm
                        ? 'Pick 1RM first'
                        : achievablePercents.length === 0
                        ? 'No valid % for this 1RM'
                        : 'Select %1RM…'}
                    </option>
                    {achievablePercents.map((o) => (
                      <option key={o.pct} value={o.pct}>
                        {o.pct}% → {o.load} {top.units}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Max / RIR */}
                {['max_repetitions', 'rir_repetitions'].map((name) => (
                  <td key={name} className="border border-white/10 px-1 py-2">
                    <input
                      type="number"
                      min="0"
                      name={name}
                      value={top[name]}
                      onChange={(e) => {
                        const value = e.target.value;
                        setTop((t) => ({ ...t, [name]: value }));
                      }}
                      className={baseInput}
                    />
                  </td>
                ))}

                {/* CC / ISO1 / ECC / ISO2 */}
                {['cc_tempo','iso1','ecc','iso2'].map((name) => (
                  <td key={name} className="border border-white/10 px-1 py-2">
                    <input
                      type="number"
                      min="0"
                      name={name}
                      value={top[name]}
                      onChange={(e) => setTop((t) => ({ ...t, [name]: e.target.value }))}
                      className={baseInput}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== BOTTOM BLOCK ===== */}
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-orange-500/70 text-neutral-200">
              <tr className="text-center">
                <th className="border border-white/10 px-2 py-2">Reps</th>
                <th className="border border-white/10 px-2 py-2">Sets</th>
                <th className="border border-white/10 px-2 py-2">Exercise time</th>
                <th className="border border-white/10 px-2 py-2">ROM</th>
                <th className="border border-white/10 px-2 py-2">Weight</th>
                <th className="border border-white/10 px-2 py-2">W Reps</th>
                <th className="border border-white/10 px-2 py-2">T. Tempo</th>
                <th className="border border-white/10 px-2 py-2">TUT</th>
                <th className="border border-white/10 px-2 py-2">Rest</th>
                <th className="border border-white/10 px-2 py-2">Density</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center">
                {['reps','sets','exercise_time','rom','weight','repetitions','total_tempo','tut','total_rest','density'].map((name) => (
                  <td key={name} className="border border-white/10 px-1 py-2">
                    <input
                      type="number"
                      min="0"
                      name={name}
                      value={bottom[name]}
                      onChange={(e) => setBottom((b) => ({ ...b, [name]: e.target.value }))}
                      className={`${baseInput} ${['total_tempo','tut','density'].includes(name) ? 'bg-white/5' : ''}`}
                      readOnly={['total_tempo','tut','density'].includes(name)}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom right: Client ID (read-only) + Submit */}
        <div className="flex items-center justify-between">
          <div />
          <div className="flex items-end gap-4">
            <div className="text-right">
              <label className="block text-[11px] text-gray-200 mb-1">Client ID</label>
              <input
                type="text"
                value={clientId ?? ''}
                readOnly
                className="w-32 h-9 text-sm rounded-sm bg-gray-700/60 text-gray-200 px-3 py-2 cursor-not-allowed text-right"
              />
            </div>

            <button
              type="submit"
              disabled={submitStatus.status === 'saving'}
              className="mt-3 border border-white bg-orange-500/70 hover:opacity-90 px-4 py-2 rounded text-[12px] disabled:opacity-60 cursor-pointer"
            >
              {submitStatus.status === 'saving'
                ? 'Saving…'
                : isEdit
                ? 'Update Workout'
                : 'Submit Workout'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
