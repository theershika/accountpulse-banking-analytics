import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import { BankingService } from '../services/bankingService';
import { UserAccount, CurrencyCode } from '../types';

interface AuthContextType {
  currentUser: UserAccount | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, initialBalance: number) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  quickLogin: (type: 'alice' | 'bob' | 'carlos' | 'admin') => Promise<void>;
  refreshUser: () => Promise<void>;
  isFirebaseLive: boolean;
  isAuthenticatedLiveUser: boolean; // True when signed in with real Firebase Auth credentials
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const CURRENT_SESSION_KEY = 'novavault_active_session_uid_inr';
const IS_FIREBASE_AUTH_KEY = 'novavault_is_firebase_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticatedLiveUser, setIsAuthenticatedLiveUser] = useState<boolean>(false);

  // Initialize session on load
  useEffect(() => {
    let unsubscribe = () => {};

    const initAuth = async () => {
      try {
        const response = await fetch('/api/me', { credentials: 'same-origin' });
        if (response.ok) {
          setCurrentUser(await response.json());
          setIsAuthenticatedLiveUser(true);
          setLoading(false);
          return;
        }
      } catch (_) { /* local development fallback below */ }
      // 1. If Firebase Auth is configured and active
      if (isFirebaseConfigured && auth) {
        unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            const acc = await BankingService.getUserAccount(fbUser.uid);
            setCurrentUser(acc);
            setIsAuthenticatedLiveUser(true);
            localStorage.setItem(IS_FIREBASE_AUTH_KEY, 'true');
          } else {
            // Check fallback local active session if any
            const isRealAuth = localStorage.getItem(IS_FIREBASE_AUTH_KEY) === 'true';
            setIsAuthenticatedLiveUser(isRealAuth);
            const savedUid = localStorage.getItem(CURRENT_SESSION_KEY);
            if (savedUid) {
              const localAcc = await BankingService.getUserAccount(savedUid);
              setCurrentUser(localAcc);
            } else {
              // Default to Alice Johnson for demo sandbox preview
              const defaultAlice = await BankingService.getUserAccount('demo-alice-uid');
              setCurrentUser(defaultAlice);
              if (defaultAlice) localStorage.setItem(CURRENT_SESSION_KEY, defaultAlice.uid);
            }
          }
          setLoading(false);
        });
      } else {
        // Local simulation mode: retrieve stored session or Alice Johnson
        const savedUid = localStorage.getItem(CURRENT_SESSION_KEY);
        if (savedUid) {
          const acc = await BankingService.getUserAccount(savedUid);
          setCurrentUser(acc);
        } else {
          const defaultAlice = await BankingService.getUserAccount('demo-alice-uid');
          setCurrentUser(defaultAlice);
          if (defaultAlice) localStorage.setItem(CURRENT_SESSION_KEY, defaultAlice.uid);
        }
        setIsAuthenticatedLiveUser(false);
        setLoading(false);
      }
    };

    initAuth();
    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (!currentUser) return;
    const updated = await BankingService.getUserAccount(currentUser.uid);
    if (updated) {
      setCurrentUser({ ...updated });
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: cleanEmail, password: pass }) });
      const body = await response.json();
      if (response.ok) { setCurrentUser(body); setIsAuthenticatedLiveUser(true); setLoading(false); return { success: true }; }
      if (response.status !== 404) { setLoading(false); return { success: false, error: body.error || 'Unable to sign in.' }; }
    } catch (_) { /* local development fallback */ }

    // Check Firebase live auth if available
    if (isFirebaseConfigured && auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const acc = await BankingService.getUserAccount(res.user.uid);
        if (acc) {
          setCurrentUser(acc);
          setIsAuthenticatedLiveUser(true);
          localStorage.setItem(CURRENT_SESSION_KEY, acc.uid);
          localStorage.setItem(IS_FIREBASE_AUTH_KEY, 'true');
          setLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Firebase login failed, checking demo users:', err);
      }
    }

    // Demo/Local login fallback
    const allUsers = await BankingService.getAllUsers();
    const matched = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (matched) {
      setCurrentUser(matched);
      setIsAuthenticatedLiveUser(false);
      localStorage.setItem(CURRENT_SESSION_KEY, matched.uid);
      localStorage.removeItem(IS_FIREBASE_AUTH_KEY);
      setLoading(false);
      return { success: true };
    }

    setLoading(false);
    return { success: false, error: 'Invalid email or password. You can also use the Quick Demo Logins below.' };
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    initialBalance: number = 50000
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const response = await fetch('/api/auth/register', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), email: cleanEmail, password: pass }) });
      const body = await response.json();
      if (response.ok) { setCurrentUser(body); setIsAuthenticatedLiveUser(true); setLoading(false); return { success: true }; }
      if (response.status !== 404) { setLoading(false); return { success: false, error: body.error || 'Unable to create account.' }; }
    } catch (_) { /* local development fallback */ }

    // Check if email already registered
    const existing = await BankingService.findAccountByEmail(cleanEmail);
    if (existing) {
      setLoading(false);
      return { success: false, error: 'An account with this email address already exists.' };
    }

    let uid = `user-${Date.now()}`;
    let isLiveAuth = false;

    // Firebase Auth registration
    if (isFirebaseConfigured && auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        uid = res.user.uid;
        isLiveAuth = true;
      } catch (err: any) {
        console.warn('Firebase auth registration failed, proceeding in local storage:', err);
      }
    }

    try {
      const newAcc = await BankingService.createUserAccount({
        uid,
        email: cleanEmail,
        displayName: name.trim(),
        role: 'user',
        currency: 'INR',
        checkingBalance: initialBalance,
        savingsBalance: Math.round(initialBalance * 0.5)
      });

      setCurrentUser(newAcc);
      setIsAuthenticatedLiveUser(isLiveAuth);
      localStorage.setItem(CURRENT_SESSION_KEY, newAcc.uid);
      if (isLiveAuth) {
        localStorage.setItem(IS_FIREBASE_AUTH_KEY, 'true');
      } else {
        localStorage.removeItem(IS_FIREBASE_AUTH_KEY);
      }
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Failed to create demo INR account.' };
    }
  };

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); } catch (_) { /* local fallback */ }
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Signout error:', err);
      }
    }
    localStorage.removeItem(CURRENT_SESSION_KEY);
    localStorage.removeItem(IS_FIREBASE_AUTH_KEY);
    setIsAuthenticatedLiveUser(false);
    setCurrentUser(null);
  };

  const quickLogin = async (type: 'alice' | 'bob' | 'carlos' | 'admin') => {
    // In accordance with Requirement 2 (item 12):
    // Disable insecure user switching if signed in as a real live authenticated user!
    if (isAuthenticatedLiveUser) {
      console.warn('User switching disabled for live authenticated accounts.');
      return;
    }

    setLoading(true);
    const map = {
      admin: 'demo-admin-uid',
      alice: 'demo-alice-uid',
      bob: 'demo-bob-uid',
      carlos: 'demo-carlos-uid'
    };
    const uid = map[type];
    const acc = await BankingService.getUserAccount(uid);
    if (acc) {
      setCurrentUser(acc);
      localStorage.setItem(CURRENT_SESSION_KEY, acc.uid);
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        logout,
        quickLogin,
        refreshUser,
        isFirebaseLive: isFirebaseConfigured,
        isAuthenticatedLiveUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
