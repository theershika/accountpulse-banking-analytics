import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Lock,
  Check,
  Save,
  Building,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BankingService } from '../services/bankingService';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const UserProfilePage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [twoFactor, setTwoFactor] = useState(currentUser?.twoFactorEnabled ?? true);
  const [pin, setPin] = useState('1234');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    await BankingService.updateProfile(currentUser.uid, {
      displayName: displayName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      twoFactorEnabled: twoFactor
    });

    await refreshUser();
    setLoading(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          {currentUser?.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'NV'}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {currentUser?.displayName || 'Client Profile'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>KYC Verified Demo (INR)</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            A/C: {currentUser?.accountNumber} • UPI: {currentUser?.upiId || 'user@novavault'} • Role: {currentUser?.role}
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Current/Savings: <strong>{formatCurrency(currentUser?.checkingBalance || 0)}</strong></span>
            <span>Reserve Vault: <strong>{formatCurrency(currentUser?.savingsBalance || 0)}</strong></span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Profile and security preferences updated successfully!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Personal Details (Col 1) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2">
            <User className="w-4 h-4 text-emerald-500" />
            <span>Personal Information</span>
          </h3>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address (Login Identity)
            </label>
            <input
              type="email"
              disabled
              value={currentUser?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono text-xs cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Account login ID is permanent.</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Mobile (+91)
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Registered Residential Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Campus Hall, MG Road, Bengaluru, Karnataka 560001"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Security & Indian Banking Specs (Col 2) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>Security & Authentication</span>
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Two-Factor UPI / MPIN Authentication
              </span>
              <span className="text-[11px] text-slate-400">
                Requires 6-digit OTP verification for outgoing transfers
              </span>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ATM / RuPay Security PIN (4 digits)
            </label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-32 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono tracking-widest text-center text-sm font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Default demo code: 1234</span>
          </div>

          {/* Account Metadata */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Bank IFSC</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">{currentUser?.ifscCode || 'NVBL000401'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">UPI Address</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">{currentUser?.upiId || 'user@novavault'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Account Open Date</span>
              <span className="text-slate-700 dark:text-slate-300 font-sans">
                {currentUser?.createdAt ? formatDateTime(currentUser.createdAt) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">A/C Status</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE (INR)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Preferences...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
