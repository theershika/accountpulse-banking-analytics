import React, { useState, useEffect } from 'react';
import {
  Send,
  Search,
  UserCheck,
  AlertCircle,
  Users,
  KeyRound,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { BankingService } from '../services/bankingService';
import { UserAccount, Transaction, TransactionCategory, TransferChannel } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ReceiptModal } from '../components/common/ReceiptModal';

export const TransferPage: React.FC = () => {
  const { currentUser, refreshUser } = useAuth();
  const [recipientQuery, setRecipientQuery] = useState<string>('bob@novavault'); // Pre-fill with Bob's UPI ID for convenience
  const [recipient, setRecipient] = useState<UserAccount | null>(null);
  const [lookingUp, setLookingUp] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [amount, setAmount] = useState<string>('2500');
  const [sourceAccount, setSourceAccount] = useState<'checking' | 'savings'>('checking');
  const [channel, setChannel] = useState<TransferChannel>('UPI');
  const [category, setCategory] = useState<TransactionCategory>('UPI Transfer');
  const [notes, setNotes] = useState<string>('Hostel & Mess Contribution');
  const [otpCode, setOtpCode] = useState<string>('892014'); // Simulated 2FA OTP

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTxn, setCompletedTxn] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  useEffect(() => {
    if (recipientQuery.trim().length >= 4) {
      lookupRecipient(recipientQuery.trim());
    } else {
      setRecipient(null);
      setLookupError(null);
    }
  }, [recipientQuery]);

  const lookupRecipient = async (queryStr: string) => {
    setLookingUp(true);
    setLookupError(null);

    let found: UserAccount | null = null;
    if (queryStr.includes('@')) {
      if (queryStr.endsWith('@novavault')) {
        found = await BankingService.findAccountByUPI(queryStr);
      } else {
        found = await BankingService.findAccountByEmail(queryStr);
      }
    } else {
      found = await BankingService.findAccountByNumber(queryStr);
    }

    setLookingUp(false);
    if (found) {
      if (found.accountNumber === currentUser?.accountNumber) {
        setRecipient(null);
        setLookupError('This is your own account. Use internal account transfer for self-transfers.');
      } else {
        setRecipient(found);
      }
    } else {
      setRecipient(null);
      setLookupError('No registered account found matching this Account Number or UPI ID.');
    }
  };

  const handleSelectQuickBeneficiary = (id: string) => {
    setRecipientQuery(id);
  };

  const currentAvailable = sourceAccount === 'checking'
    ? (currentUser?.checkingBalance || 0)
    : (currentUser?.savingsBalance || 0);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipient) {
      setError('Please provide a valid registered recipient account number or UPI ID.');
      return;
    }

    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setError('Transfer amount must be greater than ₹0.');
      return;
    }

    if (numAmt > currentAvailable) {
      setError(`Insufficient balance. Your ${sourceAccount === 'checking' ? 'Operating' : 'Reserve'} balance is ${formatCurrency(currentAvailable)}.`);
      return;
    }

    if (!currentUser) return;
    setLoading(true);

    const res = await BankingService.transferFunds(currentUser.uid, {
      recipientAccountNumber: recipient.accountNumber,
      amount: numAmt,
      sourceAccount,
      channel,
      category,
      notes,
      otpCode
    });

    setLoading(false);

    if (res.success && res.transaction) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setCompletedTxn(res.transaction);
      setIsReceiptOpen(true);
      await refreshUser();
    } else {
      setError(res.error || 'Failed to complete fund transfer.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            UPI & Interbank Remittance (INR)
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Inter-Account Rupee Transfer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Transfer simulated INR instantly via UPI, IMPS, or NEFT with two-sided atomic consistency
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 hidden sm:block">
          <Send className="w-8 h-8" />
        </div>
      </div>

      {/* Main Transfer Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        {/* Quick Demo Beneficiaries Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Registered Demo Beneficiaries (Click to auto-fill):</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectQuickBeneficiary('bob@novavault')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-medium transition"
            >
              Bob Smith (<span className="font-mono text-teal-600 dark:text-teal-400">bob@novavault</span>)
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuickBeneficiary('carlos@novavault')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-medium transition"
            >
              Carlos Rodriguez (<span className="font-mono text-teal-600 dark:text-teal-400">carlos@novavault</span>)
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuickBeneficiary('NV-2048-8912')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-medium transition"
            >
              Alice Johnson (<span className="font-mono">NV-2048-8912</span>)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleTransfer} className="space-y-6 text-xs">
          {/* Recipient Lookup Input */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Recipient Account Number or UPI ID (VPA)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={recipientQuery}
                onChange={(e) => setRecipientQuery(e.target.value)}
                placeholder="bob@novavault or NV-5091-3482"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {lookingUp && (
              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                Querying AccountPulse Indian Banking Directory...
              </p>
            )}

            {lookupError && (
              <p className="text-[11px] text-rose-500 mt-2 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{lookupError}</span>
              </p>
            )}

            {recipient && (
              <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                    {recipient.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {recipient.displayName}
                      </span>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      A/C: {recipient.accountNumber} • UPI: {recipient.upiId || 'N/A'} • IFSC: {recipient.ifscCode}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">
                  Verified VPA
                </span>
              </div>
            )}
          </div>

          {/* Payment Channel (UPI, IMPS, NEFT) */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'UPI' as TransferChannel, title: 'UPI Instant', sub: 'Instant 24x7 Settlement' },
              { id: 'IMPS' as TransferChannel, title: 'IMPS Fast', sub: 'Immediate Remittance' },
              { id: 'NEFT' as TransferChannel, title: 'NEFT Clear', sub: 'Batch Clearing System' }
            ].map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setChannel(ch.id)}
                className={`p-3 rounded-2xl border text-left transition ${
                  channel === ch.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="block font-bold text-xs">{ch.title}</span>
                <span className="text-[10px] text-slate-400">{ch.sub}</span>
              </button>
            ))}
          </div>

          {/* Source Account & Category */}
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
                Transfer Purpose / Tag
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="UPI Transfer">UPI Peer Transfer</option>
                <option value="Transfer">Interbank Transfer</option>
                <option value="Shopping">Shopping & E-Commerce</option>
                <option value="Food & Dining">Food, Dining & Swiggy</option>
                <option value="Bills & Utilities">Bills & BBPS Recharges</option>
                <option value="Education">Education, Books & Fees</option>
                <option value="Salary">Salary / Stipend</option>
              </select>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Transfer Amount (₹ Indian Rupees)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min="1"
                max={currentAvailable}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-16 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-mono font-bold focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-4 top-3.5 font-bold text-slate-400 font-mono">
                INR
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Available in {sourceAccount === 'checking' ? 'Operating Account' : 'Reserve Vault'}: {formatCurrency(currentAvailable)}
            </span>
          </div>

          {/* Narration */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Transfer Narration (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Hostel expenses demo"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Simulated 2FA OTP Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <KeyRound className="w-4 h-4 text-emerald-500" />
                <span>Simulated UPI MPIN / OTP Code</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Demo OTP: 892014</span>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-36 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono tracking-widest text-center text-sm font-bold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !recipient}
            className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-xl shadow-teal-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Authorizing Remittance...' : `Send ${formatCurrency(parseFloat(amount) || 0)} via ${channel} to ${recipient?.displayName || 'Beneficiary'}`}</span>
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
