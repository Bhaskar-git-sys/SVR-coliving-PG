import { useState, useEffect, useCallback } from 'react';
import AuthPage from '@/components/AuthPage';
import DashboardLayout from '@/components/DashboardLayout';
import RoomChart from '@/components/RoomChart';
import ResidentsPage from '@/components/ResidentsPage';
import SettingsPage from '@/components/SettingsPage';
import OwnerProfilePage from '@/components/OwnerProfilePage';
import WelcomePage from '@/components/WelcomePage';
import type { Page, OwnerAccount, PGData } from '@/types';
import {
  getOwnerAccount,
  getOwnerSession,
  clearOwnerSession,
  getPGData,
  savePGData,
} from '@/lib/storage';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [owner, setOwner] = useState<OwnerAccount | null>(null);
  const [page, setPage] = useState<Page>('rooms');
  const [showWelcome, setShowWelcome] = useState(false);
  const [pgData, setPgData] = useState<PGData | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const session = getOwnerSession();
    const account = getOwnerAccount();
    if (session.loggedIn && account) {
      setLoggedIn(true);
      setOwner(account);
    }
    const data = getPGData();
    setPgData(data);
    setBooted(true);
  }, []);

  useEffect(() => {
    if (page === 'payments') setPage('rooms');
  }, [page]);

  const handleLogin = useCallback(() => {
    const account = getOwnerAccount();
    setOwner(account);
    setLoggedIn(true);
    setPage('rooms');
    setShowWelcome(true);
  }, []);

  const handleLogout = useCallback(() => {
    clearOwnerSession();
    setLoggedIn(false);
    setOwner(null);
    setPage('rooms');
    setShowWelcome(false);
  }, []);

  const handleOwnerReset = useCallback(() => {
    clearOwnerSession();
    setLoggedIn(false);
    setOwner(null);
    setShowWelcome(false);
    setPgData(getPGData());
  }, []);

  const updatePGData = useCallback((data: PGData) => {
    savePGData(data);
    setPgData(data);
  }, []);

  if (!booted) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!loggedIn || !owner || !pgData) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (showWelcome) {
    return <WelcomePage pgName={owner.pgName} onContinue={() => setShowWelcome(false)} />;
  }

  return (
    <DashboardLayout page={page} setPage={setPage} owner={owner} onLogout={handleLogout}>
      {page === 'rooms' && <RoomChart data={pgData} setData={updatePGData} />}
      {page === 'residents' && <ResidentsPage data={pgData} setData={updatePGData} />}
      {page === 'settings' && (
        <SettingsPage data={pgData} setData={updatePGData} onOwnerReset={handleOwnerReset} />
      )}
      {page === 'profile' && <OwnerProfilePage owner={owner} setOwner={setOwner} />}
    </DashboardLayout>
  );
}

export default App;
