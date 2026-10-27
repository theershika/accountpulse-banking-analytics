import React, { useState } from 'react';
import {
  ArrowDownCircle,
  Camera,
  AlertCircle,
  Building2,
  CreditCard,
  FileCheck,
  Sparkles,
  Info,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { BankingService } from '../services/bankingService';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ReceiptModal } from '../components/common/ReceiptModal';

export const DepositPage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [amount, setAmount] = useState<string>('25000');
  const [destinationAccount, setDestinationAccount] = useState<'checking' | 'savings'>('checking');
  const [method, setMethod] = useState<'upi' | 'neft_imps' | 'simulated_cheque' | 'net_banking'>('upi');
  const [note, setNote] = useState<string>('Simulated Project Demo Funds');
  const [chequeNumber, setChequeNumber] = useState<string>('401928');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTxn, setCompletedTxn] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmt = parseFloat(amount);

    if (isNaN(numAmt) || numAmt <= 0) {
      setError('Please enter a deposit amount greater than ₹0.');
      return;
    }

    if (!currentUser) return;
    setLoading(true);

    const refNote = method === 'simulated_cheque'
      ? `CTS Cheque #${chequeNumber} - ${note}`
      : note;

    const res = await BankingService.deposit(currentUser.uid, {
      amount: numAmt,
      destinationAccount,
      method,
      referenceNote: refNote,
      chequeNumber: chequeNumber
    });

    setLoading(false);

    if (res.success && res.transaction) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setCompletedTxn(res.transaction);
      setIsReceiptOpen(true);
      await refreshUser();
    } else {
      setError(res.error || 'Failed to process deposit.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Fund Account (INR)
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Simulated Rupee Deposit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Credit simulated Indian Rupees (₹) to your Operating Account or Reserve Vault
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hidden sm:block">
          <ArrowDownCircle className="w-8 h-8" />
        </div>
      </div>

      {/* Main Deposit Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        {/* Academic Warning Note */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-start space-x-3 text-xs">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-amber-800 dark:text-amber-300">
            <strong>Indian Banking Simulation:</strong> This educational tool simulates NPCI / UPI / CTS-2010 cheque clearing with atomic ledger records. No real currency or Indian payment gateways are involved.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleDeposit} className="space-y-6 text-xs">
          {/* Deposit Method Tabs */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Inflow Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                  method === 'upi'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="block font-bold text-xs text-slate-900 dark:text-white">UPI Payment</span>
                  <span className="text-[10px] text-slate-400">Instant 24x7 Inward</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('neft_imps')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                  method === 'neft_imps'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="block font-bold text-xs text-slate-900 dark:text-white">NEFT / IMPS</span>
                  <span className="text-[10px] text-slate-400">Interbank Remittance</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('simulated_cheque')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                  method === 'simulated_cheque'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="block font-bold text-xs text-slate-900 dark:text-white">CTS Cheque Scan</span>
                  <span className="text-[10px] text-slate-400">CTS-2010 Cheque OCR</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('net_banking')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                  method === 'net_banking'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-500" />
                <div>
                  <span className="block font-bold text-xs text-slate-900 dark:text-white">Net Banking</span>
                  <span className="text-[10px] text-slate-400">SBI / HDFC Gateway</span>
                </div>
              </button>
            </div>
          </div>

          {/* Destination Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Destination Account
              </label>
              <select
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value as 'checking' | 'savings')}
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
                Deposit Narration / Reference
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="College Project INR Funding"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Amount input & Quick Pills */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Deposit Amount (₹ Indian Rupees)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min="100"
                max="10000000"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-16 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-mono font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-4 top-3.5 font-bold text-slate-400 font-mono">
                INR
              </span>
            </div>

            {/* Quick amount chips in INR */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition ${
                    amount === String(q)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  +{formatCurrency(q)}
                </button>
              ))}
            </div>
          </div>

          {/* CTS Cheque Simulator Box */}
          {method === 'simulated_cheque' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-emerald-500" />
                  <span>Simulated CTS-2010 Cheque Clearing</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  MICR: 560002041
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Cheque Number (6 digits)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Clearing Mode</label>
                  <div className="w-full px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    CTS Truncated Clearing
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Clearing Inflow...' : `Confirm Deposit of ${formatCurrency(parseFloat(amount) || 0)}`}</span>
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
