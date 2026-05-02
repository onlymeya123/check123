import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Eye, EyeOff, Plus, Send, Scan, Clock, ArrowUpRight, X, Check, Users, Receipt,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import StatusBar from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { CATEGORY_COLORS, type Transaction, type TxnCategory } from '../data/wallet';
import { formatRp, formatRpFull, relativeDay } from '../lib/format';
import { useToast } from '../components/Toast';

export default function WalletPage() {
  const { balance, transactions, addTransaction, topUp, budgetTotal, totalSpent } = useApp();
  const { show } = useToast();

  const [hidden, setHidden] = useState(false);
  const [sheet, setSheet] = useState<null | 'topup' | 'send' | 'scan' | 'history' | 'split' | 'addManual'>(null);

  const breakdown = useMemo(() => {
    const map = new Map<TxnCategory, number>();
    transactions.filter((t) => t.amount < 0).forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + Math.abs(t.amount));
    });
    const total = Array.from(map.values()).reduce((s, n) => s + n, 0) || 1;
    return Array.from(map.entries()).map(([cat, val]) => ({
      cat, val, pct: val / total,
    })).sort((a, b) => b.val - a.val);
  }, [transactions]);

  const left = budgetTotal - totalSpent;
  const used = Math.min(1, totalSpent / budgetTotal);

  return (
    <div className="absolute inset-0 bg-white overflow-y-auto pb-32 no-scrollbar">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-2">
        <div className="font-bold text-ink-900 text-lg font-display">WALLET</div>
        <button className="w-9 h-9 rounded-full bg-ink-50 flex items-center justify-center press" onClick={() => show('Notifications: 0 new', 'info')}>
          <Bell className="w-4 h-4 text-ink-700" />
        </button>
      </div>

      {/* Balance */}
      <div className="px-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white overflow-hidden shadow-glow"
        >
          <div className="flex items-center gap-2 text-sm opacity-90">
            Total Balance
            <button onClick={() => setHidden((h) => !h)} className="press">
              {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-3xl font-extrabold tracking-tight font-display mt-1">
            {hidden ? 'Rp ••••••••' : formatRpFull(balance)}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full text-xs">
            <ArrowUpRight className="w-3 h-3" /> 12% this week
          </div>
          {/* deco */}
          <motion.div
            animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 4 }}
            className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/10"
          />
          <motion.div
            animate={{ rotate: [0, 6, -3, 0] }} transition={{ repeat: Infinity, duration: 6 }}
            className="absolute right-4 top-4 text-3xl"
          >💰</motion.div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 px-5 mt-4">
        <Quick icon={<Plus />} label="Top Up" onClick={() => setSheet('topup')} />
        <Quick icon={<Send />} label="Send" onClick={() => setSheet('send')} />
        <Quick icon={<Scan />} label="Scan" onClick={() => setSheet('scan')} />
        <Quick icon={<Clock />} label="History" onClick={() => setSheet('history')} />
      </div>

      {/* Split bill */}
      <div className="px-5 mt-3">
        <button onClick={() => setSheet('split')} className="w-full h-12 rounded-2xl bg-ink-50 text-ink-800 font-semibold flex items-center justify-center gap-2 press">
          <Users className="w-4 h-4" /> Split a bill
        </button>
      </div>

      {/* Budget Overview */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink-900 font-display">Budget Overview</div>
          <button className="text-xs text-brand-600 font-semibold press">This Trip ›</button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat label="Total Budget" value={formatRp(budgetTotal)} />
          <Stat label="Spent" value={formatRp(totalSpent)} />
          <Stat label="Left" value={formatRp(left)} />
        </div>
        <div className="mt-3 h-2 bg-ink-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${used * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-brand-500 rounded-full"
          />
        </div>
        <div className="text-xs text-ink-500 mt-1.5 text-right">{Math.round(used * 100)}% used</div>
      </div>

      {/* Breakdown */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink-900 font-display">Expense Breakdown</div>
          <button className="text-xs text-brand-600 font-semibold press">See all ›</button>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <Donut breakdown={breakdown} totalSpent={totalSpent} />
          <div className="flex-1 space-y-2">
            {breakdown.map(({ cat, val, pct }) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[cat] }} />
                <span className="text-sm text-ink-800 flex-1">{cat}</span>
                <span className="text-xs font-semibold text-ink-900">{formatRp(val)}</span>
                <span className="text-[11px] text-ink-500 w-9 text-right">{Math.round(pct * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink-900 font-display">Recent Transactions</div>
          <button onClick={() => setSheet('history')} className="text-xs text-brand-600 font-semibold press">See all ›</button>
        </div>
        <div className="mt-3 space-y-2">
          {transactions.slice(0, 5).map((t) => (
            <TxnRow key={t.id} t={t} />
          ))}
        </div>
      </div>

      {/* Sheets */}
      <Sheet open={sheet === 'topup'} title="Top up balance" onClose={() => setSheet(null)}>
        <TopUpSheet onSubmit={(amt) => { topUp(amt); show(`Topped up ${formatRp(amt)}`, 'success'); setSheet(null); }} />
      </Sheet>
      <Sheet open={sheet === 'send'} title="Send money" onClose={() => setSheet(null)}>
        <SendSheet onSubmit={(amt, who) => {
          addTransaction({ title: `Sent to ${who}`, category: 'Shopping', amount: -amt, icon: '💸' });
          show(`Sent ${formatRp(amt)} to ${who}`, 'success');
          setSheet(null);
        }} />
      </Sheet>
      <Sheet open={sheet === 'scan'} title="Scan receipt" onClose={() => setSheet(null)}>
        <ScanSheet onResult={(amt, title) => {
          addTransaction({ title, category: 'Food & Drinks', amount: -amt, icon: '🧾' });
          show(`Receipt parsed: ${formatRp(amt)}`, 'success');
          setSheet(null);
        }} />
      </Sheet>
      <Sheet open={sheet === 'history'} title="All transactions" onClose={() => setSheet(null)}>
        <HistorySheet transactions={transactions} />
      </Sheet>
      <Sheet open={sheet === 'split'} title="Split a bill" onClose={() => setSheet(null)}>
        <SplitSheet onSubmit={(amt, ppl, title) => {
          const each = amt / Math.max(1, ppl);
          addTransaction({ title: `${title} (split ÷${ppl})`, category: 'Food & Drinks', amount: -each, icon: '👥' });
          show(`Your share: ${formatRp(each)}`, 'success');
          setSheet(null);
        }} onAddManually={() => setSheet('addManual')} />
      </Sheet>
      <Sheet open={sheet === 'addManual'} title="Add manually" onClose={() => setSheet(null)}>
        <AddManualSheet onSubmit={(t) => {
          addTransaction(t);
          show(`Added ${t.title}`, 'success');
          setSheet(null);
        }} />
      </Sheet>
    </div>
  );
}

/* ----------------- Components ----------------- */

function Quick({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="press flex flex-col items-center gap-1 py-3 rounded-2xl bg-white border border-ink-100 hover:border-brand-300 transition-colors">
      <span className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">{icon}</span>
      <span className="text-[11px] font-semibold text-ink-800">{label}</span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-50 rounded-xl py-2">
      <div className="text-[10px] uppercase tracking-wide text-ink-500">{label}</div>
      <div className="text-sm font-bold text-ink-900">{value}</div>
    </div>
  );
}

function Donut({ breakdown, totalSpent }: { breakdown: { cat: TxnCategory; val: number; pct: number }[]; totalSpent: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative w-[110px] h-[110px] shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#EEF1F7" strokeWidth="14" />
        {breakdown.map(({ cat, pct }, i) => {
          const len = c * pct;
          const dash = `${len} ${c - len}`;
          const offset = -acc;
          acc += len;
          return (
            <motion.circle
              key={cat}
              cx="50" cy="50" r={r}
              fill="none" stroke={CATEGORY_COLORS[cat]} strokeWidth="14"
              strokeDasharray={dash}
              strokeDashoffset={offset}
              initial={{ strokeDasharray: `0 ${c}` }}
              animate={{ strokeDasharray: dash }}
              transition={{ delay: 0.05 * i, duration: 0.7 }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] text-ink-500">Total Spent</div>
        <div className="text-sm font-bold text-ink-900">{formatRp(totalSpent)}</div>
      </div>
    </div>
  );
}

function TxnRow({ t }: { t: Transaction }) {
  const positive = t.amount > 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 bg-white border border-ink-100 rounded-2xl px-3 py-2"
    >
      <div className="w-10 h-10 rounded-full bg-ink-50 flex items-center justify-center text-lg">{t.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink-900 truncate text-sm">{t.title}</div>
        <div className="text-[11px] text-ink-500 flex items-center gap-1">
          {relativeDay(t.date)}
          {t.tag && <span className={`ml-1 px-1.5 rounded-full text-[10px] font-semibold ${
            t.tag === 'Over budget' ? 'bg-red-50 text-red-600'
              : t.tag === 'Great deal' ? 'bg-emerald-50 text-emerald-600'
              : 'bg-brand-50 text-brand-600'
          }`}>{t.tag}</span>}
        </div>
      </div>
      <div className={`text-sm font-bold ${positive ? 'text-emerald-600' : 'text-ink-900'}`}>
        {positive ? '+' : '-'} {formatRpFull(t.amount).replace('Rp ', 'Rp ')}
      </div>
    </motion.div>
  );
}

/* ----------------- Sheets ----------------- */

function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-40 bg-ink-900/40" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-card max-h-[80%] flex flex-col"
          >
            <div className="w-12 h-1.5 bg-ink-100 rounded-full mx-auto mt-3" />
            <div className="px-5 pt-3 pb-2 flex items-center justify-between">
              <div className="font-bold text-ink-900 font-display">{title}</div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center press"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto px-5 pb-6 no-scrollbar">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TopUpSheet({ onSubmit }: { onSubmit: (amt: number) => void }) {
  const presets = [100_000, 250_000, 500_000, 1_000_000];
  const [amt, setAmt] = useState(250_000);
  return (
    <div className="space-y-3">
      <div className="bg-ink-50 rounded-2xl p-4">
        <div className="text-xs text-ink-500">Amount</div>
        <input
          type="number"
          value={amt}
          onChange={(e) => setAmt(Math.max(0, Number(e.target.value)))}
          className="w-full bg-transparent text-2xl font-bold text-ink-900 outline-none mt-1"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {presets.map((p) => (
          <button key={p} onClick={() => setAmt(p)} className={`py-2 rounded-xl text-xs font-semibold press ${amt === p ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-700'}`}>
            {formatRp(p)}
          </button>
        ))}
      </div>
      <div className="text-xs text-ink-500">From: BCA •••• 4521</div>
      <button disabled={amt <= 0} onClick={() => onSubmit(amt)} className="w-full h-12 rounded-2xl bg-brand-500 disabled:bg-ink-300 text-white font-bold shadow-glow press">
        Top Up {formatRp(amt)}
      </button>
    </div>
  );
}

function SendSheet({ onSubmit }: { onSubmit: (amt: number, who: string) => void }) {
  const [amt, setAmt] = useState(50_000);
  const [who, setWho] = useState('Made');
  const friends = ['Made', 'Sari', 'Budi', 'Kadek'];
  return (
    <div className="space-y-3">
      <div className="bg-ink-50 rounded-2xl p-4">
        <div className="text-xs text-ink-500">Amount</div>
        <input type="number" value={amt} onChange={(e) => setAmt(Math.max(0, Number(e.target.value)))} className="w-full bg-transparent text-2xl font-bold text-ink-900 outline-none mt-1" />
      </div>
      <div className="text-xs font-semibold text-ink-700">Send to</div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {friends.map((f) => (
          <button key={f} onClick={() => setWho(f)} className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border ${who === f ? 'border-brand-500 bg-brand-50' : 'border-ink-100'}`}>
            <span className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center text-lg">{f[0]}</span>
            <span className="text-[11px] font-semibold text-ink-800">{f}</span>
          </button>
        ))}
      </div>
      <button onClick={() => onSubmit(amt, who)} className="w-full h-12 rounded-2xl bg-brand-500 text-white font-bold shadow-glow press">
        Send {formatRp(amt)} to {who}
      </button>
    </div>
  );
}

function ScanSheet({ onResult }: { onResult: (amt: number, title: string) => void }) {
  const [scanning, setScanning] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setScanning(false), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative h-64 bg-ink-900 rounded-2xl overflow-hidden flex items-center justify-center">
        <Receipt className="w-16 h-16 text-white/30" />
        {scanning && <div className="absolute left-4 right-4 h-0.5 bg-brand-500 shadow-glow animate-scanLine" />}
        <div className="absolute inset-3 rounded-2xl border-2 border-white/30 border-dashed" />
        <div className="absolute bottom-3 left-3 right-3 text-center text-white/80 text-xs">
          {scanning ? 'Scanning receipt…' : 'Receipt parsed ✓'}
        </div>
      </div>
      {scanning ? (
        <div className="space-y-2">
          <div className="h-3 rounded shimmer w-2/3" />
          <div className="h-3 rounded shimmer w-1/2" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="bg-ink-50 rounded-2xl p-3">
            <div className="text-xs text-ink-500">Detected</div>
            <div className="font-bold text-ink-900">Warung Babi Guling Ibu Oka</div>
            <div className="text-sm text-brand-600 font-semibold">Rp 85.000</div>
          </div>
          <button onClick={() => onResult(85_000, 'Warung Babi Guling Ibu Oka')} className="w-full h-12 rounded-2xl bg-brand-500 text-white font-bold press shadow-glow inline-flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Add transaction
          </button>
        </motion.div>
      )}
    </div>
  );
}

function HistorySheet({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="space-y-2">
      {transactions.map((t) => <TxnRow key={t.id} t={t} />)}
    </div>
  );
}

function SplitSheet({ onSubmit, onAddManually }: { onSubmit: (amt: number, ppl: number, title: string) => void; onAddManually: () => void }) {
  const [amt, setAmt] = useState(220_000);
  const [ppl, setPpl] = useState(3);
  const [title, setTitle] = useState('Hujan Locale Dinner');
  const each = amt / Math.max(1, ppl);
  return (
    <div className="space-y-3">
      <div className="bg-ink-50 rounded-2xl p-4">
        <div className="text-xs text-ink-500">Total bill</div>
        <input type="number" value={amt} onChange={(e) => setAmt(Math.max(0, Number(e.target.value)))} className="w-full bg-transparent text-2xl font-bold text-ink-900 outline-none mt-1" />
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full bg-ink-50 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
      <div className="flex items-center justify-between bg-ink-50 rounded-2xl px-4 py-3">
        <div className="text-sm text-ink-700">People</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPpl((p) => Math.max(1, p - 1))} className="w-8 h-8 rounded-full bg-white press flex items-center justify-center font-bold text-ink-700">−</button>
          <span className="font-bold w-6 text-center">{ppl}</span>
          <button onClick={() => setPpl((p) => p + 1)} className="w-8 h-8 rounded-full bg-white press flex items-center justify-center font-bold text-ink-700">+</button>
        </div>
      </div>
      <div className="bg-brand-50 text-brand-700 rounded-2xl p-3 text-center">
        <div className="text-xs">Each pays</div>
        <div className="text-2xl font-extrabold">{formatRp(each)}</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onAddManually} className="h-12 rounded-2xl bg-ink-50 text-ink-800 font-semibold press inline-flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Manually
        </button>
        <button onClick={() => onSubmit(amt, ppl, title)} className="h-12 rounded-2xl bg-brand-500 text-white font-bold shadow-glow press inline-flex items-center justify-center gap-2">
          <Check className="w-4 h-4" /> Confirm split
        </button>
      </div>
    </div>
  );
}

function AddManualSheet({ onSubmit }: { onSubmit: (t: { title: string; category: TxnCategory; amount: number; icon: string }) => void }) {
  const [title, setTitle] = useState('');
  const [amt, setAmt] = useState(50_000);
  const [cat, setCat] = useState<TxnCategory>('Food & Drinks');
  const cats: { id: TxnCategory; icon: string }[] = [
    { id: 'Food & Drinks', icon: '🍽️' },
    { id: 'Attractions', icon: '🎟️' },
    { id: 'Transport', icon: '🛵' },
    { id: 'Shopping', icon: '🛍️' },
  ];
  const submit = () => {
    if (!title.trim() || amt <= 0) return;
    const icon = cats.find((c) => c.id === cat)?.icon ?? '💵';
    onSubmit({ title, category: cat, amount: -amt, icon });
  };
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <div className="space-y-3">
      <input ref={inputRef} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What did you buy?" className="w-full bg-ink-50 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
      <div className="bg-ink-50 rounded-2xl p-4">
        <div className="text-xs text-ink-500">Amount</div>
        <input type="number" value={amt} onChange={(e) => setAmt(Math.max(0, Number(e.target.value)))} className="w-full bg-transparent text-2xl font-bold text-ink-900 outline-none mt-1" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cats.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`flex flex-col items-center gap-1 py-3 rounded-xl text-[11px] font-semibold press ${cat === c.id ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-700'}`}>
            <span className="text-lg">{c.icon}</span>
            {c.id.split(' ')[0]}
          </button>
        ))}
      </div>
      <button disabled={!title.trim() || amt <= 0} onClick={submit} className="w-full h-12 rounded-2xl bg-brand-500 disabled:bg-ink-300 text-white font-bold shadow-glow press">
        Add transaction
      </button>
    </div>
  );
}

