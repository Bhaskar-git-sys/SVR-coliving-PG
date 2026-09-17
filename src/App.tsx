import { useState, useEffect, useCallback } from 'react';
import AuthPage from '@/components/AuthPage';
import DashboardLayout from '@/components/DashboardLayout';
import RoomChart from '@/components/RoomChart';
import ResidentsPage from '@/components/ResidentsPage';
import PaymentsPage from '@/components/PaymentsPage';
import SettingsPage from '@/components/SettingsPage';
import OwnerProfilePage from '@/components/OwnerProfilePage';
import RevenuePage from '@/components/RevenuePage';
import type { Page, OwnerAccount, PGData, AppUser } from '@/types';
import { getOwnerAccount, getOwnerSession, clearOwnerSession, getPGData, savePGData } from '@/lib/storage';
import { clearAuth, getCurrentUser } from '@/lib/auth';

const fallbackOwner: OwnerAccount = { name: 'SVR Owner', email: '', mobile: '', password: '', pgName: 'SVR Co-Living PG', pgAddress: '' };
export default function App() {
  const [user, setUser] = useState<AppUser | null>(null); const [owner, setOwner] = useState<OwnerAccount | null>(null);
  const [page, setPage] = useState<Page>('rooms'); const [pgData, setPgData] = useState<PGData | null>(null); const [booted, setBooted] = useState(false);
  useEffect(() => { const current = getCurrentUser(); const data = getPGData(); if (current) { setUser(current); setOwner(getOwnerAccount() || fallbackOwner); } setPgData(data); setBooted(true); }, []);
  const login = useCallback(() => { const current = getCurrentUser(); if (current) { setUser(current); setOwner(getOwnerAccount() || fallbackOwner); setPage('rooms'); } }, []);
  const logout = useCallback(() => { clearAuth(); clearOwnerSession(); setUser(null); setOwner(null); setPage('rooms'); }, []);
  const update = useCallback((data: PGData) => { savePGData(data); setPgData(data); }, []);
  if (!booted) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || !owner || !pgData) return <AuthPage onLogin={login} />;
  const adminOnly = ['payments', 'revenue', 'settings', 'profile'].includes(page);
  if (user.role !== 'ADMIN' && adminOnly) { if (page !== 'rooms') setPage('rooms'); return <DashboardLayout page="rooms" setPage={setPage} owner={owner} user={user} onLogout={logout}><div className="glass-dark rounded-2xl p-10 text-center"><h1 className="font-display text-2xl font-bold">Access Denied</h1><p className="text-navy-300 mt-2">This area is available to administrators only.</p></div></DashboardLayout>; }
  return <DashboardLayout page={page} setPage={setPage} owner={owner} user={user} onLogout={logout}>
    {page === 'rooms' && <RoomChart data={pgData} setData={update} user={user} />}
    {page === 'residents' && <ResidentsPage data={pgData} setData={update} user={user} />}
    {page === 'payments' && <PaymentsPage data={pgData} setData={update} />}
    {page === 'revenue' && <RevenuePage data={pgData} />}
    {page === 'settings' && <SettingsPage data={pgData} setData={update} onOwnerReset={logout} />}
    {page === 'profile' && <OwnerProfilePage owner={owner} setOwner={setOwner} />}
  </DashboardLayout>;
}
