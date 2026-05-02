import { Home, MapPin, Wallet, User, Smile } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Props {
  onBuddyOpen: () => void;
}

export default function BottomNav({ onBuddyOpen }: Props) {
  const { pathname } = useLocation();
  // hide nav in navigation mode
  if (pathname.startsWith('/navigate')) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="relative">
        <div className="absolute inset-x-0 -top-6 flex justify-center pointer-events-none">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            onClick={onBuddyOpen}
            className="pointer-events-auto w-16 h-16 rounded-full bg-brand-500 text-white shadow-glow flex items-center justify-center ring-4 ring-white"
            aria-label="Open Buddy"
          >
            <Smile className="w-7 h-7" strokeWidth={2.4} />
          </motion.button>
        </div>

        <div className="bg-white border-t border-ink-100 grid grid-cols-5 px-2 pt-3 pb-3">
          <NavTab to="/" icon={Home} label="Home" />
          <NavTab to="/map" icon={MapPin} label="Map" />
          <div /> {/* center FAB spacer */}
          <NavTab to="/wallet" icon={Wallet} label="Wallet" />
          <NavTab to="/profile" icon={User} label="Profile" />
        </div>
      </div>
    </div>
  );
}

function NavTab({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 py-1 transition-colors ${
          isActive ? 'text-brand-500' : 'text-ink-400'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="w-6 h-6" strokeWidth={isActive ? 2.6 : 2} />
          <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
        </>
      )}
    </NavLink>
  );
}
