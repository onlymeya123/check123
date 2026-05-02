import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import PhoneFrame from './components/PhoneFrame';
import BottomNav from './components/BottomNav';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import Buddy from './components/Buddy';

import HomePage from './pages/HomePage';
import GeneratePage from './pages/GeneratePage';
import MapPage from './pages/MapPage';
import NavigatePage from './pages/NavigatePage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [buddyOpen, setBuddyOpen] = useState(false);

  return (
    <AppProvider>
      <ToastProvider>
        <PhoneFrame>
          <div className="flex-1 relative overflow-hidden">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/navigate" element={<NavigatePage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
            <BottomNav onBuddyOpen={() => setBuddyOpen(true)} />
            <Buddy open={buddyOpen} onClose={() => setBuddyOpen(false)} />
          </div>
        </PhoneFrame>
      </ToastProvider>
    </AppProvider>
  );
}
