import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateAccountNumber, generateUPIId, formatCurrency } from '../utils/formatters';

interface RegisterPageProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateToLogin,
  onNavigateToLanding
}) => {
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Kept only for the legacy selector below; registration always opens at INR 0.
  const [starterDeposit, setStarterDeposit] = useState<number>(0);
  const [previewAccNumber] = useState<string>(() => generateAccountNumber());
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = await register(name, email, password, 0);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Failed to complete registration.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Top ambient line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

        {/* Brand header */}
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
            Open INR Demo Account
          </h2>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono space-y-0.5">
            <p>Assigned A/C: <span className="font-bold text-emerald-600 dark:text-emerald-400">{previewAccNumber}</span></p>
            {name && <p>UPI ID: <span className="text-teal-600 dark:text-teal-400">{generateUPIId(name)}</span></p>}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address (Login ID)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@campus.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-xs"
              />
            </div>
          </div>

          {/* Password and confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-xs"
                />
              </div>
            </div>
          </div>

          {/* Starter deposit selection in INR */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Starter Demo INR Deposit (Simulated Welcome Balance)
            </label>
            <select
              value={starterDeposit}
              onChange={(e) => setStarterDeposit(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs font-semibold font-mono"
            >
              <option value={25000}>₹25,000 (Student Starter Tier)</option>
              <option value={50000}>₹50,000 (Recommended Standard Tier)</option>
              <option value={100000}>₹1,00,000 (Executive Demo Tier)</option>
            </select>
          </div>

          {/* Terms checkbox */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60">
            <label className="flex items-start space-x-2 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" required defaultChecked className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                I acknowledge that this is an educational Indian banking simulation. All rupee balances (₹) are simulated demo assets.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating INR Demo Account...' : 'Open Demo Account (₹)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Already have an account? </span>
          <button
            onClick={onNavigateToLogin}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};
