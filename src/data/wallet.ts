export type TxnTag = 'Great deal' | 'Over budget' | 'Saved' | 'Top up';
export type TxnCategory = 'Food & Drinks' | 'Attractions' | 'Transport' | 'Shopping' | 'Top up';

export interface Transaction {
  id: string;
  title: string;
  category: TxnCategory;
  amount: number; // negative = expense, positive = income
  date: string; // ISO
  icon: string; // emoji
  tag?: TxnTag;
  note?: string;
}

export const SEED_TXNS: Transaction[] = [
  { id: 't1', title: 'Seniman Coffee Studio', category: 'Food & Drinks', amount: -40000, date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), icon: '☕', tag: 'Great deal' },
  { id: 't2', title: 'Tirta Empul Temple', category: 'Attractions', amount: -50000, date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), icon: '🛕' },
  { id: 't3', title: 'Top Up from BCA', category: 'Top up', amount: 1000000, date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), icon: '💳', tag: 'Top up' },
  { id: 't4', title: 'Gojek Ride', category: 'Transport', amount: -28000, date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), icon: '🛵' },
  { id: 't5', title: 'Hujan Locale Dinner', category: 'Food & Drinks', amount: -220000, date: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), icon: '🍽️', tag: 'Over budget' },
  { id: 't6', title: 'Ubud Market Souvenirs', category: 'Shopping', amount: -140000, date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), icon: '🛍️' },
];

export const BUDGET_TOTAL = 3000000;

export const CATEGORY_COLORS: Record<TxnCategory, string> = {
  'Food & Drinks': '#3B5BFF',
  'Attractions': '#22C55E',
  'Transport': '#F59E0B',
  'Shopping': '#A855F7',
  'Top up': '#10B981',
};
