import { Signal, Wifi, BatteryFull } from 'lucide-react';

export default function StatusBar({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const color = tone === 'light' ? 'text-white' : 'text-ink-900';
  return (
    <div className={`flex items-center justify-between px-6 pt-3 pb-1 text-[14px] font-semibold ${color}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal className="w-4 h-4" />
        <Wifi className="w-4 h-4" />
        <BatteryFull className="w-5 h-5" />
      </div>
    </div>
  );
}
