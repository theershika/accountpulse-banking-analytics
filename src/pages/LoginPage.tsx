import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Shield, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageId } from '../components/common/Sidebar';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateToRegister: () => void;
  onNavigateToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateToRegister,
  onNavigateToLanding
}) => {
  const { login, quickLogin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Failed to authenticate.');
    }
  };

  const handleQuick = async (role: 'alice' | 'bob' | 'admin') => {
    setError(null);
    await quickLogin(role);
    onSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <button
            onClick={onNavigateToLanding}
            className="inline-flex items-center space-x-2 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-lg shadow-lg shadow-emerald-600/30">
              AP
            </div>
            <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-500 transition-colors">
              AccountPulse
            </span>
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Secure Client Sign In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your demo banking dashboard and balances
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@demo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5" />
              <span>Remember demo device</span>
            </label>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer hover:underline">
              Demo OTP Login
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fast Fill for Evaluator / Teacher presentation */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            College Evaluator 1-Click Logins:
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuick('alice')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 font-semibold border border-transparent hover:border-emerald-500/30 transition text-[11px]"
            >
              Alice ($43k)
            </button>
            <button
              type="button"
              onClick={() => handleQuick('bob')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 font-semibold border border-transparent hover:border-emerald-500/30 transition text-[11px]"
            >
              Bob ($16k)
            </button>
            <button
              type="button"
              onClick={() => handleQuick('admin')}
              className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20 hover:bg-purple-500/20 transition text-[11px]"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Need a new demo account? </span>
          <button
            onClick={onNavigateToRegister}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Register Here
          </button>
        </div>
      </div>
    </div>
  );
};
