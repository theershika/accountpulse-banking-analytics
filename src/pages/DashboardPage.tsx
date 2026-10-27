import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Wallet,
  TrendingUp,
  CreditCard,
  ChevronRight,
  Copy,
  Check,
  ArrowDownCircle,
  ArrowUpCircle,
  PieChart,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageId } from '../components/common/Sidebar';
import { BankingService } from '../services/bankingService';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { VirtualDebitCard } from '../components/cards/VirtualDebitCard';
import { ReceiptModal } from '../components/common/ReceiptModal';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { currentUser, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadTransactions();
    }
  }, [currentUser]);

  const loadTransactions = async () => {
    if (!currentUser) return;
    const txns = await BankingService.getUserTransactions(currentUser.uid);
    setTransactions(txns);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleCardFreeze = async () => {
    if (currentUser) {
      await BankingService.toggleCardFreeze(currentUser.uid);
      await refreshUser();
    }
  };

  const handleOpenReceipt = (txn: Transaction) => {
    setSelectedTxn(txn);
    setIsReceiptOpen(true);
  };

  const checking = currentUser?.checkingBalance || 0;
  const savings = currentUser?.savingsBalance || 0;
  const totalNetWorth = checking + savings;

  // Calculate monthly inflow and outflow
  const monthlyInflow = transactions
    .filter(t => t.type === 'deposit' || t.type === 'transfer_in')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyOutflow = transactions
    .filter(t => t.type === 'withdrawal' || t.type === 'transfer_out')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Spending categories distribution in INR
  const categories = [
    { label: 'Hostel & Rent Remittance', amount: 12500, color: 'bg-blue-500', pct: 40 },
    { label: 'Food, Dining & Swiggy', amount: 6500, color: 'bg-amber-500', pct: 21 },
    { label: 'College & Tech Resources', amount: 8000, color: 'bg-purple-500', pct: 26 },
    { label: 'BESCOM Bills & Recharge', amount: 4000, color: 'bg-emerald-500', pct: 13 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome & Account Identity Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Indian Rupee Banking
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Tier: {currentUser?.tier || 'Standard'} Demo
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentUser?.displayName || 'Valued Client'}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex items-center space-x-1">
              <span>A/C: {currentUser?.accountNumber}</span>
              <button
                onClick={() => handleCopy(currentUser?.accountNumber || '', 'acc')}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span>UPI: {currentUser?.upiId || `${currentUser?.displayName.toLowerCase().replace(/\s+/g, '')}@novavault`}</span>
              <button
                onClick={() => handleCopy(currentUser?.upiId || '', 'upi')}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                {copiedField === 'upi' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span>•</span>
            <span>IFSC: {currentUser?.ifscCode || 'NVBL000401'}</span>
          </div>
        </div>

        {/* Quick action top buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('deposit')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Deposit (₹)</span>
          </button>
          <button
            onClick={() => onNavigate('withdraw')}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center space-x-1.5"
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
          <button
            onClick={() => onNavigate('transfer')}
            className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold text-xs transition flex items-center space-x-1.5"
          >
            <Send className="w-4 h-4" />
            <span>UPI / IMPS</span>
          </button>
        </div>
      </div>

      {/* Main Balances Grid (INR ₹) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Net Worth Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Demo Net Worth (INR)</span>
            <Wallet className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
            {formatCurrency(totalNetWorth)}
          </div>
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100/90 font-mono">
            <span>Inflow: +{formatCurrency(monthlyInflow)}</span>
            <span>Outflow: -{formatCurrency(monthlyOutflow)}</span>
          </div>
        </div>

        {/* Primary Savings / Current Account */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Primary Current / Savings</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
            {formatCurrency(checking)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Available for instant UPI, IMPS & RuPay debit</p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('transfer')}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>Instant Transfer</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-400 text-[11px]">Primary A/C</span>
          </div>
        </div>

        {/* High-Yield Reserve Vault */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Fixed Reserve Vault (Savings)</span>
            <TrendingUp className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
            {formatCurrency(savings)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Accruing 4.50% p.a. simulated annual yield</p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('balance')}
              className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
            >
              <span>Manage Reserve Goals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-400 text-[11px]">Compound Daily</span>
          </div>
        </div>
      </div>

      {/* Middle Row: RuPay Card + Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Debit Card widget (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Virtual RuPay Platinum Debit Card
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Contactless online & POS domestic debit card
              </p>
            </div>
            <CreditCard className="w-5 h-5 text-emerald-500" />
          </div>

          {currentUser?.card && (
            <VirtualDebitCard
              card={currentUser.card}
              onToggleFreeze={handleToggleCardFreeze}
            />
          )}
        </div>

        {/* Financial Breakdown & Quick Send widget (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Monthly Spending Analytics (INR)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulated expenditure categorised across Indian payment modes
              </p>
            </div>
            <PieChart className="w-5 h-5 text-emerald-500" />
          </div>

          {/* Category progress bars */}
          <div className="space-y-3 pt-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {cat.label}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    {formatCurrency(cat.amount)} ({cat.pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick UPI Beneficiaries */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <QrCode className="w-3.5 h-3.5 text-emerald-500" />
              <span>Quick UPI / IMPS Beneficiaries:</span>
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onNavigate('transfer')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/30 transition text-center group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition">
                  BS
                </div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Bob Smith</span>
                <span className="block text-[10px] text-slate-400 font-mono">bob@novavault</span>
              </button>

              <button
                onClick={() => onNavigate('transfer')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/30 transition text-center group"
              >
                <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition">
                  CR
                </div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">Carlos R.</span>
                <span className="block text-[10px] text-slate-400 font-mono">carlos@novavault</span>
              </button>

              <button
                onClick={() => onNavigate('transfer')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/30 transition text-center group"
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition">
                  +
                </div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">New Transfer</span>
                <span className="block text-[10px] text-slate-400">UPI or A/C</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Recent Account Passbook Feed
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any transaction to open official Indian bank receipt modal
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No transactions found on this account yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {transactions.slice(0, 5).map((txn) => {
              const isPositive = txn.type === 'deposit' || txn.type === 'transfer_in';
              return (
                <div
                  key={txn.id}
                  onClick={() => handleOpenReceipt(txn)}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850/50 px-3 rounded-2xl cursor-pointer transition"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {txn.description}
                      </p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>{formatDate(txn.timestamp)}</span>
                        <span>•</span>
                        <span>UTR: {txn.referenceId}</span>
                        <span>•</span>
                        <span className="capitalize text-emerald-600 dark:text-emerald-400">{txn.channel || txn.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`block font-extrabold text-sm sm:text-base font-mono ${
                      isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {isPositive ? '+' : '-'}{formatCurrency(txn.amount)}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      Bal: {formatCurrency(txn.balanceAfter)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Digital Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        transaction={selectedTxn}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};
