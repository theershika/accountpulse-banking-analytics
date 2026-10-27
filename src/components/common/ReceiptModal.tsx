import React from 'react';
import { X, Printer, CheckCircle, Shield } from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency, formatDateTime, maskAccountNumber } from '../../utils/formatters';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPositive = transaction.type === 'deposit' || transaction.type === 'transfer_in';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden print:shadow-none print:border-none print:max-w-full">
        {/* Top decorative tricolor subtle bar */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-white to-emerald-500 print:hidden" />

        {/* Modal actions */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 print:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Official Indian Banking Receipt
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-6 print:p-8">
          {/* Bank Brand */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xl tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-black">
                NV
              </div>
              <span>NOVAVAULT BANK LIMITED</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
              College Project • Indian Banking System Simulation
            </p>
          </div>

          {/* Amount and Status Hero */}
          <div className="text-center py-4 px-3 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {transaction.channel ? `${transaction.channel} ` : ''}{transaction.type.replace('_', ' ')}
            </span>
            <div className={`text-3xl font-extrabold mt-1 tracking-tight font-mono ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
              {isPositive ? '+' : '-'}{formatCurrency(transaction.amount, 'INR')}
            </div>
            <div className="inline-flex items-center space-x-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="capitalize">{transaction.status} (Verified Simulated UTR)</span>
            </div>
          </div>

          {/* Detail List */}
          <div className="space-y-3 text-xs border-y border-dashed border-slate-200 dark:border-slate-800 py-4 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">UTR / Reference No</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 select-all">
                {transaction.referenceId}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Date & Time</span>
              <span className="text-slate-800 dark:text-slate-200 font-sans">
                {formatDateTime(transaction.timestamp)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Remitter / Sender</span>
              <span className="text-slate-800 dark:text-slate-200 font-sans text-right">
                {transaction.senderName} ({maskAccountNumber(transaction.senderAccountNumber)})
              </span>
            </div>

            {transaction.recipientName && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Beneficiary</span>
                <span className="text-slate-800 dark:text-slate-200 font-sans text-right">
                  {transaction.recipientName} ({transaction.recipientUpiId || maskAccountNumber(transaction.recipientAccountNumber || '')})
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">IFSC Code</span>
              <span className="text-slate-800 dark:text-slate-200">
                NVBL000401 (Bengaluru Campus)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Payment Category</span>
              <span className="text-slate-800 dark:text-slate-200 font-sans">
                {transaction.category}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Updated Balance</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                {formatCurrency(transaction.balanceAfter, 'INR')}
              </span>
            </div>
          </div>

          {/* Simulated Stamp */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>NPCI / RBI Simulated Clearance</span>
            </div>
            <div className="border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase rotate-[-3deg]">
              AUTHENTIC DEMO ₹
            </div>
          </div>
        </div>

        {/* Footer print action */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between print:hidden">
          <p className="text-[11px] text-slate-400">
            AccountPulse Core Banking (INR)
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-emerald-500 transition shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
