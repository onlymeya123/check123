import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Sparkles, CloudSun, Bookmark, Palmtree, Flame, Diamond } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { HERO_IMAGE, USER } from '../data/user';
import { formatRp } from '../lib/format';
import { useMemo, useState } from 'react';
import { useToast } from '../components/Toast';

const VIBES: { id: 'chill' | 'chaos' | 'zen' | 'luxury'; label: string; icon: string; tint: string }[] = [
  { id: 'chill',  label: 'Chill',  icon: '🌴', tint: '#10B981' },
  { id: 'chaos',  label: 'Chaos',  icon: '🔥', tint: '#F97316' },
  { id: 'zen',    label: 'Zen',    icon: '🧘', tint: '#3B5BFF' },
  { id: 'luxury', label: 'Luxury', icon: '💎', tint: '#A855F7' },
];

export default function HomePage() {
  const nav = useNavigate();
  const { vibe, setVibe, budget, setBudget, itinerary } = useApp();
  const { show } = useToast();
  const [surprise, setSurprise] = useState(true);
  const [search, setSearch] = useState('');

  const sliderPct = useMemo(() => {
    const min = 50_000, max = 1_000_000;
    return Math.max(0, Math.min(100, ((budget - min) / (max - min)) * 100));
  }, [budget]);

  const todayPlan = itinerary.slice(0, 2);

  return (
    <div className="absolute inset-0 overflow-y-auto pb-32 no-scrollbar bg-white">
      {/* Hero */}
      <div className="relative h-[300px] overflow-hidden">
        <motion.img
          src={HERO_IMAGE}
          alt="Ubud"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white" />
        <div className="relative z-10">
          <StatusBar tone="light" />
          <div className="px-5 mt-4 flex items-start justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium drop-shadow">Good morning,</p>
              <h1 className="text-white text-4xl font-extrabold tracking-tight drop-shadow flex items-center gap-2 font-display">
                {USER.firstName} <motion.span animate={{ rotate: [0, 18, -8, 14, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}>👋</motion.span>
              </h1>
              <button className="mt-2 inline-flex items-center gap-1 bg-white/95 text-ink-800 text-xs font-semibold px-2.5 py-1 rounded-full press">
                📍 {USER.current} <span className="text-ink-400">▾</span>
              </button>
            </div>
            <button className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white press">
              <img src={USER.avatar} alt="me" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-500 rounded-full ring-2 ring-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Vibe Card overlapping */}
      <div className="px-5 -mt-16 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 28 }}
          className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4 border border-ink-100"
        >
          <div className="text-center">
            <CloudSun className="w-8 h-8 text-brand-500 mx-auto" />
            <div className="text-2xl font-extrabold text-ink-900 mt-1 font-display">28°</div>
            <div className="text-[11px] text-ink-500 leading-tight">Partly Cloudy</div>
            <div className="text-[10px] text-ink-400">Feels like 31°</div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold tracking-widest text-brand-500">TODAY'S VIBE</div>
            <div className="text-ink-900 font-bold leading-snug font-display">Hidden Treasures kind of day ✨</div>
            <div className="text-xs text-ink-500 mt-1">3 spots near you · Est. {formatRp(120000)}</div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="px-5 mt-4">
        <div className="bg-ink-50 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Where to next?"
            className="flex-1 bg-transparent outline-none text-sm text-ink-800 placeholder:text-ink-400"
          />
          <button className="press w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-soft" aria-label="Filters" onClick={() => show('Filters opened', 'info')}>
            <SlidersHorizontal className="w-4 h-4 text-ink-700" />
          </button>
        </div>
      </div>

      {/* Pick your vibe */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink-900 font-display">Pick your vibe</h2>
          <label className="flex items-center gap-2 text-xs text-brand-500 font-semibold">
            Surprise me
            <button
              onClick={() => setSurprise((s) => !s)}
              className={`relative w-9 h-5 rounded-full transition-colors ${surprise ? 'bg-brand-500' : 'bg-ink-200'}`}
              aria-pressed={surprise}
            >
              <motion.span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                animate={{ x: surprise ? 18 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </label>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {VIBES.map((v) => {
            const active = v.id === vibe;
            const Icon =
              v.id === 'chill' ? Palmtree :
              v.id === 'chaos' ? Flame :
              v.id === 'zen'   ? Sparkles :
              Diamond;
            return (
              <motion.button
                key={v.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setVibe(v.id)}
                animate={{ scale: active ? 1.04 : 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-colors ${
                  active ? 'border-brand-500 bg-brand-50' : 'border-ink-100 bg-white'
                }`}
              >
                <Icon
                  className="w-7 h-7"
                  style={{ color: active ? '#3B5BFF' : v.tint }}
                  strokeWidth={2.2}
                  fill={active && v.id === 'chaos' ? '#F97316' : 'transparent'}
                />
                <span className={`text-xs font-semibold ${active ? 'text-brand-600' : 'text-ink-700'}`}>{v.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Budget slider */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink-900 font-display">
            Budget range <span className="text-ink-400 font-normal text-sm">(per stop)</span>
          </div>
          <span className="bg-emerald-50 text-emerald-600 text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Good range
          </span>
        </div>
        <input
          type="range"
          min={50_000}
          max={1_000_000}
          step={10_000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="vibe-slider mt-3 mb-1"
          style={{ ['--val' as any]: `${sliderPct}%` }}
        />
        <div className="flex justify-between text-xs text-ink-500">
          <span>{formatRp(50_000)}</span>
          <span className="text-brand-600 font-semibold">{formatRp(budget)}</span>
          <span>{formatRp(1_000_000)}+</span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mt-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => nav('/generate')}
          className="w-full h-14 rounded-2xl bg-brand-500 text-white font-bold text-base shadow-glow flex items-center justify-center gap-2 press"
        >
          <Sparkles className="w-5 h-5" /> Generate My Journey
        </motion.button>
      </div>

      {/* Today's Plan */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-ink-500">TODAY'S PLAN</span>
          <button className="text-xs text-brand-600 font-semibold press" onClick={() => nav('/map')}>See full itinerary ›</button>
        </div>

        <div className="mt-3 space-y-3 relative">
          {/* timeline rail */}
          <div className="absolute left-2 top-2 bottom-2 w-px bg-ink-200" />
          {todayPlan.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
              className="relative pl-6"
            >
              <span className="absolute left-1 top-3 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-brand-100" />
              <div className="text-xs font-semibold text-ink-700 mb-1">{['10:30', '13:00'][i]}</div>
              <div className="bg-white rounded-2xl border border-ink-100 p-2 flex items-center gap-3 press" onClick={() => nav('/map')}>
                <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 truncate">{p.name}</div>
                  <div className="text-xs text-ink-500">{p.category} · Cozy</div>
                  <div className="text-xs text-brand-600 font-semibold mt-0.5">{formatRp(p.cost)}</div>
                </div>
                <button className="w-9 h-9 rounded-full hover:bg-ink-50 flex items-center justify-center" aria-label="Save">
                  <Bookmark className={`w-4 h-4 ${i === 0 ? 'text-brand-500 fill-brand-500' : 'text-ink-400'}`} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
