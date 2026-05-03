import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, Sparkles, CloudSun, Bookmark, Palmtree, Flame,
  Diamond, X, Star, MapPin, Clock, Link2, Camera, Play, Pencil,
  Calendar, ChevronRight, DollarSign,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { HERO_IMAGE, USER } from '../data/user';
import { formatRp } from '../lib/format';
import { useMemo, useRef, useState } from 'react';
import { useToast } from '../components/Toast';
import { PLACES, type Category, type Vibe } from '../data/places';
import type { Place } from '../data/places';

const VIBES: { id: Vibe; label: string; icon: string; tint: string }[] = [
  { id: 'chill', label: 'Chill', icon: '🌴', tint: '#10B981' },
  { id: 'chaos', label: 'Chaos', icon: '🔥', tint: '#F97316' },
  { id: 'zen', label: 'Zen', icon: '🧘', tint: '#3B5BFF' },
  { id: 'luxury', label: 'Luxury', icon: '💎', tint: '#A855F7' },
];

const CATEGORIES: Category[] = ['Cafe', 'Nature', 'Cultural', 'Historic', 'Foodie', 'Hidden Gem', 'Cozy'];

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const totalMin = 6 * 60 + i * 30;
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

const SOCIAL_MOCK: Record<string, { platform: string; name: string; category: string; desc: string; image: string; cost: number }> = {
  tiktok: {
    platform: 'TikTok',
    name: 'Warung Sunset Cliff Bali',
    category: 'Hidden Gem',
    desc: 'Cliffside warung with jaw-dropping ocean sunset views, found viral on TikTok.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    cost: 65000,
  },
  instagram: {
    platform: 'Instagram',
    name: 'Pura Tirta Gangga Pool',
    category: 'Scenic',
    desc: 'Ancient royal water palace with lotus ponds perfect for an Instagram shot.',
    image: 'https://images.unsplash.com/photo-1604999333679-b86d54738315?auto=format&fit=crop&w=800&q=80',
    cost: 30000,
  },
};

export default function HomePage() {
  const nav = useNavigate();
  const {
    vibe, setVibe, budget, setBudget, itinerary,
    surpriseMode, setSurpriseMode, setItinerary, buildItinerary,
    savedPlaces, savePlace, removeSavedPlace, isSaved,
    setJourneyStart,
  } = useApp();
  const { show } = useToast();

  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCats, setFilterCats] = useState<Category[]>([]);
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [socialUrl, setSocialUrl] = useState('');
  const [socialParsing, setSocialParsing] = useState(false);
  const [socialResult, setSocialResult] = useState<typeof SOCIAL_MOCK[string] | null>(null);
  const socialInputRef = useRef<HTMLInputElement>(null);
  const [planSheet, setPlanSheet] = useState(false);
  const [planTarget, setPlanTarget] = useState<'ai' | 'manual'>('ai');
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);

  // Local journey-start form state (mirrors context while editing)
  const [localDate, setLocalDate] = useState<'today' | 'tomorrow'>('today');
  const [localTime, setLocalTime] = useState('09:00');
  const [localDays, setLocalDays] = useState(1);

  const sliderPct = useMemo(() => {
    const min = 50_000, max = 1_000_000;
    return Math.max(0, Math.min(100, ((budget - min) / (max - min)) * 100));
  }, [budget]);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return PLACES.filter((p) => {
      const matchText = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
      const matchCat = filterCats.length === 0 || filterCats.includes(p.category);
      const matchRating = p.rating >= filterMinRating;
      return matchText && matchCat && matchRating;
    });
  }, [search, filterCats, filterMinRating]);

  const activeFilters = filterCats.length + (filterMinRating > 0 ? 1 : 0);

  const handleSurpriseToggle = () => {
    const next = !surpriseMode;
    setSurpriseMode(next);
    if (next) {
      const randomVibes: Vibe[] = ['chill', 'chaos', 'zen', 'luxury'];
      setVibe(randomVibes[Math.floor(Math.random() * randomVibes.length)]);
      show('Surprise mode on — we\'ll pick something unexpected ✨', 'info');
    }
  };

  const openPlanSheet = (target: 'ai' | 'manual') => {
    setPlanTarget(target);
    setLocalDate('today');
    setLocalTime('09:00');
    setLocalDays(1);
    setPlanSheet(true);
  };

  const confirmPlan = () => {
    setJourneyStart({ date: localDate, time: localTime, days: localDays });
    if (planTarget === 'ai') {
      if (surpriseMode) setItinerary(buildItinerary());
      setPlanSheet(false);
      nav('/generate');
    } else {
      setPlanSheet(false);
      nav('/generate?mode=manual');
    }
  };

  const parseSocialLink = () => {
    if (!socialUrl.trim()) return;
    setSocialParsing(true);
    setSocialResult(null);
    setTimeout(() => {
      setSocialParsing(false);
      const lower = socialUrl.toLowerCase();
      if (lower.includes('tiktok')) setSocialResult(SOCIAL_MOCK.tiktok);
      else if (lower.includes('instagram') || lower.includes('ig') || lower.includes('reel')) setSocialResult(SOCIAL_MOCK.instagram);
      else setSocialResult(SOCIAL_MOCK.tiktok);
    }, 1800);
  };

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  const tomorrowLabel = new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="absolute inset-0 overflow-y-auto pb-32 no-scrollbar bg-white">
      {/* Hero */}
      <div className="relative h-[280px] overflow-hidden">
        <motion.img
          src={HERO_IMAGE} alt="Ubud"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08 }} animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/90" />
        <div className="relative z-10">
          <StatusBar tone="light" />
          <div className="px-5 mt-4 flex items-start justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium drop-shadow">Good morning,</p>
              <h1 className="text-white text-4xl font-extrabold tracking-tight drop-shadow flex items-center gap-2 font-display">
                {USER.firstName}
                <motion.span animate={{ rotate: [0, 18, -8, 14, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}>👋</motion.span>
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

      {/* Daily Vibe Card */}
      <div className="px-5 -mt-12 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 28 }}
          className="bg-white/75 backdrop-blur-xl rounded-2xl shadow-lg p-4 flex items-center gap-4 border border-white/80"
        >
          <div className="text-center shrink-0">
            <CloudSun className="w-8 h-8 text-brand-500 mx-auto" />
            <div className="text-2xl font-extrabold text-ink-900 mt-1 font-display">28°</div>
            <div className="text-[11px] text-ink-500 leading-tight">Partly Cloudy</div>
          </div>
          <div className="w-px h-10 bg-ink-200/60 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold tracking-widest text-brand-500">TODAY'S VIBE</div>
            <div className="text-ink-900 font-bold leading-snug font-display">Hidden Treasures kind of day ✨</div>
            <div className="text-xs text-ink-500 mt-0.5">3 spots near you · Est. {formatRp(120000)}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] text-ink-400">Humidity</div>
            <div className="text-sm font-bold text-ink-700">74%</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">✓ Great day</div>
          </div>
        </motion.div>
      </div>

      {/* Search + Filter */}
      <div className="px-5 mt-4">
        <div className="bg-ink-50 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-ink-400 shrink-0" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search places, vibes, activities…"
            className="flex-1 bg-transparent outline-none text-sm text-ink-800 placeholder:text-ink-400"
          />
          <button
            className={`relative press w-9 h-9 rounded-xl flex items-center justify-center shadow-soft transition-colors ${activeFilters > 0 ? 'bg-brand-500' : 'bg-white'}`}
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal className={`w-4 h-4 ${activeFilters > 0 ? 'text-white' : 'text-ink-700'}`} />
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeFilters}</span>
            )}
          </button>
        </div>
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mt-2 bg-white rounded-2xl border border-ink-100 shadow-card overflow-hidden"
            >
              {searchResults.slice(0, 5).map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => { setSearch(''); setDetailPlace(p); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 press hover:bg-ink-50 text-left ${i > 0 ? 'border-t border-ink-50' : ''}`}
                >
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 text-sm truncate">{p.name}</div>
                    <div className="text-xs text-ink-500">{p.category} · ⭐ {p.rating}</div>
                  </div>
                  <div className="text-xs font-semibold text-brand-600 shrink-0">{formatRp(p.cost)}</div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pick your vibe */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-ink-900 font-display">Pick your vibe</h2>
          <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: surpriseMode ? '#3B5BFF' : '#6B7280' }}>
            <span>Surprise me</span>
            <button
              onClick={handleSurpriseToggle}
              className={`relative w-9 h-5 rounded-full transition-colors ${surpriseMode ? 'bg-brand-500' : 'bg-ink-200'}`}
            >
              <motion.span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                animate={{ x: surpriseMode ? 18 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </label>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {VIBES.map((v) => {
            const active = v.id === vibe && !surpriseMode;
            const Icon = v.id === 'chill' ? Palmtree : v.id === 'chaos' ? Flame : v.id === 'zen' ? Sparkles : Diamond;
            return (
              <motion.button
                key={v.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => { setVibe(v.id); setSurpriseMode(false); }}
                animate={{ scale: active ? 1.04 : 1, opacity: surpriseMode ? 0.55 : 1 }}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-colors ${active ? 'border-brand-500 bg-brand-50' : 'border-ink-100 bg-white'}`}
              >
                <Icon className="w-7 h-7" style={{ color: active ? '#3B5BFF' : v.tint }} strokeWidth={2.2} />
                <span className={`text-xs font-semibold ${active ? 'text-brand-600' : 'text-ink-700'}`}>{v.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Budget slider */}
      <div className="px-5 mt-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink-900 font-display">Budget <span className="text-ink-400 font-normal text-sm">(per stop)</span></div>
          <span className="bg-emerald-50 text-emerald-600 text-[11px] font-semibold px-2 py-0.5 rounded-full">{formatRp(budget)}</span>
        </div>
        <input
          type="range" min={50_000} max={1_000_000} step={10_000}
          value={budget} onChange={(e) => setBudget(Number(e.target.value))}
          className="vibe-slider mt-2 mb-0"
          style={{ ['--val' as any]: `${sliderPct}%` }}
        />
      </div>

      {/* CTA — Two equal-weight options */}
      <div className="px-5 mt-5">
        <div className="grid grid-cols-2 gap-3">
          {/* AI Generate */}
          <motion.button
            whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.01 }}
            onClick={() => openPlanSheet('ai')}
            className={`rounded-2xl p-4 text-left flex flex-col gap-2 press ${surpriseMode ? 'bg-gradient-to-br from-brand-500 via-purple-500 to-orange-400 shadow-glow' : 'bg-brand-500 shadow-glow'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm font-display leading-tight">
                {surpriseMode ? 'Surprise Me' : 'AI Generate'}
              </div>
              <div className="text-[11px] text-white/75 mt-0.5 leading-tight">Let Buddy plan it</div>
            </div>
          </motion.button>

          {/* Plan Manually */}
          <motion.button
            whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.01 }}
            onClick={() => openPlanSheet('manual')}
            className="rounded-2xl p-4 text-left flex flex-col gap-2 press bg-white border-2 border-brand-200 hover:border-brand-400 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <div className="font-bold text-ink-900 text-sm font-display leading-tight">Plan Manually</div>
              <div className="text-[11px] text-ink-500 mt-0.5 leading-tight">Your way, your stops</div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Today's Plan */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold tracking-widest text-ink-500">TODAY'S PLAN</span>
          {itinerary.length > 0 && (
            <button className="text-xs text-brand-600 font-semibold press" onClick={() => nav('/map')}>View on map ›</button>
          )}
        </div>

        {itinerary.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-brand-50 rounded-2xl p-6 text-center border border-brand-100"
          >
            <div className="text-4xl mb-3">🗺️</div>
            <div className="font-bold text-ink-900 text-base font-display">No plans yet</div>
            <div className="text-sm text-ink-500 mt-1 leading-snug">Ready to explore? Start building your day</div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => openPlanSheet('ai')}
                className="h-10 rounded-xl bg-brand-500 text-white text-xs font-semibold press flex items-center justify-center gap-1.5 shadow-glow"
              >
                <Sparkles className="w-3.5 h-3.5" /> Generate Journey
              </button>
              <button
                onClick={() => openPlanSheet('manual')}
                className="h-10 rounded-xl bg-white border border-brand-200 text-brand-700 text-xs font-semibold press flex items-center justify-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" /> Plan Manually
              </button>
            </div>
            {savedPlaces.length > 0 && (
              <button className="mt-3 text-xs text-brand-600 font-semibold press flex items-center gap-1 mx-auto">
                <Bookmark className="w-3 h-3" /> Use saved places
              </button>
            )}
          </motion.div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-2.5 top-4 bottom-4 w-px bg-ink-200" />
            <div className="space-y-3">
              {itinerary.map((p, i) => {
                const startMin = 10 * 60 + 30 + i * 150;
                const h = Math.floor(startMin / 60) % 24;
                const m = startMin % 60;
                const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="relative pl-7"
                  >
                    <span className="absolute left-0.5 top-4 w-4 h-4 rounded-full bg-brand-500 ring-4 ring-brand-100 flex items-center justify-center z-10">
                      <span className="text-[8px] text-white font-bold">{i + 1}</span>
                    </span>
                    <div className="text-xs font-semibold text-ink-600 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeStr}
                      {i > 0 && <span className="text-ink-400 font-normal ml-1">· {itinerary[i].distanceKm} km from prev</span>}
                    </div>
                    <button
                      onClick={() => setDetailPlace(p)}
                      className="w-full bg-white rounded-2xl border border-ink-100 p-2.5 flex items-center gap-3 press text-left hover:border-brand-200 transition-colors"
                    >
                      <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink-900 truncate">{p.name}</div>
                        <div className="text-xs text-ink-500 flex items-center gap-1.5 mt-0.5">
                          <span>{p.category}</span>
                          <span className="text-ink-300">·</span>
                          <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{p.rating}</span>
                          <span className="text-ink-300">·</span>
                          <span className="text-ink-400">{p.openingHours}</span>
                        </div>
                        <div className="text-xs text-brand-600 font-semibold mt-0.5">
                          {formatRp(p.priceRange.min)}{p.priceRange.max !== p.priceRange.min && ` – ${formatRp(p.priceRange.max)}`}
                        </div>
                      </div>
                      <button
                        className="w-9 h-9 rounded-full hover:bg-ink-50 flex items-center justify-center shrink-0 press"
                        onClick={(e) => { e.stopPropagation(); isSaved(p.id) ? removeSavedPlace(p.id) : savePlace(p); }}
                        aria-label={isSaved(p.id) ? 'Unsave' : 'Save'}
                      >
                        <Bookmark className={`w-4 h-4 transition-colors ${isSaved(p.id) ? 'fill-brand-500 text-brand-500' : 'text-ink-400'}`} />
                      </button>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Saved Places */}
      <AnimatePresence>
        {savedPlaces.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="px-5 mt-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-ink-900 font-display flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-brand-500 fill-brand-500" /> Saved Places
              </span>
              <span className="text-xs text-ink-500">{savedPlaces.length} saved</span>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {savedPlaces.map((p) => (
                <motion.button
                  key={p.id}
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  onClick={() => setDetailPlace(p)}
                  className="shrink-0 w-36 rounded-2xl border border-ink-100 overflow-hidden press hover:border-brand-200 transition-colors text-left"
                >
                  <div className="relative h-20">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSavedPlace(p.id); show('Removed from saved', 'info'); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center press"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-semibold text-ink-900 truncate">{p.name}</div>
                    <div className="text-[10px] text-ink-500 flex items-center gap-1 mt-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {p.rating} · {p.category}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Media Parser */}
      <div className="px-5 mt-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-bold tracking-widest text-ink-500">IMPORT FROM SOCIAL</span>
        </div>
        <div className="bg-ink-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 py-1.5 text-xs font-semibold text-ink-700 border border-ink-100">
              <Play className="w-3 h-3 fill-black" /> TikTok
            </div>
            <div className="flex items-center gap-1.5 bg-white rounded-xl px-2.5 py-1.5 text-xs font-semibold text-ink-700 border border-ink-100">
              <Camera className="w-3 h-3" /> Instagram
            </div>
            <span className="text-xs text-ink-400">links supported</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-white rounded-xl px-3 py-2.5 flex items-center gap-2 border border-ink-100">
              <Link2 className="w-4 h-4 text-ink-400 shrink-0" />
              <input
                ref={socialInputRef}
                value={socialUrl} onChange={(e) => { setSocialUrl(e.target.value); setSocialResult(null); }}
                placeholder="Paste a TikTok or Instagram link…"
                className="flex-1 bg-transparent outline-none text-sm text-ink-800 placeholder:text-ink-400"
              />
              {socialUrl && <button onClick={() => { setSocialUrl(''); setSocialResult(null); }}><X className="w-3.5 h-3.5 text-ink-400" /></button>}
            </div>
            <button
              onClick={parseSocialLink}
              disabled={!socialUrl.trim() || socialParsing}
              className="shrink-0 h-10 px-4 rounded-xl bg-brand-500 disabled:bg-ink-300 text-white text-sm font-semibold press"
            >
              {socialParsing ? '…' : 'Parse'}
            </button>
          </div>
          <AnimatePresence>
            {socialParsing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                <div className="flex items-center gap-2 text-xs text-brand-600 font-semibold mb-2">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Sparkles className="w-3.5 h-3.5" />
                  </motion.div>
                  Extracting place information…
                </div>
                <div className="h-2 rounded shimmer w-3/4" />
              </motion.div>
            )}
            {socialResult && !socialParsing && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 bg-white rounded-xl border border-ink-100 overflow-hidden">
                <div className="flex items-start gap-3 p-3">
                  <img src={socialResult.image} alt={socialResult.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-full">From {socialResult.platform}</span>
                    <div className="font-semibold text-ink-900 text-sm truncate mt-1">{socialResult.name}</div>
                    <div className="text-xs text-ink-600 mt-0.5 line-clamp-2">{socialResult.desc}</div>
                    <div className="text-xs text-brand-600 font-semibold mt-1">{formatRp(socialResult.cost)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                  <button className="h-9 rounded-xl bg-ink-50 text-ink-800 text-xs font-semibold press flex items-center justify-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Add to Map
                  </button>
                  <button
                    onClick={() => { show(`${socialResult.name} added to itinerary`, 'success'); setSocialResult(null); setSocialUrl(''); }}
                    className="h-9 rounded-xl bg-brand-500 text-white text-xs font-semibold press flex items-center justify-center gap-1 shadow-glow"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Add to Itinerary
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Journey Planning Sheet ── */}
      <AnimatePresence>
        {planSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPlanSheet(false)} className="absolute inset-0 z-40 bg-ink-900/40" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-card pb-8"
            >
              <div className="w-12 h-1.5 bg-ink-100 rounded-full mx-auto mt-3" />
              <div className="px-5 pt-3 pb-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-ink-900 font-display flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-500" />
                    When are you heading out?
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    {planTarget === 'ai' ? 'AI will plan your journey' : 'You\'ll build it yourself'}
                  </div>
                </div>
                <button onClick={() => setPlanSheet(false)} className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center press"><X className="w-4 h-4" /></button>
              </div>

              <div className="px-5 space-y-4">
                {/* Date */}
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-ink-500 mb-2">START DATE</div>
                  <div className="flex gap-2">
                    {(['today', 'tomorrow'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setLocalDate(d)}
                        className={`flex-1 py-3 rounded-xl text-center press transition-colors ${localDate === d ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-700'}`}
                      >
                        <div className="text-sm font-bold capitalize">{d}</div>
                        <div className={`text-[10px] mt-0.5 ${localDate === d ? 'text-white/75' : 'text-ink-400'}`}>
                          {d === 'today' ? todayLabel : tomorrowLabel}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-ink-500 mb-2">
                    START TIME <span className="font-normal text-ink-400 normal-case tracking-normal">(optional)</span>
                  </div>
                  <select
                    value={localTime} onChange={(e) => setLocalTime(e.target.value)}
                    className="w-full bg-ink-50 rounded-xl px-4 py-3 text-sm font-semibold text-ink-900 outline-none appearance-none"
                  >
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-ink-500 mb-2">TRIP DURATION</div>
                  <div className="flex items-center justify-between bg-ink-50 rounded-xl px-4 py-3">
                    <span className="text-sm font-semibold text-ink-700">How many days?</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setLocalDays((d) => Math.max(1, d - 1))} className="w-8 h-8 rounded-full bg-white press flex items-center justify-center font-bold text-ink-700 shadow-soft">−</button>
                      <span className="font-extrabold text-ink-900 w-8 text-center font-display">{localDays}</span>
                      <button onClick={() => setLocalDays((d) => Math.min(7, d + 1))} className="w-8 h-8 rounded-full bg-white press flex items-center justify-center font-bold text-ink-700 shadow-soft">+</button>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {[1, 2, 3, 5, 7].map((d) => (
                      <button key={d} onClick={() => setLocalDays(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold press ${localDays === d ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-600'}`}>
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={confirmPlan}
                  className="w-full h-12 rounded-2xl bg-brand-500 text-white font-bold shadow-glow press flex items-center justify-center gap-2"
                >
                  {planTarget === 'ai' ? (
                    <><Sparkles className="w-4 h-4" /> Generate My Journey</>
                  ) : (
                    <><Pencil className="w-4 h-4" /> Start Building</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Place Detail Sheet ── */}
      <AnimatePresence>
        {detailPlace && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailPlace(null)} className="absolute inset-0 z-40 bg-ink-900/30" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-card overflow-y-auto max-h-[78%]"
            >
              <div className="relative h-40 shrink-0">
                <img src={detailPlace.image} alt={detailPlace.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button onClick={() => setDetailPlace(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center press">
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="font-bold text-white text-lg font-display leading-tight">{detailPlace.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/80 text-xs">{detailPlace.category}</span>
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-white">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {detailPlace.rating}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <InfoChip icon={<Clock className="w-3.5 h-3.5 text-brand-500" />} label="Hours" value={detailPlace.openingHours} />
                  <InfoChip
                    icon={<DollarSign className="w-3.5 h-3.5 text-emerald-500" />}
                    label="Price"
                    value={detailPlace.priceRange.min === detailPlace.priceRange.max
                      ? formatRp(detailPlace.priceRange.min)
                      : `${formatRp(detailPlace.priceRange.min)}+`}
                  />
                  <InfoChip icon={<MapPin className="w-3.5 h-3.5 text-orange-500" />} label="Distance" value={`${detailPlace.distanceKm} km`} />
                </div>
                <p className="text-sm text-ink-600 mb-3 leading-relaxed">{detailPlace.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {detailPlace.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-ink-50 text-ink-600 text-xs font-medium">{tag}</span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { isSaved(detailPlace.id) ? removeSavedPlace(detailPlace.id) : savePlace(detailPlace); show(isSaved(detailPlace.id) ? 'Removed from saved' : 'Saved ✓', 'success'); }}
                    className={`h-11 rounded-2xl font-semibold press inline-flex items-center justify-center gap-2 ${isSaved(detailPlace.id) ? 'bg-brand-50 text-brand-600 border border-brand-200' : 'bg-ink-50 text-ink-800'}`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved(detailPlace.id) ? 'fill-brand-500 text-brand-500' : ''}`} />
                    {isSaved(detailPlace.id) ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setDetailPlace(null); nav('/map'); }}
                    className="h-11 rounded-2xl bg-brand-500 text-white font-semibold shadow-glow press inline-flex items-center justify-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4" /> View on Map
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter Sheet */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilterOpen(false)} className="absolute inset-0 z-40 bg-ink-900/40" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-card pb-8"
            >
              <div className="w-12 h-1.5 bg-ink-100 rounded-full mx-auto mt-3" />
              <div className="px-5 pt-3 pb-4 flex items-center justify-between">
                <div className="font-bold text-ink-900 font-display">Filter Places</div>
                <button onClick={() => setFilterOpen(false)} className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center press"><X className="w-4 h-4" /></button>
              </div>
              <div className="px-5 space-y-5">
                <div>
                  <div className="text-xs font-bold tracking-widest text-ink-500 mb-2">CATEGORY</div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const active = filterCats.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => setFilterCats((prev) => active ? prev.filter((c) => c !== cat) : [...prev, cat])}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold press transition-colors ${active ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-700'}`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest text-ink-500 mb-2">MINIMUM RATING</div>
                  <div className="flex gap-2">
                    {[0, 4.0, 4.3, 4.5, 4.7].map((r) => (
                      <button
                        key={r}
                        onClick={() => setFilterMinRating(r)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold press transition-colors ${filterMinRating === r ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-700'}`}
                      >
                        {r === 0 ? 'All' : `⭐ ${r}+`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setFilterCats([]); setFilterMinRating(0); }} className="h-11 rounded-2xl bg-ink-50 text-ink-700 font-semibold press">Clear All</button>
                  <button onClick={() => { setFilterOpen(false); if (search.trim()) show(`Filters applied (${activeFilters})`, 'success'); }} className="h-11 rounded-2xl bg-brand-500 text-white font-bold shadow-glow press">
                    Apply{activeFilters > 0 ? ` (${activeFilters})` : ''}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-ink-50 rounded-xl p-2.5">
      <div className="flex items-center gap-1 mb-1">{icon}<span className="text-[10px] text-ink-500 font-medium">{label}</span></div>
      <div className="text-xs font-bold text-ink-900 leading-snug">{value}</div>
    </div>
  );
}
