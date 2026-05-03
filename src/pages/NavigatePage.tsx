import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Pause, Play, SkipForward, Smile, ListTree } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';

const PROMPTS = [
  '🌧 Rain in 15 mins — want indoor options nearby?',
  '💸 Next stop is above your budget — suggest alternative?',
  '📍 You\'re close! Ready to check in?',
];

export default function NavigatePage() {
  const nav = useNavigate();
  const { itinerary, navIndex, setNavIndex, markVisited, setIsNavigating } = useApp();
  const { show } = useToast();

  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 to current stop
  const [arrived, setArrived] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const promptedRef = useRef(false);

  const current = itinerary[navIndex];
  const next = itinerary[navIndex + 1];

  // Progress simulation
  useEffect(() => {
    if (paused || arrived || !current) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const np = Math.min(1, p + 0.012);
        if (np >= 1 && !arrived) setArrived(true);
        if (np > 0.55 && !promptedRef.current) {
          promptedRef.current = true;
          setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
        }
        return np;
      });
    }, 120);
    return () => clearInterval(id);
  }, [paused, arrived, current]);

  const eta = useMemo(() => {
    if (!current) return '0m';
    const remainMin = Math.round((1 - progress) * 12);
    return `${remainMin} min`;
  }, [progress, current]);

  const distRemain = useMemo(() => {
    if (!current) return '0 km';
    return `${(current.distanceKm * (1 - progress)).toFixed(1)} km`;
  }, [progress, current]);

  const onArrived = () => {
    if (!current) return;
    markVisited(current.id);
    show(`Marked ${current.name} as visited 🎉`, 'success');
  };

  const onNext = () => {
    if (navIndex >= itinerary.length - 1) {
      show('Trip complete! 🎉', 'success');
      setIsNavigating(false);
      setTimeout(() => nav('/profile'), 600);
      return;
    }
    setNavIndex(navIndex + 1);
    setProgress(0);
    setArrived(false);
    promptedRef.current = false;
    setPrompt(null);
    show(`Heading to ${itinerary[navIndex + 1].name}`, 'info');
  };

  const onSkip = () => {
    show(`Skipped ${current?.name}`, 'info');
    onNext();
  };

  const onExit = () => nav('/map');

  const confirmCancelNavigation = () => {
    setIsNavigating(false);
    setShowCancelConfirm(false);
    nav('/map');
  };

  if (!current) {
    return (
      <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6">
        <div className="text-ink-700 font-semibold">No active route.</div>
        <button onClick={() => nav('/map')} className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-full">Back to Map</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-white overflow-hidden">
      <StatusBar />

      {/* Top bar: next stop */}
      <div className="px-5 pb-2 flex items-center gap-2">
        <button onClick={onExit} className="w-10 h-10 -ml-2 flex items-center justify-center text-ink-700 press" aria-label="Exit">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-brand-500 text-white rounded-2xl px-3 py-2 shadow-glow">
          <div className="text-[10px] uppercase tracking-wide opacity-90">Next</div>
          <div className="font-bold leading-tight truncate">{current.name}</div>
          <div className="text-xs opacity-90">{eta} · {distRemain}</div>
        </div>
        <button onClick={() => setPaused((p) => !p)} className="w-10 h-10 rounded-full bg-ink-50 flex items-center justify-center press" aria-label="Pause">
          {paused ? <Play className="w-4 h-4 text-ink-800" /> : <Pause className="w-4 h-4 text-ink-800" />}
        </button>
      </div>

      {/* Map area */}
      <div className="flex-1 relative map-bg overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M -5 30 Q 30 35, 60 25 T 110 30" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
          <path d="M -5 60 Q 30 55, 60 65 T 110 60" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
          <path d="M 30 -5 Q 36 40, 30 60 T 36 110" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        </svg>

        {/* Bold route */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d="M 25 78 Q 38 60, 50 50 T 70 26"
            fill="none" stroke="#3B5BFF" strokeWidth="1.8" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9 }}
          />
          {/* progress overlay */}
          <motion.path
            d="M 25 78 Q 38 60, 50 50 T 70 26"
            fill="none" stroke="#172A8C" strokeWidth="1.8" strokeLinecap="round"
            style={{ pathLength: progress }}
          />
        </svg>

        {/* Destination pin (highlighted) */}
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: '70%', top: '26%' }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="bg-brand-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-card flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-white text-brand-500 flex items-center justify-center text-[11px]">{navIndex + 1}</span>
            {current.name}
          </div>
        </motion.div>

        {/* User dot moving along route based on progress */}
        <UserDot progress={progress} />

        {/* Buddy prompt */}
        <AnimatePresence>
          {prompt && (
            <motion.div
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              className="absolute top-3 left-3 right-3 bg-white shadow-card rounded-2xl p-3 flex items-start gap-2 z-20"
            >
              <Smile className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
              <div className="text-sm text-ink-800 flex-1">{prompt}</div>
              <button onClick={() => setPrompt(null)} className="text-xs text-ink-500 font-semibold px-2 py-1">Dismiss</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cancel navigation confirmation */}
      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCancelConfirm(false)} className="absolute inset-0 z-40 bg-ink-900/50" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="absolute inset-x-8 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-5 shadow-card"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🛑</div>
                <div className="font-bold text-ink-900 font-display">Cancel navigation?</div>
                <div className="text-sm text-ink-500 mt-1 leading-snug">Your route progress will be lost.</div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowCancelConfirm(false)} className="flex-1 h-11 rounded-xl bg-ink-50 text-ink-700 font-semibold press">Keep Going</button>
                <button onClick={confirmCancelNavigation} className="flex-1 h-11 rounded-xl bg-red-500 text-white font-semibold press">Cancel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sticky bottom card */}
      <div className="bg-white px-4 pt-3 pb-6 border-t border-ink-100">
        <AnimatePresence mode="wait">
          {arrived ? (
            <motion.div
              key="arrived"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-2xl bg-emerald-500 text-white p-4"
            >
              <div className="flex items-center gap-2 font-bold text-lg"><CheckCircle2 className="w-5 h-5" /> You've arrived 🎉</div>
              <div className="text-sm opacity-90">{current.name}</div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button onClick={onArrived} className="bg-white text-emerald-600 rounded-xl py-2 text-xs font-semibold press">Mark visited</button>
                <button onClick={onNext} className="bg-ink-900 text-white rounded-xl py-2 text-xs font-semibold press">Next stop ›</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3">
                <img src={current.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink-900 truncate">{current.name}</div>
                  <div className="text-xs text-ink-500">Time window 13:00 – 14:30</div>
                  <div className="mt-1.5 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-[width]" style={{ width: `${progress * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <Action icon={<CheckCircle2 className="w-4 h-4" />} label="Visited" onClick={onArrived} />
                <Action icon={<SkipForward className="w-4 h-4" />} label="Skip" onClick={onSkip} />
                <Action icon={<Smile className="w-4 h-4" />} label="Buddy" onClick={() => show('Tap the Buddy button to get help', 'info')} />
              </div>

              <button
                onClick={() => setShowCancelConfirm(true)}
                className="mt-3 w-full h-10 rounded-xl border border-red-200 text-red-500 text-xs font-semibold press flex items-center justify-center gap-1.5 hover:bg-red-50 transition-colors"
              >
                Cancel Navigation
              </button>

              {next && (
                <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-500 bg-ink-50 rounded-xl px-3 py-2">
                  <ListTree className="w-3.5 h-3.5" />
                  After this: <span className="font-semibold text-ink-700">{next.name}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Action({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="press flex flex-col items-center gap-1 bg-ink-50 rounded-xl py-2.5 text-ink-800 text-[11px] font-semibold">
      {icon}
      {label}
    </button>
  );
}

function UserDot({ progress }: { progress: number }) {
  // Approximate position along quadratic curve
  const t = progress;
  // Quadratic Bezier from (25,78) to (70,26) via control (50,50) blended
  const x = (1 - t) * (1 - t) * 25 + 2 * (1 - t) * t * 50 + t * t * 70;
  const y = (1 - t) * (1 - t) * 78 + 2 * (1 - t) * t * 50 + t * t * 26;
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="relative">
        <span className="absolute -inset-3 rounded-full bg-brand-500/30 animate-pulseDot" />
        <span className="block w-4 h-4 rounded-full bg-brand-500 ring-4 ring-white shadow" />
      </div>
    </div>
  );
}
