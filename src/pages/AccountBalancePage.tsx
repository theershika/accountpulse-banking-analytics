import React, { useState } from 'react';
import {
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  Copy,
  Check,
  Clock,
  Percent,
  AlertCircle,
  Building,
  Target,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BankingService } from '../services/bankingService';
import { formatCurrency } from '../utils/formatters';

export const AccountBalancePage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [internalAmount, setInternalAmount] = useState<string>('');
  const [fromAccount, setFromAccount] = useState<'checking' | 'savings'>('checking');
  const [internalNote, setInternalNote] = useState<string>('');
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [internalMsg, setInternalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (val: string, field: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInternalTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalMsg(null);
    const amt = parseFloat(internalAmount);

    if (isNaN(amt) || amt <= 0) {
      setInternalMsg({ type: 'error', text: 'Please enter a valid transfer amount.' });
      return;
    }

    if (!currentUser) return;
    setInternalLoading(true);

    const toAccount = fromAccount === 'checking' ? 'savings' : 'checking';
    const res = await BankingService.internalTransfer(currentUser.uid, {
      fromAccount,
      toAccount,
      amount: amt,
      notes: internalNote || 'Internal Account Transfer'
    });

    setInternalLoading(false);
    if (res.success) {
      setInternalMsg({
        type: 'success',
        text: `Transferred ${formatCurrency(amt)} from ${fromAccount === 'checking' ? 'Current/Savings' : 'Reserve Vault'} to ${toAccount === 'checking' ? 'Current/Savings' : 'Reserve Vault'}!`
      });
      setInternalAmount('');
      setInternalNote('');
      await refreshUser();
    } else {
      setInternalMsg({ type: 'error', text: res.error || 'Failed to complete internal transfer.' });
    }
  };

  const checking = currentUser?.checkingBalance || 0;
  const savings = currentUser?.savingsBalance || 0;
  const totalNet = checking + savings;

  const withdrawLimit = currentUser?.dailyWithdrawLimit || 50000;
  const withdrawSpent = currentUser?.dailyWithdrawSpent || 0;
  const limitPct = Math.min(100, Math.round((withdrawSpent / withdrawLimit) * 100));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Ledger Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Indian Rupee Ledger
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Account Balances & Asset Reserves
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulated DICGC deposit insurance coverage up to ₹5,00,000 per depositor
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-mono">Consolidated Net Worth</span>
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
              {formatCurrency(totalNet)}
            </span>
          </div>
        </div>

        {/* Checking vs Savings Comparison (INR) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Primary Current/Savings Account */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Primary Current / Savings
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Operating Liquidity A/C</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                Liquid
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatCurrency(checking)}
            </div>

            <div className="space-y-2 text-xs border-t border-slate-200/80 dark:border-slate-800 pt-3 text-slate-600 dark:text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Account Number</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>UPI VPA Address</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{currentUser?.upiId || 'user@novavault'}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Maintenance</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹0.00 (Zero Balance Waiver)</span>
              </div>
            </div>
          </div>

          {/* High-Yield Reserve Vault */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    High-Yield Reserve Vault
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Compound Interest Vault</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold flex items-center space-x-1">
                <Percent className="w-3 h-3" />
                <span>4.50% p.a.</span>
              </span>
            </div>

            <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">
              {formatCurrency(savings)}
            </div>

            <div className="space-y-2 text-xs border-t border-slate-200/80 dark:border-slate-800 pt-3 text-slate-600 dark:text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Annual Demo Yield</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  +{formatCurrency(savings * 0.045)} / yr
                </span>
              </div>
              <div className="flex justify-between">
                <span>Compounding Cycle</span>
                <span className="text-slate-800 dark:text-slate-200">Daily accrued, credited monthly</span>
              </div>
              <div className="flex justify-between">
                <span>Withdrawal Penalty</span>
                <span className="text-slate-800 dark:text-slate-200">₹0 (Zero Lock-in)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Internal Transfer Engine & Daily Limit Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Instant Internal Transfer Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Internal Account Transfer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Move demo rupees instantly between your Operating Account and Reserve Vault
              </p>
            </div>
            <ArrowLeftRight className="w-5 h-5 text-emerald-500" />
          </div>

          {internalMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              internalMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}>
              {internalMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{internalMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleInternalTransfer} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  From Account
                </label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value as 'checking' | 'savings')}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="checking">Current/Savings ({formatCurrency(checking)})</option>
                  <option value="savings">Reserve Vault ({formatCurrency(savings)})</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  To Account
                </label>
                <div className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs font-mono">
                  {fromAccount === 'checking' ? `Reserve Vault (${formatCurrency(savings)})` : `Current/Savings (${formatCurrency(checking)})`}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transfer Amount (₹ INR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  min="1"
                  max={fromAccount === 'checking' ? checking : savings}
                  value={internalAmount}
                  onChange={(e) => setInternalAmount(e.target.value)}
                  placeholder="5000.00"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setInternalAmount(String(fromAccount === 'checking' ? checking : savings))}
                  className="absolute right-2.5 top-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] hover:bg-emerald-500/20"
                >
                  MAX
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Note / Memo (Optional)
              </label>
              <input
                type="text"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Allocation for semester tuition goal"
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={internalLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {internalLoading ? 'Processing Transfer...' : 'Execute Internal Transfer'}
            </button>
          </form>
        </div>

        {/* Daily Limit & Official Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Limit Tracker */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Daily ATM / POS Withdrawal Limit
                </h3>
                <span className="text-[11px] text-slate-400">Resets daily at midnight 00:00 IST</span>
              </div>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-500">Spent: {formatCurrency(withdrawSpent)}</span>
                <span className="font-bold text-slate-900 dark:text-white">Limit: {formatCurrency(withdrawLimit)}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    limitPct > 80 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${limitPct}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 block text-right font-mono">
                Remaining today: {formatCurrency(Math.max(0, withdrawLimit - withdrawSpent))}
              </span>
            </div>
          </div>

          {/* Official Indian Bank Specifications */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold pb-2 border-b border-slate-100 dark:border-slate-800">
              <Building className="w-4 h-4 text-emerald-500" />
              <span>Official Indian Banking Coordinates</span>
            </div>

            <div className="space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Bank Entity</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">AccountPulse Educational Banking</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">IFSC Code</span>
                <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <span>NVBL000401</span>
                  <button
                    onClick={() => handleCopy('NVBL000401', 'ifsc')}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    {copiedField === 'ifsc' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">MICR Code</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">560002041</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Branch Center</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Campus Branch, Bengaluru</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500">Deposit Insurance</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">DICGC ₹5,00,000 Demo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals Tracker (INR) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center space-x-2">
              <Target className="w-5 h-5 text-emerald-500" />
              <span>Simulated INR Savings Targets</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Allocated portions of your high-yield demo rupee reserves
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {currentUser?.savingsGoals && currentUser.savingsGoals.length > 0 ? (
            currentUser.savingsGoals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {goal.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {goal.category}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-slate-400">
                      Goal: {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>{pct}% Achieved</span>
                    <span>{goal.deadline ? `Due ${goal.deadline}` : 'Target Ongoing'}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center text-xs text-slate-400 py-4">
              No savings targets configured yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
