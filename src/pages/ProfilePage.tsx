import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Mail, Phone, MapPin, ChevronRight, Bookmark, Clock, CreditCard, HelpCircle, X, Crown } from 'lucide-react';
import { useState } from 'react';
import StatusBar from '../components/StatusBar';
import { USER } from '../data/user';
import { formatRp } from '../lib/format';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { visited } = useApp();
  const [statDetail, setStatDetail] = useState<null | string>(null);
  const stats = [
    { id: 'trips', label: 'Trips', value: USER.stats.trips },
    { id: 'places', label: 'Places\nExplored', value: USER.stats.placesExplored + visited.size },
    { id: 'gems', label: 'Hidden Gems\nFound', value: USER.stats.hiddenGems },
    { id: 'saved', label: 'Money\nSaved', value: formatRp(USER.stats.moneySaved) },
  ];

  return (
    <div className="absolute inset-0 bg-white overflow-y-auto pb-32 no-scrollbar">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pb-2">
        <div className="font-bold text-ink-900 text-lg font-display">PROFILE</div>
        <button className="w-9 h-9 rounded-full bg-ink-50 flex items-center justify-center press"><Settings className="w-4 h-4 text-ink-700" /></button>
      </div>

      {/* User card */}
      <div className="px-5">
        <div className="bg-white rounded-3xl p-4 border border-ink-100 shadow-soft flex gap-3">
          <motion.img
            whileHover={{ scale: 1.04 }}
            src={USER.avatar} alt="me"
            className="w-16 h-16 rounded-2xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="font-bold text-ink-900 font-display">{USER.name}</div>
              <button className="text-xs text-brand-600 font-semibold press">Edit Profile</button>
            </div>
            <div className="text-xs text-ink-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {USER.location}</div>
            <div className="text-xs text-ink-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {USER.email}</div>
            <div className="text-xs text-ink-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {USER.phone}</div>
          </div>
        </div>
      </div>

      {/* Persona */}
      <div className="px-5 mt-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-purple-50 to-brand-50 p-4 flex items-center gap-3"
        >
          <div className="w-11 h-11 rounded-2xl bg-white shadow-soft flex items-center justify-center">
            <Crown className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Persona Travelers</div>
            <div className="font-bold text-ink-900">{USER.persona.title}</div>
            <div className="text-xs text-ink-500">{USER.persona.subtitle}</div>
            <div className="mt-2 h-1.5 bg-white/70 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${USER.persona.progress * 100}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-brand-500 to-purple-500" />
            </div>
            <div className="text-[10px] text-ink-500 mt-1">Next: {USER.persona.nextLevel}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-ink-400" />
        </motion.div>
      </div>

      {/* Stats */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink-900 font-display">My Stats</div>
          <button className="text-xs text-brand-600 font-semibold press">See all ›</button>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {stats.map((s, i) => (
            <motion.button
              key={s.id}
              whileTap={{ scale: 0.94 }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setStatDetail(s.id)}
              className="bg-white border border-ink-100 rounded-2xl py-3 text-center press"
            >
              <div className="text-lg font-extrabold text-ink-900 font-display">{s.value}</div>
              <div className="text-[10px] text-ink-500 leading-tight whitespace-pre-line">{s.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between">
          <div className="font-bold text-ink-900 font-display">My Badges</div>
          <button className="text-xs text-brand-600 font-semibold press">See all ›</button>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {USER.badges.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 360, damping: 18 }}
              className="bg-white border border-ink-100 rounded-2xl p-2 text-center"
            >
              <div className="relative mx-auto w-12 h-14" style={{ background: `linear-gradient(180deg, ${b.color} 0%, ${b.color}AA 100%)`, clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">{b.icon}</div>
              </div>
              <div className="text-[10px] font-bold text-ink-900 mt-1 leading-tight">{b.name}</div>
              <div className="text-[9px] text-ink-500">{b.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings list */}
      <div className="px-5 mt-5 space-y-2">
        <Row icon={<Bookmark className="w-4 h-4" />} label="Saved Places" />
        <Row icon={<Clock className="w-4 h-4" />} label="Travel History" />
        <Row icon={<CreditCard className="w-4 h-4" />} label="Payment Methods" />
        <Row icon={<HelpCircle className="w-4 h-4" />} label="Help & Support" />
      </div>

      {/* Stat detail */}
      <AnimatePresence>
        {statDetail && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStatDetail(null)} className="absolute inset-0 z-40 bg-ink-900/40" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl p-5 shadow-card"
            >
              <div className="w-12 h-1.5 bg-ink-100 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="font-bold text-ink-900 font-display">Stat Detail</div>
                <button onClick={() => setStatDetail(null)} className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center press"><X className="w-4 h-4" /></button>
              </div>
              <div className="text-sm text-ink-700 mt-3 leading-relaxed">
                {{
                  trips: 'You\'ve completed 12 trips. Your most explored region is Bali (5 trips). Your average trip lasts 4 days.',
                  places: 'You\'ve visited 47 unique places. Cafes are your favorite category (38%).',
                  gems: '28 hidden gems unlocked. You\'re 4 away from "Hidden Gem Hunter" badge!',
                  saved: 'You\'ve saved Rp 450K thanks to deal alerts and budget-aware planning. Keep it up!',
                }[statDetail]}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full bg-white border border-ink-100 rounded-2xl px-4 py-3 flex items-center gap-3 press">
      <span className="w-8 h-8 rounded-full bg-ink-50 flex items-center justify-center text-ink-700">{icon}</span>
      <span className="flex-1 text-left text-sm font-semibold text-ink-900">{label}</span>
      <ChevronRight className="w-4 h-4 text-ink-400" />
    </button>
  );
}
