import React, { useState } from 'react';
import {
  ArrowUpCircle,
  KeyRound,
  AlertCircle,
  Landmark,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BankingService } from '../services/bankingService';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ReceiptModal } from '../components/common/ReceiptModal';

export const WithdrawPage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [amount, setAmount] = useState<string>('5000');
  const [sourceAccount, setSourceAccount] = useState<'checking' | 'savings'>('checking');
  const [method, setMethod] = useState<'atm_cash' | 'branch_counter'>('atm_cash');
  const [note, setNote] = useState<string>('ATM Cash Dispensation - Campus Center');
  const [securityPin, setSecurityPin] = useState<string>('1234');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTxn, setCompletedTxn] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  const quickAmounts = [1000, 2000, 5000, 10000, 25000];

  const currentAvailable = sourceAccount === 'checking'
    ? (currentUser?.checkingBalance || 0)
    : (currentUser?.savingsBalance || 0);

  const dailySpent = currentUser?.dailyWithdrawSpent || 0;
  const dailyLimit = currentUser?.dailyWithdrawLimit || 50000;
  const remainingToday = Math.max(0, dailyLimit - dailySpent);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmt = parseFloat(amount);

    if (isNaN(numAmt) || numAmt <= 0) {
      setError('Please specify a withdrawal amount greater than ₹0.');
      return;
    }

    if (numAmt > currentAvailable) {
      setError(`Overdraft Protection: Insufficient balance in ${sourceAccount}. Current balance is ${formatCurrency(currentAvailable)}, requested withdrawal is ${formatCurrency(numAmt)}.`);
      return;
    }

    if (numAmt > remainingToday) {
      setError(`Daily limit exceeded! You can withdraw at most ${formatCurrency(remainingToday)} more today.`);
      return;
    }

    if (securityPin.length < 4) {
      setError('Please enter a 4-digit security PIN (Demo Default: 1234).');
      return;
    }

    if (!currentUser) return;
    setLoading(true);

    const res = await BankingService.withdraw(currentUser.uid, {
      amount: numAmt,
      sourceAccount,
      method,
      referenceNote: note,
      securityPin
    });

    setLoading(false);

    if (res.success && res.transaction) {
      setCompletedTxn(res.transaction);
      setIsReceiptOpen(true);
      await refreshUser();
    } else {
      setError(res.error || 'Failed to process cash withdrawal.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Cash Dispensation (INR)
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Simulated Cash Withdrawal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Debits your Indian Rupee account with atomic real-time balance safeguards
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hidden sm:block">
          <ArrowUpCircle className="w-8 h-8" />
        </div>
      </div>

      {/* Main Withdrawal Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        {/* Balance Status Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 block font-mono">Available Balance ({sourceAccount === 'checking' ? 'Current/Savings' : 'Reserve Vault'})</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatCurrency(currentAvailable)}
            </span>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 block font-mono">Daily Limit Remaining</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(remainingToday)} of {formatCurrency(dailyLimit)}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleWithdrawal} className="space-y-6 text-xs">
          {/* Channel selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Dispensation Channel
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('atm_cash')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                  method === 'atm_cash'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Landmark className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="block font-bold text-xs text-slate-900 dark:text-white">Campus Center ATM</span>
                  <span className="text-[10px] text-slate-400">RuPay Micro-ATM Dispensation</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('branch_counter')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                  method === 'branch_counter'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="block font-bold text-xs text-slate-900 dark:text-white">Branch Cash Counter</span>
                  <span className="text-[10px] text-slate-400">Teller Withdrawal Slip</span>
                </div>
              </button>
            </div>
          </div>

          {/* Account and Narration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Debited Account
              </label>
              <select
                value={sourceAccount}
                onChange={(e) => setSourceAccount(e.target.value as 'checking' | 'savings')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold font-mono focus:ring-2 focus:ring-emerald-500"
              >
                <option value="checking">
                  Operating Account ({formatCurrency(currentUser?.checkingBalance || 0)})
                </option>
                <option value="savings">
                  Reserve Vault ({formatCurrency(currentUser?.savingsBalance || 0)})
                </option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Withdrawal Narration
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ATM Cash Dispensation"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Amount input & quick chips */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Withdrawal Amount (₹ Indian Rupees)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min="100"
                max={Math.min(currentAvailable, remainingToday)}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-16 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-mono font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-4 top-3.5 font-bold text-slate-400 font-mono">
                INR
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-2.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition ${
                    amount === String(q)
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {formatCurrency(q)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(String(Math.min(currentAvailable, remainingToday)))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
              >
                Max ({formatCurrency(Math.min(currentAvailable, remainingToday))})
              </button>
            </div>
          </div>

          {/* Security PIN verification */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <KeyRound className="w-4 h-4 text-emerald-500" />
                <span>Simulated ATM Card Security PIN</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Demo Default: 1234</span>
            </div>
            <input
              type="password"
              maxLength={4}
              required
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              placeholder="••••"
              className="w-32 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono tracking-widest text-center text-sm font-bold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Dispensing Cash...' : `Confirm Cash Withdrawal of ${formatCurrency(parseFloat(amount) || 0)}`}</span>
          </button>
        </form>
      </div>

      {/* Official Transaction Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        transaction={completedTxn}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};
