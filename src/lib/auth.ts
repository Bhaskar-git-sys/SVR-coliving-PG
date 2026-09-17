import type { AppUser, Role } from '@/types';

const SESSION_KEY = 'svr_app_session';
const USERS: Record<string, { password: string; role: Role }> = {
  Manjunath: { password: 'Svr@143', role: 'ADMIN' },
  vinod: { password: 'vinod@143', role: 'CUSTOMER' },
};

export function authenticate(username: string, password: string): AppUser | null {
  const key = Object.keys(USERS).find((name) => name.toLowerCase() === username.trim().toLowerCase());
  const account = key ? USERS[key] : undefined;
  if (!account || account.password !== password) return null;
  const user = { username: key, role: account.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function getCurrentUser(): AppUser | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as AppUser | null; } catch { return null; }
}
export function clearAuth(): void { localStorage.removeItem(SESSION_KEY); }
export function isAdmin(user: AppUser | null): boolean { return user?.role === 'ADMIN'; }
export function canAddCustomer(user: AppUser | null): boolean { return user?.role === 'ADMIN' || user?.role === 'CUSTOMER'; }
