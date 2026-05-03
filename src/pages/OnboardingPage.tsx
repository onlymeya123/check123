import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, ChevronRight, ChevronLeft, Calendar, DollarSign } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatRp } from '../lib/format';
import type { Vibe } from '../data/places';

const VIBES: { id: Vibe; label: string; icon: string; desc: string; color: string; bg: string }[] = [
  { id: 'chill', label: 'Chill', icon: '🌴', desc: 'Laid-back cafes & beaches', color: '#10B981', bg: '#ECFDF5' },
  { id: 'chaos', label: 'Chaos', icon: '🔥', desc: 'Street food & hidden spots', color: '#F97316', bg: '#FFF7ED' },
  { id: 'zen', label: 'Zen', icon: '🧘', desc: 'Temples & mindful spaces', color: '#3B5BFF', bg: '#EEF2FF' },
  { id: 'luxury', label: 'Luxury', icon: '💎', desc: 'Fine dining & rooftops', color: '#A855F7', bg: '#F5F3FF' },
];

export default function OnboardingPage() {
  const nav = useNavigate();
  const { setVibe, setBudget, setIsOnboarded, setJourneyStart, setDestination } = useApp();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [localVibe, setLocalVibe] = useState<Vibe>('zen');
  const [localBudget, setLocalBudget] = useState(300_000);
  const [localDestination, setLocalDestination] = useState('Ubud, Bali');
  const [localStartDate, setLocalStartDate] = useState<Date | null>(null);
  const [localEndDate, setLocalEndDate] = useState<Date | null>(null);
  const [calPhase, setCalPhase] = useState<'start' | 'end'>('start');

  const localDays = useMemo(() => {
    if (!localStartDate || !localEndDate) return 1;
    return Math.max(1, Math.round((localEndDate.getTime() - localStartDate.getTime()) / 86400000) + 1);
  }, [localStartDate, localEndDate]);

  const sliderPct = useMemo(() => {
    const min = 50_000, max = 1_000_000;
    return Math.max(0, Math.min(100, ((localBudget - min) / (max - min)) * 100));
  }, [localBudget]);

  const goNext = () => { setDir(1); setStep((s) => s + 1); };
  const goBack = () => { setDir(-1); setStep((s) => s - 1); };

  const handleVibePick = (v: Vibe) => {
    setLocalVibe(v);
    setTimeout(goNext, 200);
  };

  const handleCalSelect = (d: Date) => {
    if (calPhase === 'start') {
      setLocalStartDate(d);
      setLocalEndDate(null);
      setCalPhase('end');
    } else {
      if (localStartDate && d < localStartDate) {
        setLocalStartDate(d);
        setLocalEndDate(null);
      } else {
        setLocalEndDate(d);
      }
    }
  };

  const handleFinish = (mode: 'ai' | 'manual') => {
    setVibe(localVibe);
    setBudget(localBudget);
    setDestination(localDestination);
    const dateStr = localStartDate
      ? `${localStartDate.getFullYear()}-${String(localStartDate.getMonth() + 1).padStart(2, '0')}-${String(localStartDate.getDate()).padStart(2, '0')}`
      : 'today';
    setJourneyStart({ date: dateStr, time: '09:00', days: localDays });
    setIsOnboarded(true);
    nav(mode === 'ai' ? '/generate' : '/generate?mode=manual');
  };

  return (
    <div className="absolute inset-0 bg-white overflow-hidden flex flex-col">
      {/* Progress + back */}
      {step > 0 && (
        <div className="shrink-0 px-5 pt-12 pb-2 flex items-center gap-3">
          <button onClick={goBack} className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center press shrink-0">
            <ChevronLeft className="w-4 h-4 text-ink-700" />
          </button>
          <div className="flex-1 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${step >= s ? 'bg-brand-500' : 'bg-ink-100'}`} />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 32 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="absolute inset-0 overflow-y-auto no-scrollbar"
          >
            {step === 0 && <WelcomeStep onNext={goNext} />}
            {step === 1 && <VibeStep selected={localVibe} onPick={handleVibePick} />}
            {step === 2 && (
              <DetailsStep
                destination={localDestination} setDestination={setLocalDestination}
                budget={localBudget} setBudget={setLocalBudget}
                sliderPct={sliderPct}
                startDate={localStartDate} endDate={localEndDate}
                calPhase={calPhase} days={localDays}
                onCalSelect={handleCalSelect}
                onResetCal={() => { setCalPhase('start'); setLocalStartDate(null); setLocalEndDate(null); }}
                onNext={goNext}
              />
            )}
            {step === 3 && (
              <ReadyStep
                vibe={localVibe} budget={localBudget}
                destination={localDestination} days={localDays}
                onFinish={handleFinish}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] px-6 text-center">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}>
        <div className="w-20 h-20 rounded-3xl bg-brand-500 flex items-center justify-center mx-auto mb-6 shadow-glow">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h1 className="text-3xl font-extrabold text-ink-900 font-display leading-tight">Plan your perfect trip</h1>
        <p className="text-ink-500 mt-3 text-sm leading-relaxed max-w-[260px] mx-auto">
          Tell us your style, destination, and budget — we'll build the ideal itinerary.
        </p>
      </motion.div>
      <motion.button
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="mt-10 w-full max-w-[280px] h-14 rounded-2xl bg-brand-500 text-white font-bold text-base shadow-glow press flex items-center justify-center gap-2"
      >
        Get started <ChevronRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

function VibeStep({ selected, onPick }: { selected: Vibe; onPick: (v: Vibe) => void }) {
  return (
    <div className="px-5 pt-8 pb-8">
      <h2 className="text-2xl font-extrabold text-ink-900 font-display leading-tight mb-1">What's your travel style?</h2>
      <p className="text-sm text-ink-500 mb-6">Tap to select — you can change it later</p>
      <div className="space-y-3">
        {VIBES.map((v, i) => (
          <motion.button
            key={v.id}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPick(v.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 press transition-all ${selected === v.id ? 'shadow-glow' : 'border-ink-100 bg-white'}`}
            style={selected === v.id ? { background: v.bg, borderColor: v.color } : {}}
          >
            <div className="text-3xl w-12 text-center">{v.icon}</div>
            <div className="flex-1 text-left">
              <div className="font-bold text-ink-900 text-base">{v.label}</div>
              <div className="text-sm text-ink-500 mt-0.5">{v.desc}</div>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: selected === v.id ? v.color : '#D1D5DB' }} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function DetailsStep({
  destination, setDestination,
  budget, setBudget, sliderPct,
  startDate, endDate, calPhase, days,
  onCalSelect, onResetCal, onNext,
}: {
  destination: string; setDestination: (s: string) => void;
  budget: number; setBudget: (n: number) => void; sliderPct: number;
  startDate: Date | null; endDate: Date | null;
  calPhase: 'start' | 'end'; days: number;
  onCalSelect: (d: Date) => void; onResetCal: () => void; onNext: () => void;
}) {
  return (
    <div className="px-5 pt-8 pb-10 space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-ink-900 font-display leading-tight mb-1">Where are you going?</h2>
        <p className="text-sm text-ink-500">Set your destination, dates, and budget</p>
      </div>

      {/* Destination */}
      <div>
        <div className="text-xs font-bold tracking-widest text-ink-500 mb-2">DESTINATION</div>
        <div className="flex items-center gap-3 bg-ink-50 rounded-2xl px-4 py-3">
          <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Ubud, Bali"
            className="flex-1 bg-transparent text-sm font-semibold text-ink-900 outline-none placeholder:text-ink-400"
          />
        </div>
      </div>

      {/* Dates */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold tracking-widest text-ink-500">
            {calPhase === 'start' ? 'SELECT START DATE' : 'SELECT END DATE'}
          </div>
          {startDate && (
            <button onClick={onResetCal} className="text-[10px] text-brand-500 font-semibold press">Reset</button>
          )}
        </div>
        {(startDate || endDate) && (
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex-1 py-2 px-3 rounded-xl text-center text-xs font-semibold border-2 ${calPhase === 'start' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 bg-ink-50 text-ink-700'}`}>
              <div className="text-[10px] text-ink-400">Start</div>
              <div>{startDate ? startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '—'}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-400 shrink-0" />
            <div className={`flex-1 py-2 px-3 rounded-xl text-center text-xs font-semibold border-2 ${calPhase === 'end' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 bg-ink-50 text-ink-700'}`}>
              <div className="text-[10px] text-ink-400">End</div>
              <div>{endDate ? endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '—'}</div>
            </div>
            {startDate && endDate && (
              <div className="bg-brand-50 rounded-xl px-3 py-2 text-center text-xs font-bold text-brand-600 border-2 border-brand-100 shrink-0">{days}d</div>
            )}
          </div>
        )}
        <OnboardCalendar startDate={startDate} endDate={endDate} onSelect={onCalSelect} />
      </div>

      {/* Budget */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-brand-500" />
          <div className="font-bold text-ink-900 font-display">Budget <span className="text-ink-400 font-normal text-sm">(per stop)</span></div>
        </div>
        <input
          type="range" min={50_000} max={1_000_000} step={10_000}
          value={budget} onChange={(e) => setBudget(Number(e.target.value))}
          className="vibe-slider mb-1"
          style={{ ['--val' as any]: `${sliderPct}%` }}
        />
        <div className="flex justify-between text-xs text-ink-500">
          <span>{formatRp(50_000)}</span>
          <span className="text-brand-600 font-semibold">{formatRp(budget)}</span>
          <span>{formatRp(1_000_000)}+</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full h-12 rounded-2xl bg-brand-500 text-white font-bold shadow-glow press flex items-center justify-center gap-2"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ReadyStep({
  vibe, budget, destination, days, onFinish,
}: {
  vibe: Vibe; budget: number; destination: string; days: number;
  onFinish: (mode: 'ai' | 'manual') => void;
}) {
  const vibeInfo = VIBES.find((v) => v.id === vibe)!;
  return (
    <div className="px-5 pt-8 pb-10 flex flex-col min-h-[500px]">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-ink-900 font-display leading-tight mb-1">You're all set! 🎉</h2>
        <p className="text-sm text-ink-500">Here's your trip summary</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 mb-6"
        style={{ background: vibeInfo.bg, border: `2px solid ${vibeInfo.color}40` }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">{vibeInfo.icon}</div>
          <div>
            <div className="font-bold text-ink-900 text-lg font-display">{vibeInfo.label} Trip</div>
            <div className="text-sm text-ink-500">{vibeInfo.desc}</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 shrink-0" style={{ color: vibeInfo.color }} />
            <span className="font-semibold text-ink-900">{destination || 'Destination TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 shrink-0" style={{ color: vibeInfo.color }} />
            <span className="font-semibold text-ink-900">{days} day{days !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 shrink-0" style={{ color: vibeInfo.color }} />
            <span className="font-semibold text-ink-900">{formatRp(budget)} per stop</span>
          </div>
        </div>
      </motion.div>

      <div className="space-y-3 mt-auto">
        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onFinish('ai')}
          className="w-full h-14 rounded-2xl bg-brand-500 text-white font-bold text-base shadow-glow press flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" /> Generate My Itinerary
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onFinish('manual')}
          className="w-full h-12 rounded-2xl bg-white border-2 border-ink-200 text-ink-700 font-semibold press flex items-center justify-center gap-2"
        >
          I'll plan it myself
        </motion.button>
      </div>
    </div>
  );
}

function OnboardCalendar({ startDate, endDate, onSelect }: { startDate: Date | null; endDate: Date | null; onSelect: (d: Date) => void }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1); };

  return (
    <div className="bg-ink-50 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-white flex items-center justify-center press shadow-soft">
          <ChevronLeft className="w-4 h-4 text-ink-700" />
        </button>
        <span className="text-sm font-bold text-ink-900">{monthLabel}</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-white flex items-center justify-center press shadow-soft">
          <ChevronRight className="w-4 h-4 text-ink-700" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-ink-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isStart = startDate ? isSameDay(d, startDate) : false;
          const isEnd = endDate ? isSameDay(d, endDate) : false;
          const inRange = startDate && endDate ? d > startDate && d < endDate : false;
          const isPast = d < today;
          const isToday = isSameDay(d, today);
          return (
            <button
              key={i}
              onClick={() => !isPast && onSelect(d)}
              disabled={isPast}
              className={[
                'relative aspect-square flex items-center justify-center text-[11px] font-semibold transition-colors',
                isStart || isEnd ? 'bg-brand-500 text-white rounded-full' : '',
                inRange ? 'bg-brand-100 text-brand-700 rounded-none' : '',
                !isStart && !isEnd && !inRange && !isPast ? `rounded-full hover:bg-ink-200 ${isToday ? 'ring-1 ring-brand-400' : ''}` : '',
                isPast ? 'text-ink-300 cursor-default' : 'text-ink-800',
              ].filter(Boolean).join(' ')}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
