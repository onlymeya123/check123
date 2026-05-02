import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell, Plus, Scan, Clock, X, Check, Users, Receipt,
  Pencil, Trash2, Share2, ChevronRight, ChevronLeft, Wallet, CalendarDays,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import StatusBar from '../components/StatusBar';
import { useApp } from '../context/AppContext';
import { CATEGORY_COLORS, type Transaction, type TxnCategory } from '../data/wallet';
import { formatRp, formatRpFull, relativeDay } from '../lib/format';
import { useToast } from '../components/Toast';

export default function WalletPage() {
  const { transactions, addTransaction, tripBudget, setTripBudget, tripName, setTripName, tripDays, tripDaysRemaining, setTripDaysRemaining, totalSpent, dailyAllowance } = useApp();
  const { show } = useToast();

  const [sheet, setSheet] = useState<null | 'editBudget' | 'addExpense' | 'scan' | 'history' | 'splitBill'>(null);

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

  const remaining = tripBudget - totalSpent;
  const usedPct = Math.min(1, totalSpent / tripBudget);
  const isOverBudget = totalSpent > tripBudget;

  return (
    <div className="absolute inset-0 bg-white overflow-y-auto pb-32 no-scrollbar">
      <StatusBar />

      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-2">
        <div className="font-bold text-ink-900 text-lg font-display flex items-center gap-2">
          <Wallet className="w-5 h-5 text-brand-500" /> Trip Budget
        </div>
        <button className="w-9 h-9 rounded-full bg-ink-50 flex items-center justify-center press" onClick={() => show('Notifications: 0 new', 'info')}>
          <Bell className="w-4 h-4 text-ink-700" />
        </button>
      </div>

      {/* Trip Budget Card */}
      <div className="px-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white overflow-hidden shadow-glow"
        >
          {/* Trip name row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-white/70">Current Trip</div>
              <div className="font-bold text-lg font-display">{tripName}</div>
            </div>
            <button
              onClick={() => setSheet('editBudget')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors press"
            >
              <Pencil className="w-3 h-3" /> Edit Budget
            </button>
          </div>

          {/* Budget numbers */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <div className="text-xs text-white/70">Total Budget</div>
              <div className="text-base font-extrabold font-display">{formatRp(tripBudget)}</div>
            </div>
            <div>
              <div className="text-xs text-white/70">Spent</div>
              <div className="text-base font-extrabold font-display text-red-300">{formatRp(totalSpent)}</div>
            </div>
            <div>
              <div className="text-xs text-white/70">Remaining</div>
              <div className={`text-base font-extrabold font-display ${isOverBudget ? 'text-red-300' : 'text-emerald-300'}`}>
                {isOverBudget ? '-' : ''}{formatRp(Math.abs(remaining))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usedPct * 100, 100)}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className={`h-full rounded-full ${isOverBudget ? 'bg-red-400' : usedPct > 0.8 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/70 mt-1">
              <span>{Math.round(usedPct * 100)}% used</span>
              <span>{Math.round((1 - usedPct) * 100)}% left</span>
            </div>
          </div>

          {/* Daily allowance */}
          <div className="flex items-center justify-between bg-white/10 rounded-2xl px-3 py-2.5">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-white/80" />
              <div>
                <div className="text-xs text-white/70">Daily Allowance</div>
                <div className="font-bold text-sm">{formatRp(dailyAllowance)} / day</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/70">Days Left</div>
              <div className="font-bold text-sm">{tripDaysRemaining} of {tripDays}</div>
            </div>
          </div>

          {/* Deco */}
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 4 }}
            className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-white/8" />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 px-5 mt-4">
        <QuickBtn icon={<Plus />} label="Add Expense" onClick={() => setSheet('addExpense')} />
        <QuickBtn icon={<Users />} label="Split Bill" onClick={() => setSheet('splitBill')} highlight />
        <QuickBtn icon={<Scan />} label="Scan" onClick={() => setSheet('scan')} />
        <QuickBtn icon={<Clock />} label="History" onClick={() => setSheet('history')} />
      </div>

      {/* Breakdown */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink-900 font-display">Expense Breakdown</div>
          <button className="text-xs text-brand-600 font-semibold press">This trip ›</button>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <Donut breakdown={breakdown} totalSpent={totalSpent} />
          <div className="flex-1 space-y-2">
            {breakdown.map(({ cat, val, pct }) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[cat] }} />
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
          {transactions.slice(0, 5).map((t) => <TxnRow key={t.id} t={t} />)}
        </div>
      </div>

      {/* Sheets */}
      <Sheet open={sheet === 'editBudget'} title="Edit Trip Budget" onClose={() => setSheet(null)}>
        <EditBudgetSheet
          tripBudget={tripBudget}
          tripName={tripName}
          tripDaysRemaining={tripDaysRemaining}
          onSave={(budget, name, daysRem) => {
            setTripBudget(budget);
            setTripName(name);
            setTripDaysRemaining(daysRem);
            show('Budget updated ✓', 'success');
            setSheet(null);
          }}
        />
      </Sheet>

      <Sheet open={sheet === 'addExpense'} title="Add Expense" onClose={() => setSheet(null)}>
        <AddExpenseSheet onSubmit={(t) => {
          addTransaction(t);
          show(`Added ${t.title}`, 'success');
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

      <SplitBillSheet
        open={sheet === 'splitBill'}
        onClose={() => setSheet(null)}
        onConfirm={(title, myShare) => {
          addTransaction({ title, category: 'Food & Drinks', amount: -myShare, icon: '👥' });
          show(`Your share: ${formatRp(myShare)} added`, 'success');
          setSheet(null);
        }}
      />
    </div>
  );
}

/* ----------------------------------------- */

function QuickBtn({ icon, label, onClick, highlight }: { icon: React.ReactNode; label: string; onClick?: () => void; highlight?: boolean }) {
  return (
    <button onClick={onClick} className="press flex flex-col items-center gap-1 py-3 rounded-2xl bg-white border border-ink-100 hover:border-brand-300 transition-colors">
      <span className={`w-10 h-10 rounded-full flex items-center justify-center ${highlight ? 'bg-brand-500 text-white shadow-glow' : 'bg-brand-50 text-brand-600'}`}>{icon}</span>
      <span className="text-[10px] font-semibold text-ink-800 text-center leading-tight px-1">{label}</span>
    </button>
  );
}

function Donut({ breakdown, totalSpent }: { breakdown: { cat: TxnCategory; val: number; pct: number }[]; totalSpent: number }) {
  const r = 38, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="relative w-[110px] h-[110px] shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#EEF1F7" strokeWidth="14" />
        {breakdown.map(({ cat, pct }, i) => {
          const len = c * pct, dash = `${len} ${c - len}`, offset = -acc;
          acc += len;
          return (
            <motion.circle key={cat} cx="50" cy="50" r={r} fill="none"
              stroke={CATEGORY_COLORS[cat]} strokeWidth="14" strokeDasharray={dash} strokeDashoffset={offset}
              initial={{ strokeDasharray: `0 ${c}` }} animate={{ strokeDasharray: dash }}
              transition={{ delay: 0.05 * i, duration: 0.7 }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[9px] text-ink-500">Spent</div>
        <div className="text-sm font-bold text-ink-900">{formatRp(totalSpent)}</div>
      </div>
    </div>
  );
}

function TxnRow({ t }: { t: Transaction }) {
  const positive = t.amount > 0;
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 bg-white border border-ink-100 rounded-2xl px-3 py-2">
      <div className="w-10 h-10 rounded-full bg-ink-50 flex items-center justify-center text-lg shrink-0">{t.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink-900 truncate text-sm">{t.title}</div>
        <div className="text-[11px] text-ink-500 flex items-center gap-1">
          {relativeDay(t.date)}
          {t.tag && <span className={`ml-1 px-1.5 rounded-full text-[10px] font-semibold ${t.tag === 'Over budget' ? 'bg-red-50 text-red-600' : t.tag === 'Great deal' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>{t.tag}</span>}
        </div>
      </div>
      <div className={`text-sm font-bold shrink-0 ${positive ? 'text-emerald-600' : 'text-ink-900'}`}>
        {positive ? '+' : '–'} {formatRpFull(Math.abs(t.amount)).replace('Rp ', '')}
      </div>
    </motion.div>
  );
}

/* -------- Sheet Wrapper -------- */

function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-40 bg-ink-900/40" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-card max-h-[85%] flex flex-col"
          >
            <div className="w-12 h-1.5 bg-ink-100 rounded-full mx-auto mt-3" />
            <div className="px-5 pt-3 pb-2 flex items-center justify-between shrink-0">
              <div className="font-bold text-ink-900 font-display">{title}</div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center press"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto px-5 pb-6 no-scrollbar flex-1">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* -------- Edit Budget Sheet -------- */

function EditBudgetSheet({ tripBudget, tripName, tripDaysRemaining, onSave }: {
  tripBudget: number; tripName: string; tripDaysRemaining: number;
  onSave: (budget: number, name: string, daysRem: number) => void;
}) {
  const [budget, setBudget] = useState(tripBudget);
  const [name, setName] = useState(tripName);
  const [daysRem, setDaysRem] = useState(tripDaysRemaining);
  const presets = [1_000_000, 2_000_000, 3_000_000, 5_000_000];
  return (
    <div className="space-y-3">
      <div className="bg-ink-50 rounded-2xl p-4">
        <div className="text-xs text-ink-500">Trip Name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent text-lg font-bold text-ink-900 outline-none mt-1" />
      </div>
      <div className="bg-ink-50 rounded-2xl p-4">
        <div className="text-xs text-ink-500">Total Budget (Rp)</div>
        <input type="number" value={budget} onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))} className="w-full bg-transparent text-2xl font-bold text-ink-900 outline-none mt-1" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {presets.map((p) => (
          <button key={p} onClick={() => setBudget(p)} className={`py-2 rounded-xl text-xs font-semibold press ${budget === p ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-700'}`}>
            {formatRp(p)}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between bg-ink-50 rounded-2xl px-4 py-3">
        <div className="text-sm text-ink-700">Days remaining</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDaysRem((d) => Math.max(1, d - 1))} className="w-8 h-8 rounded-full bg-white press flex items-center justify-center font-bold text-ink-700">−</button>
          <span className="font-bold w-6 text-center">{daysRem}</span>
          <button onClick={() => setDaysRem((d) => d + 1)} className="w-8 h-8 rounded-full bg-white press flex items-center justify-center font-bold text-ink-700">+</button>
        </div>
      </div>
      <button onClick={() => onSave(budget, name, daysRem)} className="w-full h-12 rounded-2xl bg-brand-500 text-white font-bold shadow-glow press">
        Save Budget
      </button>
    </div>
  );
}

/* -------- Add Expense Sheet -------- */

function AddExpenseSheet({ onSubmit }: { onSubmit: (t: { title: string; category: TxnCategory; amount: number; icon: string }) => void }) {
  const [title, setTitle] = useState('');
  const [amt, setAmt] = useState(50_000);
  const [cat, setCat] = useState<TxnCategory>('Food & Drinks');
  const cats: { id: TxnCategory; icon: string; label: string }[] = [
    { id: 'Food & Drinks', icon: '🍽️', label: 'Food' },
    { id: 'Attractions', icon: '🎟️', label: 'Attraction' },
    { id: 'Transport', icon: '🛵', label: 'Transport' },
    { id: 'Shopping', icon: '🛍️', label: 'Shopping' },
  ];
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <div className="space-y-3">
      <input ref={inputRef} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What did you spend on?" className="w-full bg-ink-50 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-300" />
      <div className="bg-ink-50 rounded-2xl p-4">
        <div className="text-xs text-ink-500">Amount (Rp)</div>
        <input type="number" value={amt} onChange={(e) => setAmt(Math.max(0, Number(e.target.value)))} className="w-full bg-transparent text-2xl font-bold text-ink-900 outline-none mt-1" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cats.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`flex flex-col items-center gap-1 py-3 rounded-xl text-[11px] font-semibold press ${cat === c.id ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-700'}`}>
            <span className="text-lg">{c.icon}</span> {c.label}
          </button>
        ))}
      </div>
      <button
        disabled={!title.trim() || amt <= 0}
        onClick={() => onSubmit({ title, category: cat, amount: -amt, icon: cats.find((c) => c.id === cat)?.icon ?? '💵' })}
        className="w-full h-12 rounded-2xl bg-brand-500 disabled:bg-ink-300 text-white font-bold shadow-glow press"
      >
        Add Expense
      </button>
    </div>
  );
}

/* -------- Scan Sheet -------- */

function ScanSheet({ onResult }: { onResult: (amt: number, title: string) => void }) {
  const [scanning, setScanning] = useState(true);
  useEffect(() => { const t = setTimeout(() => setScanning(false), 2200); return () => clearTimeout(t); }, []);
  return (
    <div className="space-y-3">
      <div className="relative h-56 bg-ink-900 rounded-2xl overflow-hidden flex items-center justify-center">
        <Receipt className="w-16 h-16 text-white/30" />
        {scanning && <div className="absolute left-4 right-4 h-0.5 bg-brand-500 shadow-glow animate-scanLine" />}
        <div className="absolute inset-3 rounded-2xl border-2 border-white/30 border-dashed" />
        <div className="absolute bottom-3 left-3 right-3 text-center text-white/80 text-xs">{scanning ? 'Scanning receipt…' : 'Receipt parsed ✓'}</div>
      </div>
      {scanning ? (
        <div className="space-y-2"><div className="h-3 rounded shimmer w-2/3" /><div className="h-3 rounded shimmer w-1/2" /></div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="bg-ink-50 rounded-2xl p-3">
            <div className="text-xs text-ink-500">Detected</div>
            <div className="font-bold text-ink-900">Warung Babi Guling Ibu Oka</div>
            <div className="text-sm text-brand-600 font-semibold">Rp 85.000</div>
          </div>
          <button onClick={() => onResult(85_000, 'Warung Babi Guling Ibu Oka')} className="w-full h-12 rounded-2xl bg-brand-500 text-white font-bold press shadow-glow inline-flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Add to Expenses
          </button>
        </motion.div>
      )}
    </div>
  );
}

/* -------- History Sheet -------- */

function HistorySheet({ transactions }: { transactions: Transaction[] }) {
  return <div className="space-y-2">{transactions.map((t) => <TxnRow key={t.id} t={t} />)}</div>;
}

/* ======================================================
   SPLIT BILL — Full Redesign
   ====================================================== */

type BillItem = { id: string; name: string; price: number; sharedBy: string[] };
type SplitStep = 'items' | 'people' | 'assign' | 'summary';

const STEPS: { id: SplitStep; label: string }[] = [
  { id: 'items', label: 'Items' },
  { id: 'people', label: 'People' },
  { id: 'assign', label: 'Assign' },
  { id: 'summary', label: 'Summary' },
];

function SplitBillSheet({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (title: string, myShare: number) => void;
}) {
  const [step, setStep] = useState<SplitStep>('items');
  const [billName, setBillName] = useState('Dinner at Hujan Locale');
  const [items, setItems] = useState<BillItem[]>([
    { id: 'i1', name: 'Nasi Goreng Hujan', price: 85000, sharedBy: [] },
    { id: 'i2', name: 'Es Teh Manis', price: 20000, sharedBy: [] },
    { id: 'i3', name: 'Sate Lilit', price: 65000, sharedBy: [] },
  ]);
  const [people, setPeople] = useState<string[]>(['Aria', 'Made', 'Sari']);
  const [tax, setTax] = useState(10);
  const [service, setService] = useState(5);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [payer, setPayer] = useState<string>('');
  const [shared, setShared] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const taxAmt = Math.round(subtotal * (tax / 100));
  const serviceAmt = Math.round(subtotal * (service / 100));
  const grandTotal = subtotal + taxAmt + serviceAmt;

  const perPersonBreakdown = useMemo(() => {
    return people.map((person) => {
      const myItems = items.filter((item) => item.sharedBy.includes(person));
      const itemSubtotal = myItems.reduce((s, item) => {
        return s + item.price / Math.max(1, item.sharedBy.length);
      }, 0);
      const proportion = subtotal > 0 ? itemSubtotal / subtotal : 1 / Math.max(1, people.length);
      const myTax = Math.round(taxAmt * proportion);
      const myService = Math.round(serviceAmt * proportion);
      const total = Math.round(itemSubtotal + myTax + myService);
      return { person, itemSubtotal: Math.round(itemSubtotal), myTax, myService, total, items: myItems };
    });
  }, [items, people, taxAmt, serviceAmt, subtotal]);

  const unassignedItems = items.filter((i) => i.sharedBy.length === 0);

  const addItem = () => {
    if (!newItemName.trim() || !newItemPrice) return;
    setItems((prev) => [...prev, { id: `i${Date.now()}`, name: newItemName, price: Number(newItemPrice), sharedBy: [] }]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const toggleAssign = (itemId: string, person: string) => {
    setItems((prev) => prev.map((i) => i.id === itemId
      ? { ...i, sharedBy: i.sharedBy.includes(person) ? i.sharedBy.filter((p) => p !== person) : [...i.sharedBy, person] }
      : i
    ));
  };

  const handleConfirm = () => {
    const myPerson = people[0] ?? 'Me';
    const me = perPersonBreakdown.find((p) => p.person === myPerson);
    onConfirm(billName, me?.total ?? Math.round(grandTotal / Math.max(1, people.length)));
  };

  const stepIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-40 bg-ink-900/40" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-card flex flex-col"
            style={{ maxHeight: '92%' }}
          >
            {/* Handle + header */}
            <div className="w-12 h-1.5 bg-ink-100 rounded-full mx-auto mt-3 shrink-0" />
            <div className="px-5 pt-3 pb-2 flex items-center justify-between shrink-0">
              <div>
                <div className="font-bold text-ink-900 font-display">Split Bill</div>
                <div className="text-xs text-ink-500 mt-0.5 truncate max-w-[200px]">{billName}</div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center press shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-5 pb-3 shrink-0">
              <div className="flex items-center gap-1">
                {STEPS.map((s, i) => {
                  const done = i < stepIdx;
                  const active = s.id === step;
                  return (
                    <button
                      key={s.id}
                      onClick={() => (done || active) && setStep(s.id)}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className={`w-full h-1 rounded-full transition-colors ${done ? 'bg-brand-500' : active ? 'bg-brand-300' : 'bg-ink-100'}`} />
                      <span className={`text-[10px] font-semibold ${active ? 'text-brand-600' : done ? 'text-brand-400' : 'text-ink-400'}`}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
              <AnimatePresence mode="wait">
                {step === 'items' && (
                  <motion.div key="items" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    {/* Bill name */}
                    <div className="bg-ink-50 rounded-2xl px-4 py-3">
                      <div className="text-xs text-ink-500 mb-1">Bill Name</div>
                      <input value={billName} onChange={(e) => setBillName(e.target.value)} className="w-full bg-transparent text-sm font-bold text-ink-900 outline-none" placeholder="e.g. Dinner at XYZ" />
                    </div>

                    {/* Items list */}
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 bg-white border border-ink-100 rounded-2xl px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <input
                              value={item.name}
                              onChange={(e) => setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, name: e.target.value } : i))}
                              className="w-full bg-transparent text-sm font-semibold text-ink-900 outline-none truncate"
                            />
                          </div>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, price: Math.max(0, Number(e.target.value)) } : i))}
                            className="w-24 bg-ink-50 rounded-xl px-2 py-1 text-sm font-bold text-brand-600 text-right outline-none"
                          />
                          <button onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))} className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center press shrink-0">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add item row */}
                    <div className="flex gap-2">
                      <input
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                        placeholder="Item name"
                        className="flex-1 bg-ink-50 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
                      />
                      <input
                        type="number"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                        placeholder="Price"
                        className="w-24 bg-ink-50 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
                      />
                      <button onClick={addItem} disabled={!newItemName.trim() || !newItemPrice} className="w-10 h-10 rounded-xl bg-brand-500 disabled:bg-ink-200 text-white flex items-center justify-center press shrink-0">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtotals */}
                    <div className="bg-ink-50 rounded-2xl p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-600">Subtotal</span>
                        <span className="font-semibold text-ink-900">{formatRp(subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-ink-600">Tax</span>
                        <div className="flex items-center gap-2">
                          <input type="number" value={tax} onChange={(e) => setTax(Math.max(0, Number(e.target.value)))} className="w-12 text-center bg-white rounded-lg px-2 py-1 text-sm font-bold outline-none border border-ink-100" />
                          <span className="text-xs text-ink-500">%</span>
                          <span className="text-sm font-semibold text-ink-700 w-20 text-right">{formatRp(taxAmt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-ink-600">Service</span>
                        <div className="flex items-center gap-2">
                          <input type="number" value={service} onChange={(e) => setService(Math.max(0, Number(e.target.value)))} className="w-12 text-center bg-white rounded-lg px-2 py-1 text-sm font-bold outline-none border border-ink-100" />
                          <span className="text-xs text-ink-500">%</span>
                          <span className="text-sm font-semibold text-ink-700 w-20 text-right">{formatRp(serviceAmt)}</span>
                        </div>
                      </div>
                      <div className="border-t border-ink-200 pt-2 flex justify-between">
                        <span className="font-bold text-ink-900">Grand Total</span>
                        <span className="font-extrabold text-brand-600 text-lg">{formatRp(grandTotal)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 'people' && (
                  <motion.div key="people" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <div className="text-sm text-ink-500">Who's splitting this bill?</div>
                    <div className="space-y-2">
                      {people.map((person, idx) => (
                        <div key={person} className="flex items-center gap-3 bg-white border border-ink-100 rounded-2xl px-4 py-3">
                          <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-sm font-bold text-brand-600">
                            {person[0]}
                          </div>
                          <span className="flex-1 font-semibold text-ink-900">{idx === 0 ? `${person} (you)` : person}</span>
                          {idx > 0 && (
                            <button onClick={() => setPeople((prev) => prev.filter((p) => p !== person))} className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center press">
                              <X className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newPerson}
                        onChange={(e) => setNewPerson(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && newPerson.trim()) { setPeople((p) => [...p, newPerson.trim()]); setNewPerson(''); } }}
                        placeholder="Add person's name"
                        className="flex-1 bg-ink-50 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-300"
                      />
                      <button
                        onClick={() => { if (newPerson.trim()) { setPeople((p) => [...p, newPerson.trim()]); setNewPerson(''); } }}
                        className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center press shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="bg-brand-50 rounded-xl p-3 text-sm text-brand-700 font-medium">
                      {people.length} people splitting {formatRp(grandTotal)} · avg {formatRp(Math.round(grandTotal / Math.max(1, people.length)))} / person
                    </div>
                  </motion.div>
                )}

                {step === 'assign' && (
                  <motion.div key="assign" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <div className="text-sm text-ink-500">Tap to mark who ordered each item (multiple people can share one item).</div>
                    {unassignedItems.length > 0 && (
                      <div className="bg-amber-50 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
                        ⚠️ {unassignedItems.length} item(s) unassigned — they'll be split evenly
                      </div>
                    )}
                    {items.map((item) => (
                      <div key={item.id} className="bg-white border border-ink-100 rounded-2xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-ink-900 text-sm">{item.name}</span>
                          <span className="text-sm font-bold text-brand-600">{formatRp(item.price)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {people.map((person) => {
                            const assigned = item.sharedBy.includes(person);
                            return (
                              <button
                                key={person}
                                onClick={() => toggleAssign(item.id, person)}
                                className={`px-2.5 py-1.5 rounded-full text-xs font-semibold press transition-colors ${assigned ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-600'}`}
                              >
                                {assigned && <Check className="w-3 h-3 inline mr-1" />}{person}
                                {assigned && item.sharedBy.length > 1 && ` (${formatRp(Math.round(item.price / item.sharedBy.length))})`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {step === 'summary' && (
                  <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <div className="bg-brand-50 rounded-2xl p-3 flex items-center justify-between">
                      <span className="font-bold text-ink-900">{billName}</span>
                      <span className="text-brand-600 font-extrabold">{formatRp(grandTotal)}</span>
                    </div>

                    {/* Who paid? */}
                    <div>
                      <div className="text-xs font-bold text-ink-500 mb-2">WHO PAID?</div>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {['Nobody yet', ...people].map((p) => (
                          <button
                            key={p}
                            onClick={() => setPayer(p)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold press transition-colors ${payer === p ? 'bg-brand-500 text-white' : 'bg-ink-50 text-ink-700'}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Per-person breakdown */}
                    <div className="space-y-2">
                      {perPersonBreakdown.map(({ person, myTax, myService, total, items: pItems }) => (
                        <div key={person} className="bg-white border border-ink-100 rounded-2xl p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-xs font-bold text-brand-600">{person[0]}</div>
                              <span className="font-semibold text-ink-900 text-sm">{person}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold text-ink-900">{formatRp(total)}</div>
                              {payer && payer !== 'Nobody yet' && payer !== person && (
                                <div className="text-[10px] text-red-500 font-semibold">owes {payer}</div>
                              )}
                              {payer === person && <div className="text-[10px] text-emerald-600 font-semibold">paid · gets back {formatRp(grandTotal - total)}</div>}
                            </div>
                          </div>
                          {pItems.length > 0 && (
                            <div className="text-[11px] text-ink-500 pl-10 space-y-0.5">
                              {pItems.map((i) => (
                                <div key={i.id} className="flex justify-between">
                                  <span className="truncate max-w-[140px]">{i.name}{i.sharedBy.length > 1 ? ` ÷${i.sharedBy.length}` : ''}</span>
                                  <span>{formatRp(Math.round(i.price / i.sharedBy.length))}</span>
                                </div>
                              ))}
                              {(myTax > 0 || myService > 0) && (
                                <div className="flex justify-between text-ink-400">
                                  <span>Tax + Service</span>
                                  <span>{formatRp(myTax + myService)}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {pItems.length === 0 && (
                            <div className="text-[11px] text-ink-400 pl-10">Even split (unassigned items)</div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setShared(true)}
                        className="h-11 rounded-2xl bg-ink-50 text-ink-800 font-semibold press inline-flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-4 h-4" /> {shared ? 'Copied!' : 'Share'}
                      </button>
                      <button onClick={handleConfirm} className="h-11 rounded-2xl bg-brand-500 text-white font-bold shadow-glow press inline-flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Confirm
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step navigation buttons */}
            <div className="px-5 pb-6 pt-2 flex gap-2 shrink-0 border-t border-ink-50">
              {stepIdx > 0 && (
                <button onClick={() => setStep(STEPS[stepIdx - 1].id)} className="h-11 px-4 rounded-2xl bg-ink-50 text-ink-700 font-semibold press inline-flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              {stepIdx < STEPS.length - 1 && (
                <button onClick={() => setStep(STEPS[stepIdx + 1].id)} className="flex-1 h-11 rounded-2xl bg-brand-500 text-white font-bold press inline-flex items-center justify-center gap-1 shadow-glow">
                  Next: {STEPS[stepIdx + 1].label} <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
