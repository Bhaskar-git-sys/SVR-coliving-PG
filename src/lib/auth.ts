import type { AppUser, Role } from '@/types';

const SESSION_KEY = 'svr_app_session';

// The application has one predefined administrator account.
const USERNAME = 'Manjunath';
const PASSWORD = 'Svr@143';
const ROLE: Role = 'ADMIN';

export function authenticate(username: string, password: string): AppUser | null {
  if (username.trim().toLowerCase() !== USERNAME.toLowerCase() || password !== PASSWORD) {
    return null;
  }

  const user: AppUser = { username: USERNAME, role: ROLE };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function getCurrentUser(): AppUser | null {
  try {
    const user = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as AppUser | null;
    return user?.username === USERNAME && user.role === ROLE ? user : null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(SESSION_KEY);
}

export const isAdmin = (user: AppUser | null): boolean => user?.role === 'ADMIN';
export const canAddCustomer = (user: AppUser | null): boolean => user?.role === 'ADMIN';
