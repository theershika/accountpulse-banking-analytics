import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Send,
  History,
  User,
  ShieldCheck,
  Home,
  X,
  CreditCard,
  Building2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type PageId =
  | 'landing'
  | 'dashboard'
  | 'balance'
  | 'deposit'
  | 'withdraw'
  | 'transfer'
  | 'history'
  | 'profile'
  | 'admin';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose
}) => {
  const { currentUser } = useAuth();

  const navItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'balance' as PageId, label: 'Account Balance', icon: Wallet },
    { id: 'deposit' as PageId, label: 'Deposit Money', icon: ArrowDownCircle },
    { id: 'withdraw' as PageId, label: 'Withdraw Money', icon: ArrowUpCircle },
    { id: 'transfer' as PageId, label: 'Transfer Funds', icon: Send },
    { id: 'history' as PageId, label: 'Transactions', icon: History },
    { id: 'profile' as PageId, label: 'User Profile', icon: User },
  ];

  const handleItemClick = (page: PageId) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-all duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={() => handleItemClick('landing')}
            className="flex items-center space-x-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-base shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              NV
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base block group-hover:text-emerald-500 transition-colors">
                AccountPulse
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider block">
                Digital Banking
              </span>
            </div>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Banking Services
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin Dashboard Section (Visible if admin or quick review) */}
          <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-purple-500 uppercase tracking-wider flex items-center justify-between">
            <span>Administration</span>
            {currentUser?.role === 'admin' ? (
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            ) : null}
          </div>

          <button
            onClick={() => handleItemClick('admin')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              currentPage === 'admin'
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${currentPage === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-purple-400'}`} />
            <div className="flex-1 text-left flex items-center justify-between">
              <span>Admin Console</span>
              {currentUser?.role !== 'admin' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Demo
                </span>
              )}
            </div>
          </button>

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Public Showcase
          </div>

          <button
            onClick={() => handleItemClick('landing')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              currentPage === 'landing'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Landing Page</span>
          </button>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 text-xs">
            <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>College Project Demo</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Full-stack banking simulation built with React, TypeScript, Tailwind & Firebase.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
