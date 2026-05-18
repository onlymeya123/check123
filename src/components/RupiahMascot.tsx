import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * RupiahMascot
 * ----------------------------------------------------------------------------
 * An animated illustration of an Indonesian Rupiah banknote that "talks" to
 * the user. The character bobs, blinks, waves, and speaks the Indonesian
 * phrase "Halo aku rupiah, jaga aku ya" via the Web Speech API (id-ID),
 * with a typed-on speech bubble, a synced mouth animation, and a coin /
 * sparkle cloud around it.
 *
 * Designed to be drop-in for the IDR wallet section. Tap the mascot to
 * replay the line.
 */

const PHRASE = 'Halo aku rupiah, jaga aku ya';

// Speech bubble timing (ms per character) — tuned to feel like natural cadence.
const TYPE_PER_CHAR = 38;
// Mouth chatter cycle (ms) — visemes flap roughly twice per syllable.
const MOUTH_CYCLE = 130;

interface Props {
  /** Auto-play speech the first time the mascot mounts in viewport. */
  autoSpeak?: boolean;
  /** Optional override phrase. */
  phrase?: string;
  className?: string;
}

export default function RupiahMascot({ autoSpeak = true, phrase = PHRASE, className = '' }: Props) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [typed, setTyped] = useState('');
  const [mouthOpen, setMouthOpen] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const typeTimer = useRef<number | null>(null);
  const mouthTimer = useRef<number | null>(null);

  // Cleanup any running timers / speech on unmount.
  useEffect(() => {
    return () => {
      if (typeTimer.current) window.clearInterval(typeTimer.current);
      if (mouthTimer.current) window.clearInterval(mouthTimer.current);
      try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeTimer.current) { window.clearInterval(typeTimer.current); typeTimer.current = null; }
    if (mouthTimer.current) { window.clearInterval(mouthTimer.current); mouthTimer.current = null; }
    try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    setMouthOpen(false);
    setActive(false);
  }, []);

  const speak = useCallback(() => {
    // Restart cleanly if already speaking.
    stop();
    setActive(true);
    setTyped('');

    // Type-on bubble
    let i = 0;
    typeTimer.current = window.setInterval(() => {
      i++;
      setTyped(phrase.slice(0, i));
      if (i >= phrase.length) {
        if (typeTimer.current) window.clearInterval(typeTimer.current);
        typeTimer.current = null;
      }
    }, TYPE_PER_CHAR);

    // Mouth chatter
    mouthTimer.current = window.setInterval(() => {
      setMouthOpen((m) => !m);
    }, MOUTH_CYCLE);

    // Voice (Web Speech API). Best-effort: pick an Indonesian voice if available.
    try {
      const synth = window.speechSynthesis;
      if (synth) {
        const u = new SpeechSynthesisUtterance(phrase);
        u.lang = 'id-ID';
        u.rate = 0.96;
        u.pitch = 1.15;
        const voices = synth.getVoices();
        const idVoice = voices.find((v) => v.lang?.toLowerCase().startsWith('id'));
        if (idVoice) u.voice = idVoice;
        u.onend = () => {
          if (mouthTimer.current) {
            window.clearInterval(mouthTimer.current);
            mouthTimer.current = null;
          }
          setMouthOpen(false);
        };
        utterRef.current = u;
        synth.speak(u);
      }
    } catch {
      /* speech unavailable — silent fallback (animation still plays) */
    }

    // Hard stop after the line + a beat (in case the speech engine is silent or slow).
    const total = phrase.length * TYPE_PER_CHAR + 1800;
    window.setTimeout(() => {
      if (mouthTimer.current) {
        window.clearInterval(mouthTimer.current);
        mouthTimer.current = null;
      }
      setMouthOpen(false);
    }, total);
  }, [phrase, stop]);

  // Auto-speak once on mount. Some browsers won't allow speech without a
  // user gesture — that's fine; the visual animation runs regardless and
  // tapping the mascot will retrigger with audio.
  useEffect(() => {
    if (!autoSpeak) return;
    // Wait a beat so voices list has time to populate, and the user sees the
    // mascot bob in before he greets them.
    const t = window.setTimeout(() => speak(), 650);
    return () => window.clearTimeout(t);
  }, [autoSpeak, speak]);

  // Pre-warm voice list (Chrome populates it asynchronously).
  useEffect(() => {
    try {
      window.speechSynthesis?.getVoices();
    } catch { /* noop */ }
  }, []);

  const blinkSchedule = useMemo(() => ({
    duration: 0.18,
    repeat: Infinity,
    repeatDelay: 2.6,
    ease: 'easeInOut' as const,
  }), []);

  return (
    <div className={`relative select-none ${className}`}>
      {/* Sparkles / floating coins */}
      <Sparkles reduce={!!reduceMotion} />

      {/* Speech bubble */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10
                       max-w-[230px] w-max bg-white rounded-2xl px-3.5 py-2.5
                       shadow-[0_12px_32px_-12px_rgba(20,30,80,0.25)]
                       border border-ink-100"
          >
            <div className="text-[13px] leading-snug font-semibold text-ink-900">
              {typed || '\u00A0'}
              <motion.span
                aria-hidden
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-[2px] h-[1em] -mb-[2px] ml-[2px] bg-brand-500 align-middle"
              />
            </div>
            {/* tail */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-r border-b border-ink-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The note itself */}
      <motion.button
        type="button"
        onClick={speak}
        aria-label="Putar ulang sapaan Rupiah"
        animate={reduceMotion ? undefined : { y: [0, -5, 0], rotate: [-2, 2, -2] }}
        transition={reduceMotion ? undefined : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        whileTap={{ scale: 0.96 }}
        className="relative block focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-300/50 rounded-2xl"
      >
        <BanknoteSVG mouthOpen={mouthOpen} active={active} reduce={!!reduceMotion} blinkSchedule={blinkSchedule} />
      </motion.button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Banknote SVG character                                                      */
/* -------------------------------------------------------------------------- */

interface NoteProps {
  mouthOpen: boolean;
  active: boolean;
  reduce: boolean;
  blinkSchedule: { duration: number; repeat: number; repeatDelay: number; ease: 'easeInOut' };
}

function BanknoteSVG({ mouthOpen, active, reduce, blinkSchedule }: NoteProps) {
  // viewBox: 240 x 140
  return (
    <svg
      width="220"
      height="128"
      viewBox="0 0 240 140"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_18px_20px_rgba(180,30,60,0.25)]"
    >
      <defs>
        <linearGradient id="rp-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF5C7A" />
          <stop offset="55%" stopColor="#E63956" />
          <stop offset="100%" stopColor="#B81E3D" />
        </linearGradient>
        <linearGradient id="rp-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD9DF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFD9DF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="rp-cheek" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FF8DA0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FF8DA0" stopOpacity="0" />
        </radialGradient>
        <pattern id="rp-stripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="transparent" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="2" />
        </pattern>
      </defs>

      {/* Left arm — waves while speaking */}
      <motion.g
        style={{ transformOrigin: '32px 92px' }}
        animate={
          reduce
            ? undefined
            : active
              ? { rotate: [-15, 25, -10, 20, -15] }
              : { rotate: [-8, 6, -8] }
        }
        transition={
          reduce
            ? undefined
            : active
              ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <path d="M28 78 Q14 84 18 102" stroke="#B81E3D" strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="18" cy="103" r="8" fill="#FFD9C4" stroke="#B81E3D" strokeWidth="2" />
      </motion.g>

      {/* Right arm — small idle sway */}
      <motion.g
        style={{ transformOrigin: '208px 92px' }}
        animate={reduce ? undefined : { rotate: [6, -10, 6] }}
        transition={reduce ? undefined : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M212 78 Q226 84 222 102" stroke="#B81E3D" strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="222" cy="103" r="8" fill="#FFD9C4" stroke="#B81E3D" strokeWidth="2" />
      </motion.g>

      {/* Banknote body */}
      <g>
        {/* Drop / inner shadow base */}
        <rect x="22" y="22" width="196" height="100" rx="14" fill="#7C1330" />
        {/* Main note */}
        <rect x="20" y="20" width="196" height="100" rx="14" fill="url(#rp-body)" />
        {/* Stripe pattern overlay */}
        <rect x="20" y="20" width="196" height="100" rx="14" fill="url(#rp-stripes)" />
        {/* Top sheen */}
        <rect x="20" y="20" width="196" height="46" rx="14" fill="url(#rp-edge)" />
        {/* Inner border */}
        <rect x="28" y="28" width="180" height="84" rx="10" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="2 4" />

        {/* Corner denominations */}
        <g fontFamily="'Satoshi','Plus Jakarta Sans',sans-serif" fontWeight="900" fill="#FFE7CB">
          <text x="36" y="46" fontSize="13" letterSpacing="0.5">100.000</text>
          <text x="200" y="106" fontSize="13" letterSpacing="0.5" textAnchor="end">100.000</text>
        </g>

        {/* Corner Rp glyphs */}
        <g fontFamily="'Satoshi','Plus Jakarta Sans',sans-serif" fontWeight="900" fill="#ffffff" opacity="0.9">
          <text x="200" y="46" fontSize="14" letterSpacing="1" textAnchor="end">Rp</text>
          <text x="36" y="106" fontSize="14" letterSpacing="1">Rp</text>
        </g>

        {/* "RUPIAH" label */}
        <text
          x="120"
          y="112"
          fontFamily="'Satoshi','Plus Jakarta Sans',sans-serif"
          fontWeight="900"
          fontSize="9"
          fill="#ffffff"
          opacity="0.85"
          letterSpacing="3"
          textAnchor="middle"
        >
          RUPIAH · BANK INDONESIA
        </text>

        {/* Decorative seal — left */}
        <g transform="translate(48 70)">
          <circle r="14" fill="none" stroke="#FFE7CB" strokeWidth="1.4" strokeOpacity="0.6" />
          <circle r="9" fill="none" stroke="#FFE7CB" strokeWidth="1" strokeOpacity="0.5" />
          <text textAnchor="middle" y="3" fontFamily="'Satoshi',sans-serif" fontWeight="900" fontSize="11" fill="#FFE7CB">Rp</text>
        </g>

        {/* Face area background plate */}
        <rect x="78" y="40" width="84" height="58" rx="10" fill="#ffffff" opacity="0.08" />

        {/* Cheeks */}
        <ellipse cx="92" cy="80" rx="9" ry="6" fill="url(#rp-cheek)" />
        <ellipse cx="148" cy="80" rx="9" ry="6" fill="url(#rp-cheek)" />

        {/* Eyebrows — subtle bob during speech */}
        <motion.g
          animate={active && !reduce ? { y: [0, -1.4, 0] } : { y: 0 }}
          transition={{ duration: 0.6, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
        >
          <path d="M84 60 Q92 56 100 60" stroke="#3A0712" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M140 60 Q148 56 156 60" stroke="#3A0712" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* Eyes (whites) with pupils + blink */}
        <Eye cx={92} cy={70} blink={blinkSchedule} reduce={reduce} />
        <Eye cx={148} cy={70} blink={blinkSchedule} reduce={reduce} delay={0.05} />

        {/* Mouth */}
        <Mouth open={mouthOpen} active={active} reduce={reduce} />
      </g>

      {/* Tiny floating coins next to the note */}
      {!reduce && (
        <>
          <motion.g
            animate={{ y: [0, -6, 0], rotate: [0, 12, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Coin cx={228} cy={36} r={7} />
          </motion.g>
          <motion.g
            animate={{ y: [0, -4, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          >
            <Coin cx={10} cy={48} r={5} />
          </motion.g>
        </>
      )}
    </svg>
  );
}

/* -------- Eye --------------------------------------------------------------- */

function Eye({
  cx, cy, blink, reduce, delay = 0,
}: { cx: number; cy: number; blink: NoteProps['blinkSchedule']; reduce: boolean; delay?: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={9} ry={9} fill="#ffffff" />
      <motion.ellipse
        cx={cx}
        cy={cy + 1}
        rx={4.5}
        ry={4.5}
        fill="#0B1020"
        animate={reduce ? undefined : { x: [0, 1.5, -1.5, 0], y: [0, 0.5, -0.5, 0] }}
        transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
      />
      <circle cx={cx + 1.6} cy={cy - 1.2} r={1.6} fill="#ffffff" />
      {/* Eyelid that blinks */}
      <motion.rect
        x={cx - 10}
        y={cy - 10}
        width={20}
        height={20}
        rx={9}
        fill="#E63956"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        initial={{ scaleY: 0 }}
        animate={reduce ? { scaleY: 0 } : { scaleY: [0, 1, 0] }}
        transition={reduce ? undefined : { ...blink, delay: 1.2 + delay }}
      />
    </g>
  );
}

/* -------- Mouth ------------------------------------------------------------- */

function Mouth({ open, active, reduce }: { open: boolean; active: boolean; reduce: boolean }) {
  // Idle: a gentle smile arc.
  // Talking: morphs between an open "o" and a half-closed shape.
  const cx = 120;
  const cy = 90;
  // Use scaleY on the mouth oval to fake opening / closing.
  return (
    <g>
      {/* Smile line (idle backdrop) */}
      <path
        d={`M${cx - 14} ${cy - 1} Q${cx} ${cy + 8} ${cx + 14} ${cy - 1}`}
        stroke="#3A0712"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity={active ? 0 : 1}
      />
      {/* Talking mouth */}
      <motion.g
        style={{ transformOrigin: `${cx}px ${cy + 2}px` }}
        animate={
          reduce
            ? { scaleY: active ? 0.6 : 0 }
            : active
              ? { scaleY: open ? 1 : 0.35 }
              : { scaleY: 0 }
        }
        transition={{ type: 'spring', stiffness: 480, damping: 18 }}
      >
        <ellipse cx={cx} cy={cy + 2} rx={9} ry={6.5} fill="#3A0712" />
        {/* Tongue */}
        <ellipse cx={cx} cy={cy + 5} rx={5.5} ry={2.4} fill="#FF6B85" />
        {/* Teeth strip */}
        <rect x={cx - 8} y={cy - 3.6} width={16} height={2.2} rx={1} fill="#ffffff" />
      </motion.g>
    </g>
  );
}

/* -------- Coin -------------------------------------------------------------- */

function Coin({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#F5C24A" stroke="#A57A12" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r - 2} fill="none" stroke="#A57A12" strokeOpacity="0.55" strokeWidth="0.8" />
      <text
        x={cx}
        y={cy + r * 0.35}
        textAnchor="middle"
        fontFamily="'Satoshi',sans-serif"
        fontWeight="900"
        fontSize={r}
        fill="#7A5C0E"
      >
        Rp
      </text>
    </g>
  );
}

/* -------- Sparkles ---------------------------------------------------------- */

function Sparkles({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  const items = [
    { left: '4%', top: '8%', size: 6, delay: 0 },
    { left: '92%', top: '12%', size: 4, delay: 0.6 },
    { left: '88%', top: '78%', size: 7, delay: 1.1 },
    { left: '8%', top: '68%', size: 5, delay: 0.3 },
    { left: '50%', top: '-6%', size: 5, delay: 0.9 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0">
      {items.map((s, i) => (
        <motion.span
          key={i}
          className="absolute text-amber-400"
          style={{ left: s.left, top: s.top, fontSize: s.size * 2 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4], rotate: [0, 90, 180] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
}
