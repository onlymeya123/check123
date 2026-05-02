import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, Crosshair, List, Navigation, X, MapPin, Plus, Smile } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { formatRp } from '../lib/format';
import { useToast } from '../components/Toast';
import type { Place } from '../data/places';

type ViewMode = 'map' | 'list';

export default function MapPage() {
  const nav = useNavigate();
  const { itinerary, setIsNavigating, setNavIndex, reorderStop } = useApp();
  const { show } = useToast();
  const [view, setView] = useState<ViewMode>('map');
  const [selected, setSelected] = useState<Place | null>(null);

  const totals = useMemo(() => {
    const cost = itinerary.reduce((s, p) => s + p.cost, 0);
    const time = itinerary.reduce((s, p) => s + p.durationMin, 0);
    const dist = itinerary.reduce((s, p) => s + p.distanceKm, 0);
    return { cost, time, dist };
  }, [itinerary]);

  const startNavigation = () => {
    setIsNavigating(true);
    setNavIndex(0);
    show('Starting your journey…', 'info');
    setTimeout(() => nav('/navigate'), 240);
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      <StatusBar />

      {/* Header */}
      <div className="px-5 pt-2 pb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-ink-900 font-bold font-display">
            MAP / ITINERARY <ChevronDown className="w-4 h-4 text-ink-500" />
          </div>
          <div className="text-xs text-ink-500">Day 1 · Ubud, Bali</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === 'map' ? 'list' : 'map')}
            className="press flex items-center gap-1.5 px-3 h-9 rounded-full bg-ink-50 text-ink-800 text-xs font-semibold"
          >
            <List className="w-4 h-4" /> {view === 'map' ? 'List View' : 'Map View'}
          </button>
          <button className="w-9 h-9 rounded-full bg-ink-50 flex items-center justify-center press" aria-label="Alerts">
            <Bell className="w-4 h-4 text-ink-700" />
          </button>
        </div>
      </div>

      {view === 'map' ? (
        <div className="flex-1 relative overflow-hidden">
          <MapStage itinerary={itinerary} onPin={setSelected} />

          {/* Floating Recenter / Navigation */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 z-20">
            <button onClick={() => show('Recentered on you', 'info')} className="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center press">
              <Crosshair className="w-4.5 h-4.5 text-ink-700" />
            </button>
            <button onClick={startNavigation} className="w-10 h-10 rounded-full bg-brand-500 shadow-glow flex items-center justify-center press">
              <Navigation className="w-4.5 h-4.5 text-white" />
            </button>
          </div>

          {/* Bottom Sheet — Itinerary */}
          <ItineraryBottomSheet itinerary={itinerary} totals={totals} onStart={startNavigation} onReorderUp={(i) => reorderStop(i, Math.max(0, i - 1))} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pb-40 no-scrollbar">
          <ListView itinerary={itinerary} onStart={startNavigation} totals={totals} />
        </div>
      )}

      {/* Place card */}
      <AnimatePresence>
        {selected && (
          <PlaceCard place={selected} onClose={() => setSelected(null)} onNavigate={() => { setSelected(null); startNavigation(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- MAP STAGE ----------------- */

function MapStage({ itinerary, onPin }: { itinerary: Place[]; onPin: (p: Place) => void }) {
  // Layout pins on a faux map. We compute positions by index (deterministic-ish).
  const positions = [
    { x: 70, y: 18 },
    { x: 60, y: 38 },
    { x: 48, y: 58 },
    { x: 64, y: 75 },
    { x: 30, y: 82 },
  ];
  const pts = itinerary.map((_, i) => positions[i % positions.length]);

  // SVG path
  const path = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="absolute inset-0 map-bg">
      {/* Subtle grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#C7D2FE" strokeWidth="0.05" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#C7D2FE" strokeWidth="0.05" />
        ))}
      </svg>

      {/* Mock streets */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M -5 30 Q 30 35, 60 25 T 110 30" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
        <path d="M -5 60 Q 30 55, 60 65 T 110 60" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        <path d="M 30 -5 Q 36 40, 30 60 T 36 110" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        <path d="M 70 -5 Q 64 40, 72 60 T 70 110" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
      </svg>

      {/* Route */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d={path}
          fill="none"
          stroke="#3B5BFF"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeDasharray="2 1.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      {/* User location pulse */}
      <div className="absolute" style={{ left: '24%', top: '70%' }}>
        <div className="relative">
          <span className="absolute -inset-3 rounded-full bg-brand-500/30 animate-pulseDot" />
          <span className="block w-4 h-4 rounded-full bg-brand-500 ring-4 ring-white shadow" />
        </div>
      </div>

      {/* Pins */}
      {itinerary.map((p, i) => {
        const pos = pts[i];
        return (
          <motion.button
            key={p.id}
            onClick={() => onPin(p)}
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 400, damping: 18 }}
            whileTap={{ scale: 0.92 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 press"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center ring-4 ring-white shadow-card">
                {i + 1}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-3 h-3 rotate-45 bg-brand-500" />
            </div>
            <div className="mt-1.5 inline-flex items-center bg-white rounded-full px-2 py-0.5 text-[10px] font-semibold text-ink-800 shadow-soft -translate-x-1/2 absolute left-1/2">
              {p.name.split(' ').slice(0, 2).join(' ')}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* --------------- BOTTOM SHEET ---------------- */

function ItineraryBottomSheet({
  itinerary, totals, onStart,
}: { itinerary: Place[]; totals: { cost: number; time: number; dist: number }; onStart: () => void; onReorderUp?: (i: number) => void }) {
  return (
    <motion.div
      initial={{ y: 80 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      className="absolute inset-x-0 bottom-0 z-10 bg-white rounded-t-3xl shadow-card pb-32"
    >
      <div className="w-12 h-1.5 bg-ink-100 rounded-full mx-auto mt-2" />
      <div className="px-5 pt-3 grid grid-cols-3 text-center text-ink-900">
        <Block label="Estimated Time" value={`${Math.floor(totals.time / 60)}h ${totals.time % 60}m`} />
        <Block label="Distance" value={`${totals.dist.toFixed(1)} km`} />
        <Block label="Est. Cost" value={formatRp(totals.cost)} />
      </div>
      <div className="px-5 mt-3 max-h-[28vh] overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          {itinerary.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl p-2 border border-ink-100">
              <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">{i + 1}</div>
              <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 truncate text-sm">{p.name}</div>
                <div className="text-[11px] text-ink-500">{p.category} · {p.tags[0]}</div>
                <div className="text-[11px] text-ink-700">{nineColon(i)} – {nineColon(i, 30)}</div>
              </div>
              <div className="text-right text-xs text-brand-600 font-semibold">{formatRp(p.cost)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 mt-3">
        <button onClick={onStart} className="w-full h-12 bg-brand-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-glow press">
          <Navigation className="w-4 h-4" /> Start Navigation
        </button>
      </div>
    </motion.div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-base font-bold text-ink-900 font-display">{value}</div>
      <div className="text-[11px] text-ink-500">{label}</div>
    </div>
  );
}

function nineColon(i: number, addMin = 0) {
  const start = 10 * 60 + 30 + i * 150 + addMin;
  const h = Math.floor(start / 60) % 24;
  const m = start % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/* ----------------- LIST VIEW ----------------- */

function ListView({ itinerary, onStart, totals }: { itinerary: Place[]; onStart: () => void; totals: { cost: number; time: number; dist: number } }) {
  return (
    <div className="pt-2">
      <div className="grid grid-cols-3 bg-ink-50 rounded-2xl p-3 mb-3">
        <Block label="Time" value={`${Math.floor(totals.time / 60)}h ${totals.time % 60}m`} />
        <Block label="Distance" value={`${totals.dist.toFixed(1)} km`} />
        <Block label="Cost" value={formatRp(totals.cost)} />
      </div>
      <div className="space-y-3">
        {itinerary.map((p, i) => (
          <div key={p.id} className="rounded-2xl border border-ink-100 p-3 flex gap-3 items-center">
            <div className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">{i + 1}</div>
            <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink-900 truncate">{p.name}</div>
              <div className="text-xs text-ink-500">{p.category} · {p.tags[0]}</div>
            </div>
            <div className="text-xs text-brand-600 font-semibold">{formatRp(p.cost)}</div>
          </div>
        ))}
      </div>
      <button onClick={onStart} className="mt-5 w-full h-12 bg-brand-500 text-white font-bold rounded-2xl shadow-glow press">
        Start Navigation
      </button>
    </div>
  );
}

/* ----------------- PLACE CARD ----------------- */

function PlaceCard({ place, onClose, onNavigate }: { place: Place; onClose: () => void; onNavigate: () => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-30 bg-ink-900/30" />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute inset-x-0 bottom-0 z-40 bg-white rounded-t-3xl p-5 shadow-card"
      >
        <div className="flex items-start gap-3">
          <img src={place.image} alt={place.name} className="w-20 h-20 rounded-2xl object-cover" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="font-bold text-ink-900 font-display truncate">{place.name}</div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center press"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-xs text-ink-500">{place.category} · ⭐ {place.rating}</div>
            <div className="text-xs text-ink-700 mt-1">{place.description}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <Block label="Time" value={`${place.durationMin}m`} />
          <Block label="Distance" value={`${place.distanceKm} km`} />
          <Block label="Cost" value={formatRp(place.cost)} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button className="h-12 rounded-2xl bg-ink-50 text-ink-800 font-semibold press inline-flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Save</button>
          <button onClick={onNavigate} className="h-12 rounded-2xl bg-brand-500 text-white font-semibold shadow-glow press inline-flex items-center justify-center gap-2">
            <Navigation className="w-4 h-4" /> Navigate
          </button>
        </div>
        <button className="mt-3 w-full h-10 rounded-2xl bg-brand-50 text-brand-700 font-semibold inline-flex items-center justify-center gap-2 press">
          <Smile className="w-4 h-4" /> Ask Buddy about this
        </button>
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-ink-500"><MapPin className="w-3 h-3" /> {place.lat.toFixed(3)}, {place.lng.toFixed(3)}</div>
      </motion.div>
    </>
  );
}
