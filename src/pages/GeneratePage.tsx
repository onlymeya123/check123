import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, GripVertical, Plus, RefreshCw, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import type { Place } from '../data/places';
import { formatRp } from '../lib/format';
import { useToast } from '../components/Toast';

const STEPS = [
  'Finding nearby places…',
  'Matching spots to your vibe…',
  'Optimizing route…',
  'Crafting your perfect journey…',
];

export default function GeneratePage() {
  const nav = useNavigate();
  const { vibe, budget, buildItinerary, setItinerary, itinerary, removeStop, replaceStop, addStop, reorderStop, alternatives } = useApp();
  const { show } = useToast();

  const [phase, setPhase] = useState<'loading' | 'reveal'>('loading');
  const [stepIdx, setStepIdx] = useState(0);
  const [replaceFor, setReplaceFor] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmingPulse, setConfirmingPulse] = useState(false);

  // Build itinerary at mount
  useEffect(() => {
    setItinerary(buildItinerary());
  }, []); // eslint-disable-line

  // Loading sequence
  useEffect(() => {
    if (phase !== 'loading') return;
    const t1 = setInterval(() => setStepIdx((s) => (s + 1) % STEPS.length), 700);
    const t2 = setTimeout(() => setPhase('reveal'), 2200);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, [phase]);

  const totals = useMemo(() => {
    const cost = itinerary.reduce((s, p) => s + p.cost, 0);
    const time = itinerary.reduce((s, p) => s + p.durationMin, 0);
    const dist = itinerary.reduce((s, p) => s + p.distanceKm, 0);
    return { cost, time, dist };
  }, [itinerary]);

  const onConfirm = () => {
    setConfirmingPulse(true);
    show('Journey confirmed ✨', 'success');
    setTimeout(() => nav('/map'), 700);
  };

  return (
    <div className="absolute inset-0 bg-white overflow-hidden flex flex-col">
      <StatusBar />
      <div className="px-5 py-2 flex items-center justify-between">
        <button onClick={() => nav(-1)} className="w-10 h-10 -ml-2 flex items-center justify-center text-ink-700 press" aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="font-bold text-ink-900 font-display">Your Journey</div>
        <div className="text-xs text-brand-600 font-semibold capitalize bg-brand-50 px-2 py-1 rounded-full">{vibe} · {formatRp(budget)}</div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'loading' ? (
          <LoadingState key="loading" stepIdx={stepIdx} />
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Summary */}
            <div className="mx-5 mt-2 p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
              <div className="flex items-center gap-2 text-sm font-semibold opacity-90"><Sparkles className="w-4 h-4" /> Crafted for your {vibe} day</div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <Stat label="Stops" value={String(itinerary.length)} />
                <Stat label="Distance" value={`${totals.dist.toFixed(1)} km`} />
                <Stat label="Est. Time" value={`${Math.round(totals.time / 60)}h ${totals.time % 60}m`} />
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

      {/* Replace sheet */}
      <AlternativesSheet
        open={!!replaceFor}
        onClose={() => setReplaceFor(null)}
        excludeIds={itinerary.map((p) => p.id)}
        title="Replace stop"
        onPick={(p) => {
          if (replaceFor) replaceStop(replaceFor, p);
          setReplaceFor(null);
          show('Stop replaced', 'success');
        }}
        alternatives={alternatives}
      />

      {/* Add sheet */}
      <AlternativesSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        excludeIds={itinerary.map((p) => p.id)}
        title="Add a stop"
        onPick={(p) => {
          addStop(p);
          setShowAdd(false);
          show(`${p.name} added`, 'success');
        }}
        alternatives={alternatives}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/15 rounded-xl py-2 px-2 text-center">
      <div className="text-[10px] uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-base font-bold leading-tight">{value}</div>
    </div>
  );
}

function LoadingState({ stepIdx }: { stepIdx: number }) {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }}
      className="flex-1 px-5 pt-4 flex flex-col"
    >
      <div className="flex items-center gap-2 text-brand-600 font-semibold">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}>
          <Sparkles className="w-5 h-5" />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.span
            key={stepIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-[15px]"
          >
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

function StopCard({
  index, total, place, onRemove, onReplace, onMoveUp, onMoveDown,
}: {
  index: number; total: number; place: Place;
  onRemove: () => void; onReplace: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const [dragX, setDragX] = useState(0);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="relative"
    >
      {/* Swipe-to-delete BG */}
      <div className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end pr-4">
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.2}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) onRemove();
          setDragX(0);
        }}
        className="relative bg-white rounded-2xl border border-ink-100 p-3 flex items-center gap-3"
        style={{ x: dragX }}
      >
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={index === 0} className="text-ink-400 disabled:opacity-30 press">
            <GripVertical className="w-4 h-4 rotate-90" />
          </button>
        </div>

        <div className="relative">
          <img src={place.image} alt={place.name} className="w-16 h-16 rounded-xl object-cover" />
          <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
            {index + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink-900 truncate">{place.name}</div>
          <div className="text-xs text-ink-500">{place.category} · {place.tags[0]}</div>
          <div className="text-xs text-ink-700 mt-0.5">
            {place.durationMin} min · <span className="text-brand-600 font-semibold">{formatRp(place.cost)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button onClick={onReplace} className="px-2 h-7 rounded-lg bg-brand-50 text-brand-600 text-[11px] font-semibold press">Replace</button>
          <button onClick={onRemove} className="px-2 h-7 rounded-lg bg-ink-50 text-ink-600 text-[11px] font-semibold press inline-flex items-center justify-center gap-1">
            <X className="w-3 h-3" /> Remove
          </button>
        </div>

        {/* Hidden ordering helpers (down-arrow on small screens) */}
        <button onClick={onMoveDown} disabled={index === total - 1} className="hidden" />
      </motion.div>
    </motion.div>
  );
}

function AlternativesSheet({
  open, onClose, excludeIds, onPick, title, alternatives,
}: {
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
            className="absolute inset-x-0 bottom-0 z-50 max-h-[68%] bg-white rounded-t-3xl shadow-card flex flex-col"
          >
            <div className="w-12 h-1.5 bg-ink-100 rounded-full mx-auto mt-3" />
            <div className="px-5 pt-3 pb-2 flex items-center justify-between">
              <div className="font-bold text-ink-900 font-display">{title}</div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center text-ink-700 press"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto px-5 pb-6 space-y-3 no-scrollbar">
              {list.length === 0 && <div className="text-sm text-ink-500 py-10 text-center">No more alternatives nearby.</div>}
              {list.map((p) => (
                <button key={p.id} onClick={() => onPick(p)} className="w-full bg-white border border-ink-100 hover:border-brand-300 rounded-2xl p-3 flex items-center gap-3 text-left press">
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 truncate">{p.name}</div>
                    <div className="text-xs text-ink-500">{p.category} · ⭐ {p.rating}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-brand-600">{formatRp(p.cost)}</div>
                    <div className="text-[11px] text-ink-500">{p.distanceKm} km</div>
                  </div>
                  <Plus className="w-4 h-4 text-ink-400" />
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

