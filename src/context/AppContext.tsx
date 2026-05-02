import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { PLACES, pickItinerary, type Place, type Vibe } from '../data/places';
import { SEED_TXNS, BUDGET_TOTAL, type Transaction, type TxnCategory } from '../data/wallet';

interface AppState {
  vibe: Vibe;
  setVibe: (v: Vibe) => void;
  budget: number;
  setBudget: (b: number) => void;
  surpriseMode: boolean;
  setSurpriseMode: (v: boolean) => void;
  itinerary: Place[];
  setItinerary: (p: Place[]) => void;
  buildItinerary: () => Place[];
  reorderStop: (from: number, to: number) => void;
  removeStop: (id: string) => void;
  replaceStop: (id: string, withPlace: Place) => void;
  addStop: (p: Place) => void;
  alternatives: (excludeIds: string[]) => Place[];
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'date'> & { date?: string }) => void;
  budgetTotal: number;
  totalSpent: number;
  balance: number;
  topUp: (amt: number) => void;
  // Trip budget management
  tripBudget: number;
  setTripBudget: (n: number) => void;
  tripName: string;
  setTripName: (s: string) => void;
  tripDays: number;
  setTripDays: (n: number) => void;
  tripDaysRemaining: number;
  setTripDaysRemaining: (n: number) => void;
  dailyAllowance: number;
  isNavigating: boolean;
  setIsNavigating: (v: boolean) => void;
  navIndex: number;
  setNavIndex: (i: number) => void;
  visited: Set<string>;
  markVisited: (id: string) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [vibe, setVibe] = useState<Vibe>('zen');
  const [budget, setBudget] = useState<number>(500_000);
  const [surpriseMode, setSurpriseMode] = useState(false);
  const [itinerary, setItinerary] = useState<Place[]>([
    PLACES[0], PLACES[1], PLACES[2], PLACES[3],
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TXNS);
  const [balance, setBalance] = useState<number>(2_560_000);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navIndex, setNavIndex] = useState(0);
  const [visited, setVisited] = useState<Set<string>>(new Set());

  // Trip budget state
  const [tripBudget, setTripBudget] = useState<number>(BUDGET_TOTAL);
  const [tripName, setTripName] = useState<string>('Ubud Trip');
  const [tripDays, setTripDays] = useState<number>(5);
  const [tripDaysRemaining, setTripDaysRemaining] = useState<number>(3);

  const totalSpent = useMemo(
    () => transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
    [transactions],
  );

  const dailyAllowance = useMemo(() => {
    const remaining = tripBudget - totalSpent;
    return tripDaysRemaining > 0 ? Math.max(0, remaining / tripDaysRemaining) : 0;
  }, [tripBudget, totalSpent, tripDaysRemaining]);

  const value: AppState = {
    vibe, setVibe,
    budget, setBudget,
    surpriseMode, setSurpriseMode,
    itinerary, setItinerary,
    buildItinerary: () => pickItinerary(vibe, budget, surpriseMode),
    reorderStop: (from, to) => {
      setItinerary((cur) => {
        const next = cur.slice();
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
      });
    },
    removeStop: (id) => setItinerary((cur) => cur.filter((p) => p.id !== id)),
    replaceStop: (id, withPlace) =>
      setItinerary((cur) => cur.map((p) => (p.id === id ? withPlace : p))),
    addStop: (p) =>
      setItinerary((cur) => (cur.find((x) => x.id === p.id) ? cur : [...cur, p])),
    alternatives: (excludeIds) => PLACES.filter((p) => !excludeIds.includes(p.id)).slice(0, 8),
    transactions,
    addTransaction: (t) => {
      const txn: Transaction = {
        id: `t${Math.random().toString(36).slice(2, 9)}`,
        date: t.date ?? new Date().toISOString(),
        ...t,
      };
      setTransactions((cur) => [txn, ...cur]);
      setBalance((b) => b + txn.amount);
    },
    budgetTotal: BUDGET_TOTAL,
    totalSpent,
    balance,
    topUp: (amt) => {
      setBalance((b) => b + amt);
      setTransactions((cur) => [
        {
          id: `t${Math.random().toString(36).slice(2, 9)}`,
          title: 'Top Up',
          category: 'Top up' as TxnCategory,
          amount: amt,
          date: new Date().toISOString(),
          icon: '💳',
          tag: 'Top up',
        },
        ...cur,
      ]);
    },
    tripBudget, setTripBudget,
    tripName, setTripName,
    tripDays, setTripDays,
    tripDaysRemaining, setTripDaysRemaining,
    dailyAllowance,
    isNavigating, setIsNavigating,
    navIndex, setNavIndex,
    visited,
    markVisited: (id) => setVisited((cur) => new Set(cur).add(id)),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
