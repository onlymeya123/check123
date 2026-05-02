import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, Check, GripVertical, Plus, RefreshCw, Sparkles, Trash2, X,
  Clock, Star, DollarSign, Pencil, Search,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import type { Place } from '../data/places';
import { PLACES } from '../data/places';
import { formatRp } from '../lib/format';
import { useToast } from '../components/Toast';

const STEPS = [
  'Finding nearby places…',
  'Matching spots to your vibe…',
  'Optimizing route…',
  'Crafting your perfect journey…',
];

// Hours available for scheduling
const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const h = Math.floor((6 * 60 + i * 30) / 60) % 24;
  const m = (6 * 60 + i * 30) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

type Mode = 'ai' | 'manual';

export default function GeneratePage() {
  const nav = useNavigate();
  const { vibe, budget, buildItinerary, setItinerary, itinerary, removeStop, replaceStop, addStop, reorderStop, alternatives } = useApp();
  const { show } = useToast();

  const [phase, setPhase] = useState<'loading' | 'reveal'>('loading');
  const [stepIdx, setStepIdx] = useState(0);
  const [replaceFor, setReplaceFor] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmingPulse, setConfirmingPulse] = useState(false);
  const [mode, setMode] = useState<Mode>('ai');
  const [stopTimes, setStopTimes] = useState<Record<string, string>>({});
  const [editingTimeFor, setEditingTimeFor] = useState<string | null>(null);

  // Manual itinerary state
  const [manualStops, setManualStops] = useState<Place[]>([]);
  const [manualSearch, setManualSearch] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  useEffect(() => {
    setItinerary(buildItinerary());
  }, []); // eslint-disable-line

  useEffect(() => {
    if (phase !== 'loading') return;
    const t1 = setInterval(() => setStepIdx((s) => (s + 1) % STEPS.length), 700);
    const t2 = setTimeout(() => setPhase('reveal'), 2200);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, [phase]);

  const activeItinerary = mode === 'ai' ? itinerary : manualStops;

  const totals = useMemo(() => {
    const cost = activeItinerary.reduce((s, p) => s + p.cost, 0);
    const time = activeItinerary.reduce((s, p) => s + p.durationMin, 0);
    const dist = activeItinerary.reduce((s, p) => s + p.distanceKm, 0);
    return { cost, time, dist };
  }, [activeItinerary]);

  const onConfirm = () => {
    if (mode === 'manual') {
      setItinerary(manualStops);
    }
    setConfirmingPulse(true);
    show('Journey confirmed ✨', 'success');
    setTimeout(() => nav('/map'), 700);
  };

  const setTime = (id: string, t: string) => {
    setStopTimes((prev) => ({ ...prev, [id]: t }));
    setEditingTimeFor(null);
  };

  const getTime = (id: string, idx: number) => {
    if (stopTimes[id]) return stopTimes[id];
    const start = 10 * 60 + 30 + idx * 90;
    const h = Math.floor(start / 60) % 24;
    const m = start % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const manualSearchResults = useMemo(() => {
    if (!manualSearch.trim()) return PLACES.slice(0, 6);
    const q = manualSearch.toLowerCase();
    return PLACES.filter((p) =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [manualSearch]);

  const importAiSuggestions = () => {
    setManualStops((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      const toAdd = itinerary.filter((p) => !existing.has(p.id));
      return [...prev, ...toAdd];
    });
    show('AI suggestions imported', 'success');
  };

  return (
    <div className="absolute inset-0 bg-white overflow-hidden flex flex-col">
      <StatusBar />
      <div className="px-5 py-2 flex items-center justify-between shrink-0">
        <button onClick={() => nav(-1)} className="w-10 h-10 -ml-2 flex items-center justify-center text-ink-700 press" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="font-bold text-ink-900 font-display">Your Journey</div>
        <div className="text-xs text-brand-600 font-semibold capitalize bg-brand-50 px-2 py-1 rounded-full">{vibe} · {formatRp(budget)}</div>
      </div>

      {/* Mode tabs */}
      <div className="px-5 pb-2 shrink-0">
        <div className="flex gap-1 bg-ink-50 p-1 rounded-2xl">
          {(['ai', 'manual'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 h-9 rounded-xl text-sm font-semibold press transition-colors ${mode === m ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500'}`}
            >
              {m === 'ai' ? '✨ AI Generated' : '📝 Build Manually'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'ai' ? (
          <motion.div key="ai-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {phase === 'loading' ? (
                <LoadingState key="loading" stepIdx={stepIdx} />
              ) : (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {/* Summary */}
                  <div className="mx-5 mt-2 p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow shrink-0">
                    <div className="flex items-center gap-2 text-sm font-semibold opacity-90"><Sparkles className="w-4 h-4" /> Crafted for your {vibe} day</div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <SummStat label="Stops" value={String(itinerary.length)} />
                      <SummStat label="Distance" value={`${totals.dist.toFixed(1)} km`} />
                      <SummStat label="Est. Time" value={`${Math.round(totals.time / 60)}h ${totals.time % 60}m`} />
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                      <span className="text-xs opacity-80">Total Budget</span>
                      <span className="font-bold">{formatRp(totals.cost)}</span>
                    </div>
                  </div>

                  {/* Stops */}
                  <div className="flex-1 overflow-y-auto no-scrollbar mt-4 px-5 pb-32">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold tracking-widest text-ink-500">ITINERARY · {itinerary.length} STOPS</span>
                      <button className="text-xs text-brand-600 font-semibold press" onClick={() => setShowAdd(true)}>+ Add stop</button>
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {itinerary.map((p, i) => (
                          <StopCard
                            key={p.id}
                            index={i}
                            total={itinerary.length}
                            place={p}
                            scheduledTime={getTime(p.id, i)}
                            onTimeEdit={() => setEditingTimeFor(p.id)}
                            onRemove={() => removeStop(p.id)}
                            onReplace={() => setReplaceFor(p.id)}
                            onMoveUp={() => reorderStop(i, Math.max(0, i - 1))}
                            onMoveDown={() => reorderStop(i, Math.min(itinerary.length - 1, i + 1))}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={() => { setItinerary(buildItinerary()); show('Re-rolled itinerary', 'info'); }}
                      className="mt-4 mx-auto flex items-center gap-2 text-xs font-semibold text-ink-600 px-4 py-2 rounded-full bg-ink-50 press"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-roll suggestions
                    </button>
                  </div>

                  {/* Sticky CTA */}
                  <div className="absolute inset-x-0 bottom-0 px-5 pt-3 pb-6 bg-gradient-to-t from-white via-white to-transparent">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      animate={confirmingPulse ? { boxShadow: ['0 0 0 0 rgba(59,91,255,0.5)', '0 0 0 24px rgba(59,91,255,0)'] } : {}}
                      transition={{ duration: 0.7 }}
                      onClick={onConfirm}
                      disabled={itinerary.length === 0}
                      className="w-full h-14 rounded-2xl bg-brand-500 disabled:bg-ink-300 text-white font-bold text-base shadow-glow flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" /> Confirm My Journey
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ── MANUAL MODE ── */
          <motion.div key="manual-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
            {/* Manual summary bar */}
            {manualStops.length > 0 && (
              <div className="mx-5 mb-2 p-3 rounded-2xl bg-ink-50 flex items-center justify-between shrink-0">
                <div className="text-sm font-semibold text-ink-700">{manualStops.length} stops · {formatRp(totals.cost)}</div>
                <button onClick={importAiSuggestions} className="text-xs text-brand-600 font-semibold press flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Mix AI
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32">
              {/* Search to add */}
              <div className="bg-ink-50 rounded-2xl px-3 py-2.5 flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-ink-400 shrink-0" />
                <input
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                  placeholder="Search and add a place…"
                  className="flex-1 bg-transparent text-sm text-ink-800 placeholder:text-ink-400 outline-none"
                />
              </div>

              {/* Search results to pick from */}
              <div className="space-y-2 mb-4">
                {manualSearchResults.map((p) => {
                  const inPlan = manualStops.some((s) => s.id === p.id);
                  return (
                    <button
                      key={p.id}
                      disabled={inPlan}
                      onClick={() => { setManualStops((prev) => [...prev, p]); show(`${p.name} added`, 'success'); }}
                      className={`w-full flex items-center gap-3 rounded-2xl border p-2.5 text-left press transition-colors ${inPlan ? 'border-brand-200 bg-brand-50 opacity-60' : 'border-ink-100 bg-white hover:border-brand-200'}`}
                    >
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink-900 truncate text-sm">{p.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-ink-500 mt-0.5">
                          <span>{p.category}</span>
                          <span>·</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{p.rating}</span>
                          <span>·</span>
                          <Clock className="w-3 h-3" />
                          <span>{p.openingHours}</span>
                        </div>
                        <div className="text-xs text-brand-600 font-semibold mt-0.5">
                          {formatRp(p.priceRange.min)}{p.priceRange.max !== p.priceRange.min ? ` – ${formatRp(p.priceRange.max)}` : ''}
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${inPlan ? 'bg-brand-500' : 'bg-ink-50'}`}>
                        {inPlan ? <Check className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-ink-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom place form toggle */}
              <button
                onClick={() => setShowCustomForm((v) => !v)}
                className="w-full h-10 rounded-2xl border-2 border-dashed border-ink-200 text-ink-500 text-sm font-semibold flex items-center justify-center gap-2 press mb-4"
              >
                <Plus className="w-4 h-4" /> Add custom place
              </button>

              <AnimatePresence>
                {showCustomForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                    <CustomPlaceForm
                      onAdd={(p) => {
                        setManualStops((prev) => [...prev, p]);
                        setShowCustomForm(false);
                        show(`${p.name} added`, 'success');
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Current plan */}
              {manualStops.length > 0 && (
                <>
                  <div className="text-[11px] font-bold tracking-widest text-ink-500 mb-2">YOUR PLAN · {manualStops.length} STOPS</div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {manualStops.map((p, i) => (
                        <StopCard
                          key={p.id}
                          index={i}
                          total={manualStops.length}
                          place={p}
                          scheduledTime={getTime(p.id, i)}
                          onTimeEdit={() => setEditingTimeFor(p.id)}
                          onRemove={() => setManualStops((prev) => prev.filter((s) => s.id !== p.id))}
                          onReplace={() => {}}
                          onMoveUp={() => {
                            setManualStops((prev) => {
                              const next = prev.slice();
                              const [item] = next.splice(i, 1);
                              next.splice(Math.max(0, i - 1), 0, item);
                              return next;
                            });
                          }}
                          onMoveDown={() => {
                            setManualStops((prev) => {
                              const next = prev.slice();
                              const [item] = next.splice(i, 1);
                              next.splice(Math.min(prev.length - 1, i + 1), 0, item);
                              return next;
                            });
                          }}
                          isManual
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {manualStops.length === 0 && (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">📝</div>
                  <div className="font-semibold text-ink-700">No stops yet</div>
                  <div className="text-sm text-ink-500 mt-1">Search above or add a custom place to build your plan</div>
                  <button onClick={importAiSuggestions} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-600 text-sm font-semibold press">
                    <Sparkles className="w-4 h-4" /> Import AI suggestions
                  </button>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="absolute inset-x-0 bottom-0 px-5 pt-3 pb-6 bg-gradient-to-t from-white via-white to-transparent">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                disabled={manualStops.length === 0}
                className="w-full h-14 rounded-2xl bg-brand-500 disabled:bg-ink-300 text-white font-bold text-base shadow-glow flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" /> Confirm My Journey ({manualStops.length} stops)
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time picker overlay */}
      <AnimatePresence>
        {editingTimeFor && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingTimeFor(null)} className="absolute inset-0 z-40 bg-ink-900/40" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-card pb-8"
            >
              <div className="w-12 h-1.5 bg-ink-100 rounded-full mx-auto mt-3" />
              <div className="px-5 pt-3 pb-4 font-bold text-ink-900 font-display">Set arrival time</div>
              <div className="grid grid-cols-4 gap-2 px-5 max-h-48 overflow-y-auto no-scrollbar">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(editingTimeFor, t)}
                    className={`py-2.5 rounded-xl text-sm font-semibold press transition-colors ${stopTimes[editingTimeFor] === t ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-700'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Replace sheet */}
      <AlternativesSheet
        open={!!replaceFor}
        onClose={() => setReplaceFor(null)}
        excludeIds={itinerary.map((p) => p.id)}
        title="Replace stop"
        onPick={(p) => { if (replaceFor) replaceStop(replaceFor, p); setReplaceFor(null); show('Stop replaced', 'success'); }}
        alternatives={alternatives}
      />

      {/* Add sheet (AI mode) */}
      <AlternativesSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        excludeIds={itinerary.map((p) => p.id)}
        title="Add a stop"
        onPick={(p) => { addStop(p); setShowAdd(false); show(`${p.name} added`, 'success'); }}
        alternatives={alternatives}
      />
    </div>
  );
}

/* ---- Summary stat ---- */
function SummStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/15 rounded-xl py-2 px-2 text-center">
      <div className="text-[10px] uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-base font-bold leading-tight">{value}</div>
    </div>
  );
}

/* ---- Loading state ---- */
function LoadingState({ stepIdx }: { stepIdx: number }) {
  return (
    <motion.div key="loading" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} className="flex-1 px-5 pt-4 flex flex-col">
      <div className="flex items-center gap-2 text-brand-600 font-semibold">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}>
          <Sparkles className="w-5 h-5" />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.span key={stepIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="text-[15px]">
            {STEPS[stepIdx]}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="mt-4 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-ink-100 p-3 flex gap-3 items-center">
            <div className="w-16 h-16 rounded-xl shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 rounded shimmer" />
              <div className="h-3 w-1/3 rounded shimmer" />
              <div className="h-3 w-1/4 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ---- Stop Card ---- */
function StopCard({
  index, total, place, scheduledTime, onTimeEdit, onRemove, onReplace, onMoveUp, onMoveDown, isManual,
}: {
  index: number; total: number; place: Place;
  scheduledTime: string; onTimeEdit: () => void;
  onRemove: () => void; onReplace: () => void; onMoveUp: () => void; onMoveDown: () => void;
  isManual?: boolean;
}) {
  const [dragX, setDragX] = useState(0);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end pr-4">
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      <motion.div
        drag="x" dragConstraints={{ left: -80, right: 0 }} dragElastic={0.2}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={(_, info) => { if (info.offset.x < -60) onRemove(); setDragX(0); }}
        className="relative bg-white rounded-2xl border border-ink-100 p-3 flex items-start gap-3"
        style={{ x: dragX }}
      >
        {/* Reorder + number */}
        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
          <button onClick={onMoveUp} disabled={index === 0} className="text-ink-300 disabled:opacity-20 press">
            <GripVertical className="w-4 h-4 rotate-90" />
          </button>
          <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
            {index + 1}
          </div>
          <button onClick={onMoveDown} disabled={index === total - 1} className="text-ink-300 disabled:opacity-20 press">
            <GripVertical className="w-4 h-4 -rotate-90" />
          </button>
        </div>

        <img src={place.image} alt={place.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="font-semibold text-ink-900 truncate text-sm leading-tight">{place.name}</div>
            {isManual && (
              <span className="shrink-0 text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Manual</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ink-500 mt-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{place.rating}
            <span>·</span>
            <span>{place.category}</span>
          </div>

          {/* Time row */}
          <button
            onClick={onTimeEdit}
            className="mt-1.5 flex items-center gap-1 bg-brand-50 rounded-full px-2 py-1 press"
          >
            <Clock className="w-3 h-3 text-brand-500" />
            <span className="text-xs font-semibold text-brand-600">{scheduledTime}</span>
            <Pencil className="w-2.5 h-2.5 text-brand-400" />
          </button>

          <div className="flex items-center gap-1.5 text-xs mt-1">
            <Clock className="w-3 h-3 text-ink-400" />
            <span className="text-ink-500">{place.openingHours}</span>
            <span className="text-ink-300">·</span>
            <DollarSign className="w-3 h-3 text-ink-400" />
            <span className="text-brand-600 font-semibold">
              {formatRp(place.priceRange.min)}{place.priceRange.max !== place.priceRange.min ? `+` : ''}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          {!isManual && (
            <button onClick={onReplace} className="px-2 h-7 rounded-lg bg-brand-50 text-brand-600 text-[11px] font-semibold press">Replace</button>
          )}
          <button onClick={onRemove} className="px-2 h-7 rounded-lg bg-red-50 text-red-500 text-[11px] font-semibold press inline-flex items-center justify-center gap-1">
            <X className="w-3 h-3" /> Remove
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---- Custom Place Form ---- */
function CustomPlaceForm({ onAdd }: { onAdd: (p: Place) => void }) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('50000');
  const [dur, setDur] = useState('60');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    if (!name.trim()) return;
    const custom: Place = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      category: 'Hidden Gem',
      tags: ['Custom'],
      vibes: ['chill', 'chaos', 'zen', 'luxury'],
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
      cost: Number(cost) || 0,
      priceRange: { min: Number(cost) || 0, max: Number(cost) || 0 },
      durationMin: Number(dur) || 60,
      distanceKm: 1.0,
      lat: -8.5055, lng: 115.2620,
      rating: 0,
      description: 'Custom stop added manually.',
      openingHours: 'All day',
    };
    onAdd(custom);
    setName(''); setCost('50000'); setDur('60');
  };

  return (
    <div className="bg-ink-50 rounded-2xl p-3 space-y-2">
      <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Place name" className="w-full bg-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300 border border-ink-100" />
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-xl px-3 py-2 border border-ink-100">
          <div className="text-[10px] text-ink-400">Cost (Rp)</div>
          <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full bg-transparent text-sm font-bold text-ink-900 outline-none" />
        </div>
        <div className="bg-white rounded-xl px-3 py-2 border border-ink-100">
          <div className="text-[10px] text-ink-400">Duration (min)</div>
          <input type="number" value={dur} onChange={(e) => setDur(e.target.value)} className="w-full bg-transparent text-sm font-bold text-ink-900 outline-none" />
        </div>
      </div>
      <button disabled={!name.trim()} onClick={submit} className="w-full h-10 rounded-xl bg-brand-500 disabled:bg-ink-300 text-white font-semibold press flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" /> Add Custom Stop
      </button>
    </div>
  );
}

/* ---- Alternatives Sheet ---- */
function AlternativesSheet({ open, onClose, excludeIds, onPick, title, alternatives }: {
  open: boolean; onClose: () => void; excludeIds: string[]; title: string;
  onPick: (p: Place) => void; alternatives: (ids: string[]) => Place[];
}) {
  const list = alternatives(excludeIds);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-40 bg-ink-900/40" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute inset-x-0 bottom-0 z-50 max-h-[72%] bg-white rounded-t-3xl shadow-card flex flex-col"
          >
            <div className="w-12 h-1.5 bg-ink-100 rounded-full mx-auto mt-3" />
            <div className="px-5 pt-3 pb-2 flex items-center justify-between shrink-0">
              <div className="font-bold text-ink-900 font-display">{title}</div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center text-ink-700 press"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto px-5 pb-6 space-y-3 no-scrollbar">
              {list.length === 0 && <div className="text-sm text-ink-500 py-10 text-center">No more alternatives nearby.</div>}
              {list.map((p) => (
                <button key={p.id} onClick={() => onPick(p)} className="w-full bg-white border border-ink-100 hover:border-brand-300 rounded-2xl p-3 flex items-center gap-3 text-left press">
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 truncate">{p.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-500 mt-0.5">
                      <span>{p.category}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{p.rating}</span>
                    </div>
                    <div className="text-xs text-ink-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.openingHours}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-brand-600">{formatRp(p.cost)}</div>
                    <div className="text-[11px] text-ink-500">{p.distanceKm} km</div>
                  </div>
                  <Plus className="w-4 h-4 text-ink-400 shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
