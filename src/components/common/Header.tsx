import React, { useState } from 'react';
import {
  Menu,
  Moon,
  Sun,
  Bell,
  LogOut,
  Shield,
  ChevronDown,
  Flame,
  Check,
  UserCheck,
  Lock,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenFirebaseModal: () => void;
  currentPageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenFirebaseModal,
  currentPageTitle
}) => {
  const { currentUser, logout, quickLogin, isAuthenticatedLiveUser, isFirebaseLive } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'NEFT Salary Credited: ₹1,25,000.00', time: '10m ago', unread: true },
    { id: 2, title: 'UPI 2FA Security Shield Active', time: '1h ago', unread: false },
    { id: 3, title: 'Welcome to AccountPulse INR Banking', time: '1d ago', unread: false }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 h-16 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>{currentPageTitle}</span>
            {currentUser?.role === 'admin' ? (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                SuperAdmin
              </span>
            ) : (
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                ₹ INR
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* If signed in as live authenticated user, show secure badge.
            If in sandbox demo mode, provide 1-click persona switching for evaluator */}
        {isAuthenticatedLiveUser ? (
          <div className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Authenticated Live User</span>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => {
                setShowSwitchMenu(!showSwitchMenu);
                setShowUserMenu(false);
                setShowNotifications(false);
              }}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
              title="Switch Demo Persona"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Switch Demo Persona</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {showSwitchMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-40 animate-slide-up text-xs">
                <div className="px-2.5 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Evaluator Demo Personas (INR)
                </div>
                <button
                  onClick={() => { quickLogin('alice'); setShowSwitchMenu(false); }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition ${currentUser?.email === 'alice@demo.com' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  <div>
                    <span className="block font-semibold">Alice Johnson</span>
                    <span className="text-[10px] text-slate-400 font-mono">₹6,35,000 Total</span>
                  </div>
                  {currentUser?.email === 'alice@demo.com' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { quickLogin('bob'); setShowSwitchMenu(false); }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition ${currentUser?.email === 'bob@demo.com' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  <div>
                    <span className="block font-semibold">Bob Smith</span>
                    <span className="text-[10px] text-slate-400 font-mono">₹1,62,500 Total</span>
                  </div>
                  {currentUser?.email === 'bob@demo.com' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { quickLogin('carlos'); setShowSwitchMenu(false); }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition ${currentUser?.email === 'carlos@demo.com' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  <div>
                    <span className="block font-semibold">Carlos Rodriguez</span>
                    <span className="text-[10px] text-slate-400 font-mono">₹3,45,000 Total</span>
                  </div>
                  {currentUser?.email === 'carlos@demo.com' && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  onClick={() => { quickLogin('admin'); setShowSwitchMenu(false); }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition ${currentUser?.role === 'admin' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-600 dark:text-purple-400'}`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <div>
                      <span className="block font-semibold">Operations Admin</span>
                      <span className="text-[10px] text-purple-400 font-mono">₹1.75 Cr Liquidity</span>
                    </div>
                  </div>
                  {currentUser?.role === 'admin' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Public Hosting / Firebase Setup Modal Trigger */}
        <button
          onClick={onOpenFirebaseModal}
          className="p-2 rounded-xl text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1"
          title="Cloud Deploy & Firebase Hosting Details"
        >
          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Tray */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              setShowSwitchMenu(false);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-40 animate-slide-up text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Activity Alerts</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Mark read</span>
              </div>
              <div className="py-2 space-y-2">
                {notifications.map(n => (
                  <div key={n.id} className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-start space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Pill / Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
              setShowSwitchMenu(false);
            }}
            className="flex items-center space-x-2 p-1.5 sm:px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {currentUser?.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'NV'}
            </div>
            <div className="hidden md:block text-left">
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {currentUser?.displayName || 'Guest User'}
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {currentUser?.upiId || currentUser?.accountNumber || 'NV-0000-0000'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-40 animate-slide-up text-xs">
              <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-xl mb-2">
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                  {currentUser?.email}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Total Balance</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatCurrency((currentUser?.checkingBalance || 0) + (currentUser?.savingsBalance || 0))}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center space-x-2 p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
