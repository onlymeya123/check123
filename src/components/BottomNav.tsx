import { Home, MapPin, Wallet, User, Smile, Navigation } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface Props {
  onBuddyOpen: () => void;
}

export default function BottomNav({ onBuddyOpen }: Props) {
  const { pathname } = useLocation();
  if (pathname.startsWith('/navigate')) return null;

  return (
    <>
      <NavigationIndicator />
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
            <div />
            <NavTab to="/wallet" icon={Wallet} label="Wallet" />
            <NavTab to="/profile" icon={User} label="Profile" />
          </div>
        </div>
      </div>
    </>
  );
}

function NavigationIndicator() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { isNavigating, itinerary, navIndex } = useApp();

  if (!isNavigating || pathname === '/navigate') return null;

  const current = itinerary[navIndex];

  return (
    <AnimatePresence>
      <motion.button
        key="nav-indicator"
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -48, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        onClick={() => nav('/navigate')}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-brand-500 text-white rounded-full pl-2 pr-4 py-1.5 shadow-glow press whitespace-nowrap"
      >
        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Navigation className="w-3.5 h-3.5" />
        </span>
        <span className="text-xs font-bold">On the way</span>
        {current && (
          <span className="text-xs opacity-75 font-medium truncate max-w-[100px]">· {current.name}</span>
        )}
      </motion.button>
    </AnimatePresence>
  );
}

function NavTab({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 py-1 transition-colors ${isActive ? 'text-brand-500' : 'text-ink-400'}`
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
