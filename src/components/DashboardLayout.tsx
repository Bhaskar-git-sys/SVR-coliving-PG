import { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  Users,
  CreditCard,
  Settings,
  UserCircle,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import logo from '../assets/svr-logo.jpeg';
import type { Page, OwnerAccount } from '@/types';

interface DashboardLayoutProps {
  page: Page;
  setPage: (p: Page) => void;
  owner: OwnerAccount;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: Page; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'rooms', label: 'Room Chart', icon: LayoutGrid },
  { id: 'residents', label: 'PG Residents', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  page,
  setPage,
  owner,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 glass-dark border-b border-navy-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black/20 border border-gold-400/20 flex items-center justify-center shadow-lg shadow-gold-500/20 overflow-hidden">
                <img
                  src={logo}
                  alt="SVR logo"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-bold text-lg leading-none">{owner.pgName}</p>
                <p className="text-navy-300 text-xs mt-0.5">PG Management System</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    page === item.id
                      ? 'bg-gold-400/15 text-gold-300 border border-gold-400/20'
                      : 'text-navy-200 hover:text-white hover:bg-navy-700/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Owner Profile */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-navy-700/50 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center border border-gold-400/30">
                  <UserCircle className="w-5 h-5 text-gold-400" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold leading-none">{owner.name}</p>
                  <p className="text-navy-300 text-xs mt-0.5">Owner</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-navy-300 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-dark rounded-xl border border-navy-600 shadow-2xl overflow-hidden animate-scale-in">
                  <div className="p-3 border-b border-navy-700">
                    <p className="font-semibold text-sm">{owner.name}</p>
                    <p className="text-navy-300 text-xs truncate">{owner.email}</p>
                    <p className="text-gold-400 text-xs mt-1">{owner.pgName}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setPage('profile');
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-navy-100 hover:bg-navy-700/50 transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      Owner Profile
                    </button>
                    <button
                      onClick={() => {
                        setPage('settings');
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-navy-100 hover:bg-navy-700/50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      PG Settings
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="md:hidden flex items-center gap-1 overflow-x-auto pb-3 -mx-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  page === item.id
                    ? 'bg-gold-400/15 text-gold-300 border border-gold-400/20'
                    : 'text-navy-200 hover:text-white hover:bg-navy-700/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">{children}</main>
    </div>
  );
}
