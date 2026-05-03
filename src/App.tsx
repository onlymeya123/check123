import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PhoneFrame from './components/PhoneFrame';
import BottomNav from './components/BottomNav';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import Buddy from './components/Buddy';

import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import GeneratePage from './pages/GeneratePage';
import MapPage from './pages/MapPage';
import NavigatePage from './pages/NavigatePage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';

function AppRoutes() {
  const [buddyOpen, setBuddyOpen] = useState(false);
  const { isOnboarded, isNavigating } = useApp();

  if (!isOnboarded) {
    return (
      <div className="flex-1 relative overflow-hidden">
        <Routes>
          <Route path="*" element={<OnboardingPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/navigate" element={<NavigatePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isNavigating && <BottomNav onBuddyOpen={() => setBuddyOpen(true)} />}
      {isNavigating && <BottomNav onBuddyOpen={() => setBuddyOpen(true)} />}
      <Buddy open={buddyOpen} onClose={() => setBuddyOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <PhoneFrame>
          <AppRoutes />
        </PhoneFrame>
      </ToastProvider>
    </AppProvider>
  );
}
