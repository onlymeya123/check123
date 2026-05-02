import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronDown, Crosshair, List, Navigation, X, MapPin, Plus, Smile, Clock, Star, DollarSign, Tag, ChevronDown as ChevDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { formatRp } from '../lib/format';
import { useToast } from '../components/Toast';
import type { Place } from '../data/places';
import { getNearbyDeals, getDealsForPlace } from '../data/deals';
import { getCulturalIntel } from '../data/cultural';

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
          <div className="text-xs text-ink-500">Day 1 · Ubud, Bali · {itinerary.length} stops</div>
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

          <div className="absolute right-3 top-3 flex flex-col gap-2 z-20">
            <button onClick={() => show('Recentered on you', 'info')} className="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center press">
              <Crosshair className="w-4.5 h-4.5 text-ink-700" />
            </button>
            <button onClick={startNavigation} className="w-10 h-10 rounded-full bg-brand-500 shadow-glow flex items-center justify-center press">
              <Navigation className="w-4.5 h-4.5 text-white" />
            </button>
          </div>

          <ItineraryBottomSheet itinerary={itinerary} totals={totals} onStart={startNavigation} onReorderUp={(i) => reorderStop(i, Math.max(0, i - 1))} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pb-40 no-scrollbar">
          <ListView itinerary={itinerary} onStart={startNavigation} totals={totals} onPin={setSelected} />
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <PlaceCard
            place={selected}
            index={itinerary.findIndex((p) => p.id === selected.id)}
            prevPlace={itinerary[itinerary.findIndex((p) => p.id === selected.id) - 1]}
            onClose={() => setSelected(null)}
            onNavigate={() => { setSelected(null); startNavigation(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- MAP STAGE ----------------- */

function MapStage({ itinerary, onPin }: { itinerary: Place[]; onPin: (p: Place) => void }) {
  const positions = [
    { x: 70, y: 18 }, { x: 60, y: 38 }, { x: 48, y: 58 }, { x: 64, y: 75 }, { x: 30, y: 82 },
  ];
  const dealPositions = [
    { x: 22, y: 30 }, { x: 44, y: 42 }, { x: 80, y: 50 }, { x: 36, y: 72 }, { x: 58, y: 85 },
  ];
  const pts = itinerary.map((_, i) => positions[i % positions.length]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const nearbyDeals = getNearbyDeals().slice(0, 5);

  return (
    <div className="absolute inset-0 map-bg">
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#C7D2FE" strokeWidth="0.05" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#C7D2FE" strokeWidth="0.05" />
        ))}
      </svg>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M -5 30 Q 30 35, 60 25 T 110 30" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
        <path d="M -5 60 Q 30 55, 60 65 T 110 60" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        <path d="M 30 -5 Q 36 40, 30 60 T 36 110" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        <path d="M 70 -5 Q 64 40, 72 60 T 70 110" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
      </svg>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d={path} fill="none" stroke="#3B5BFF" strokeWidth="0.9" strokeLinecap="round"
          strokeDasharray="2 1.4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      {/* Current location pulse */}
      <div className="absolute" style={{ left: '24%', top: '70%' }}>
        <div className="relative">
          <span className="absolute -inset-3 rounded-full bg-brand-500/30 animate-pulseDot" />
          <span className="block w-4 h-4 rounded-full bg-brand-500 ring-4 ring-white shadow" />
        </div>
      </div>

      {/* Deal pins — yellow */}
      {nearbyDeals.map((deal, i) => {
        const pos = dealPositions[i % dealPositions.length];
        return (
          <motion.div
            key={deal.id}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.07, type: 'spring', stiffness: 380, damping: 18 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className="flex items-center gap-1 bg-amber-400 text-white rounded-full px-2 py-0.5 shadow-card text-[10px] font-bold whitespace-nowrap">
              <Tag className="w-2.5 h-2.5" />
              {deal.discount}
            </div>
            <div className="w-2 h-2 bg-amber-400 rotate-45 mx-auto -mt-0.5" />
          </motion.div>
        );
      })}

      {/* Itinerary pins */}
      {itinerary.map((p, i) => {
        const pos = pts[i];
        return (
          <motion.button
            key={p.id} onClick={() => onPin(p)}
            initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 400, damping: 18 }}
            whileTap={{ scale: 0.92 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 press z-20"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center ring-4 ring-white shadow-card">{i + 1}</div>
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

function ItineraryBottomSheet({ itinerary, totals, onStart }: {
  itinerary: Place[]; totals: { cost: number; time: number; dist: number }; onStart: () => void; onReorderUp?: (i: number) => void;
}) {
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
              <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
              <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 truncate text-sm">{p.name}</div>
                <div className="flex items-center gap-1.5 text-[10px] text-ink-500">
                  <Clock className="w-3 h-3 text-brand-500" />
                  <span className="text-brand-600 font-semibold">{nineColon(i)}</span>
                  <span className="text-ink-300">·</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{p.rating}
                </div>
                <div className="text-[10px] text-ink-400 mt-0.5">{p.openingHours}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-brand-600 font-semibold">{formatRp(p.priceRange.min)}</div>
                {p.priceRange.max !== p.priceRange.min && (
                  <div className="text-[10px] text-ink-400">– {formatRp(p.priceRange.max)}</div>
                )}
              </div>
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

function ListView({ itinerary, onStart, totals, onPin }: {
  itinerary: Place[]; onStart: () => void; totals: { cost: number; time: number; dist: number }; onPin: (p: Place) => void;
}) {
  return (
    <div className="pt-2">
      <div className="grid grid-cols-3 bg-ink-50 rounded-2xl p-3 mb-4">
        <Block label="Time" value={`${Math.floor(totals.time / 60)}h ${totals.time % 60}m`} />
        <Block label="Distance" value={`${totals.dist.toFixed(1)} km`} />
        <Block label="Cost" value={formatRp(totals.cost)} />
      </div>
      <div className="space-y-4">
        {itinerary.map((p, i) => {
          const deals = getDealsForPlace(p.id);
          return (
            <div key={p.id}>
              {i > 0 && (
                <div className="flex items-center gap-2 py-1 px-2">
                  <div className="flex-1 h-px bg-ink-100" />
                  <span className="text-[10px] text-ink-400 font-medium shrink-0">
                    📍 {p.distanceKm} km · ~{Math.round(p.distanceKm * 3)} min drive
                  </span>
                  <div className="flex-1 h-px bg-ink-100" />
                </div>
              )}
              <button
                onClick={() => onPin(p)}
                className="w-full rounded-2xl border border-ink-100 overflow-hidden press hover:border-brand-200 transition-colors text-left"
              >
                <div className="relative h-28">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
                    {i + 1}
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                    <div>
                      <div className="text-white font-bold text-sm leading-tight">{p.name}</div>
                      <div className="text-white/80 text-xs">{p.category}</div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-white text-xs font-semibold">{p.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-ink-600">
                      <Clock className="w-3.5 h-3.5 text-ink-400" />
                      <span>{p.openingHours}</span>
                    </div>
                    <div className="flex items-center gap-1 text-ink-600">
                      <DollarSign className="w-3.5 h-3.5 text-ink-400" />
                      <span>
                        {formatRp(p.priceRange.min)}{p.priceRange.max !== p.priceRange.min ? ` – ${formatRp(p.priceRange.max)}` : ''}
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-brand-600 font-semibold">
                      {nineColon(i)} – {nineColon(i, p.durationMin)}
                    </div>
                  </div>
                  <div className="text-xs text-ink-500 mt-1.5 line-clamp-2">{p.description}</div>
                </div>
                {deals.length > 0 && (
                  <div className="border-t border-amber-100 bg-amber-50 px-3 py-2 flex items-center gap-2">
                    <Tag className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="text-xs text-amber-700 font-semibold">{deals[0].title}</span>
                    <span className="ml-auto text-[10px] text-amber-600 font-bold bg-amber-100 rounded-full px-2 py-0.5">{deals[0].discount}</span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
      <button onClick={onStart} className="mt-5 w-full h-12 bg-brand-500 text-white font-bold rounded-2xl shadow-glow press flex items-center justify-center gap-2">
        <Navigation className="w-4 h-4" /> Start Navigation
      </button>
    </div>
  );
}

/* ----------------- PLACE CARD ----------------- */

function PlaceCard({ place, index, prevPlace, onClose, onNavigate }: {
  place: Place; index: number; prevPlace?: Place; onClose: () => void; onNavigate: () => void;
}) {
  const [culturalExpanded, setCulturalExpanded] = useState(false);
  const intel = getCulturalIntel(place.id, place.category);
  const deals = getDealsForPlace(place.id);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-30 bg-ink-900/30" />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute inset-x-0 bottom-0 z-40 bg-white rounded-t-3xl shadow-card overflow-y-auto max-h-[80%]"
      >
        {/* Hero image */}
        <div className="relative h-40 shrink-0">
          <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center press">
            <X className="w-4 h-4 text-white" />
          </button>
          {index >= 0 && (
            <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center ring-2 ring-white">
              {index + 1}
            </div>
          )}
          <div className="absolute bottom-3 left-4 right-4">
            <div className="font-bold text-white text-lg font-display leading-tight">{place.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white/80 text-xs">{place.category}</span>
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-white">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {place.rating}
              </span>
              {index >= 0 && (
                <span className="flex items-center gap-1 bg-brand-500/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-white font-semibold">
                  <Clock className="w-3 h-3" /> {nineColon(index)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Key info row */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <InfoBlock
              icon={<Clock className="w-3.5 h-3.5 text-brand-500" />}
              label="Hours"
              value={place.openingHours}
            />
            <InfoBlock
              icon={<DollarSign className="w-3.5 h-3.5 text-emerald-500" />}
              label="Price Range"
              value={place.priceRange.min === place.priceRange.max
                ? formatRp(place.priceRange.min)
                : `${formatRp(place.priceRange.min)} – ${formatRp(place.priceRange.max)}`}
            />
            <InfoBlock
              icon={<MapPin className="w-3.5 h-3.5 text-orange-500" />}
              label={prevPlace ? 'From prev' : 'Distance'}
              value={`${place.distanceKm} km`}
              sub={prevPlace ? `from ${prevPlace.name.split(' ')[0]}` : undefined}
            />
          </div>

          {/* Deal badge */}
          {deals.length > 0 && (
            <div className="mb-3 flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-100">
              <Tag className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-amber-700">{deals[0].title}</div>
                <div className="text-[10px] text-amber-600">{deals[0].validUntil} · Save {formatRp(deals[0].savingsAmount)}</div>
              </div>
              <span className="text-xs font-extrabold text-amber-700 bg-amber-200 rounded-full px-2 py-0.5 shrink-0">{deals[0].discount}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-ink-600 mb-3 leading-relaxed">{place.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {place.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-ink-50 text-ink-600 text-xs font-medium">{tag}</span>
            ))}
            <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium">{place.durationMin} min visit</span>
          </div>

          {/* Cultural Intel */}
          {intel && (
            <div className="mb-3 rounded-xl border overflow-hidden" style={{ borderColor: intel.accentColor + '40' }}>
              <button
                onClick={() => setCulturalExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                style={{ background: intel.accentColor + '12' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{intel.tips[0].icon}</span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: intel.accentColor }}>{intel.prompt}</div>
                    <div className="text-[10px] text-ink-500">{intel.tips.length} tip{intel.tips.length > 1 ? 's' : ''} · tap to {culturalExpanded ? 'collapse' : 'expand'}</div>
                  </div>
                </div>
                <motion.div animate={{ rotate: culturalExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevDown className="w-4 h-4 text-ink-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {culturalExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-2 space-y-2">
                      {intel.tips.map((tip, i) => (
                        <div key={i} className="flex gap-2.5">
                          <span className="text-base shrink-0 leading-none mt-0.5">{tip.icon}</span>
                          <div>
                            <div className="text-xs font-semibold text-ink-900">{tip.title}</div>
                            <div className="text-[11px] text-ink-500 leading-snug mt-0.5">{tip.body}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button className="h-11 rounded-2xl bg-ink-50 text-ink-800 font-semibold press inline-flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Save
            </button>
            <button onClick={onNavigate} className="h-11 rounded-2xl bg-brand-500 text-white font-semibold shadow-glow press inline-flex items-center justify-center gap-2">
              <Navigation className="w-4 h-4" /> Navigate
            </button>
          </div>
          <button className="mt-2.5 w-full h-10 rounded-2xl bg-brand-50 text-brand-700 font-semibold inline-flex items-center justify-center gap-2 press">
            <Smile className="w-4 h-4" /> Ask Buddy about this
          </button>
        </div>
      </motion.div>
    </>
  );
}

function InfoBlock({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-ink-50 rounded-xl p-2.5">
      <div className="flex items-center gap-1 mb-1">{icon}<span className="text-[10px] text-ink-500 font-medium">{label}</span></div>
      <div className="text-xs font-bold text-ink-900 leading-snug">{value}</div>
      {sub && <div className="text-[10px] text-ink-400 mt-0.5">{sub}</div>}
    </div>
  );
}
