import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { PLACES, pickItinerary, type Place, type Vibe } from '../data/places';
import { DEFAULT_TRIP, BUDGET_TOTAL, type Transaction, type Trip, type Currency } from '../data/wallet';

interface AppState {
  // Vibe & itinerary
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

  // Multi-trip wallet
  trips: Trip[];
  activeTripId: string;
  setActiveTripId: (id: string) => void;
  activeTrip: Trip;
  createTrip: (data: Omit<Trip, 'id' | 'transactions' | 'createdAt'>) => string;
  deleteTrip: (id: string) => void;

  // Active trip proxies (for backward compat)
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'date'> & { date?: string }) => void;
  budgetTotal: number;
  totalSpent: number;
  tripBudget: number;
  setTripBudget: (n: number) => void;
  tripName: string;
  setTripName: (s: string) => void;
  tripDays: number;
  tripDaysRemaining: number;
  setTripDaysRemaining: (n: number) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  dailyAllowance: number;

  // Navigation
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [navIndex, setNavIndex] = useState(0);
  const [visited, setVisited] = useState<Set<string>>(new Set());

  // Multi-trip state
  const [trips, setTrips] = useState<Trip[]>([DEFAULT_TRIP]);
  const [activeTripId, setActiveTripId] = useState<string>(DEFAULT_TRIP.id);

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeTripId) ?? trips[0],
    [trips, activeTripId],
  );

  const updateActiveTrip = (updater: (trip: Trip) => Trip) => {
    setTrips((prev) => prev.map((t) => t.id === activeTripId ? updater(t) : t));
  };

  const totalSpent = useMemo(
    () => activeTrip.transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
    [activeTrip.transactions],
  );

  const dailyAllowance = useMemo(() => {
    const remaining = activeTrip.budget - totalSpent;
    return activeTrip.daysRemaining > 0 ? Math.max(0, remaining / activeTrip.daysRemaining) : 0;
  }, [activeTrip.budget, totalSpent, activeTrip.daysRemaining]);

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

    // Multi-trip
    trips,
    activeTripId,
    setActiveTripId,
    activeTrip,
    createTrip: (data) => {
      const id = `trip-${Math.random().toString(36).slice(2, 9)}`;
      const newTrip: Trip = { ...data, id, transactions: [], createdAt: new Date().toISOString() };
      setTrips((prev) => [...prev, newTrip]);
      setActiveTripId(id);
      return id;
    },
    deleteTrip: (id) => {
      if (trips.length <= 1) return;
      setTrips((prev) => prev.filter((t) => t.id !== id));
      if (activeTripId === id) {
        setActiveTripId(trips.find((t) => t.id !== id)?.id ?? trips[0].id);
      }
    },

    // Active trip proxies
    transactions: activeTrip.transactions,
    addTransaction: (t) => {
      const txn: Transaction = {
        id: `t${Math.random().toString(36).slice(2, 9)}`,
        date: t.date ?? new Date().toISOString(),
        ...t,
      };
      updateActiveTrip((trip) => ({ ...trip, transactions: [txn, ...trip.transactions] }));
    },
    budgetTotal: BUDGET_TOTAL,
    totalSpent,
    tripBudget: activeTrip.budget,
    setTripBudget: (n) => updateActiveTrip((t) => ({ ...t, budget: n })),
    tripName: activeTrip.name,
    setTripName: (s) => updateActiveTrip((t) => ({ ...t, name: s })),
    tripDays: activeTrip.daysTotal,
    tripDaysRemaining: activeTrip.daysRemaining,
    setTripDaysRemaining: (n) => updateActiveTrip((t) => ({ ...t, daysRemaining: n })),
    currency: activeTrip.currency,
    setCurrency: (c) => updateActiveTrip((t) => ({ ...t, currency: c })),
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
