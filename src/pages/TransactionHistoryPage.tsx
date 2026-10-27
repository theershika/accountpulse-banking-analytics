import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BankingService } from '../services/bankingService';
import { Transaction } from '../types';
import { formatCurrency, formatDateTime, formatDate } from '../utils/formatters';
import { ReceiptModal } from '../components/common/ReceiptModal';

export const TransactionHistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  useEffect(() => {
    loadTransactions();
  }, [currentUser]);

  const loadTransactions = async () => {
    if (!currentUser) return;
    const txns = await BankingService.getUserTransactions(currentUser.uid);
    setTransactions(txns);
  };

  // Filter & Search Logic
  const filtered = transactions.filter((t) => {
    // Type filter
    if (filterType !== 'all') {
      if (filterType === 'deposit' && t.type !== 'deposit') return false;
      if (filterType === 'withdrawal' && t.type !== 'withdrawal') return false;
      if (filterType === 'transfer' && !(t.type === 'transfer_in' || t.type === 'transfer_out')) return false;
      if (filterType === 'internal' && t.type !== 'internal_transfer') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesDesc = t.description.toLowerCase().includes(q);
      const matchesRef = t.referenceId.toLowerCase().includes(q);
      const matchesSender = t.senderName.toLowerCase().includes(q);
      const matchesRecipient = (t.recipientName || '').toLowerCase().includes(q);
      const matchesCat = t.category.toLowerCase().includes(q);
      if (!matchesDesc && !matchesRef && !matchesSender && !matchesRecipient && !matchesCat) {
        return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // CSV Statement Export in INR
  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = ['UTR Reference ID', 'Date & Time', 'Channel', 'Type', 'Category', 'Description', 'Amount (INR)', 'Balance After (INR)', 'Status'];
    const rows = filtered.map(t => [
      t.referenceId,
      formatDateTime(t.timestamp),
      t.channel || 'INTERNAL',
      t.type,
      t.category,
      `"${t.description.replace(/"/g, '""')}"`,
      `"INR ${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}"`,
      `"INR ${t.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}"`,
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AccountPulse_Account_Statement_${currentUser?.accountNumber}_INR.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRowClick = (txn: Transaction) => {
    setSelectedTxn(txn);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Passbook & Audit Trail (INR)
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Transaction History & Statements
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable passbook of all UPI, IMPS, NEFT, ATM, and Cheque entries
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Statement (₹)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Print Statement View"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by description, UTR reference, category, or party..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'deposit', label: 'Inward Inflows' },
            { id: 'withdrawal', label: 'Cash Outflows' },
            { id: 'transfer', label: 'Transfers / UPI' },
            { id: 'internal', label: 'Internal Reserve' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setFilterType(tab.id); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                filterType === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-semibold">No transactions found matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Transaction & Channel</th>
                  <th className="py-3 px-4 font-semibold">UTR Reference No</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount (₹)</th>
                  <th className="py-3 px-4 font-semibold text-right">Balance After</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {paginated.map((txn) => {
                  const isPositive = txn.type === 'deposit' || txn.type === 'transfer_in';
                  return (
                    <tr
                      key={txn.id}
                      onClick={() => handleRowClick(txn)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer transition"
                    >
                      {/* Description & Icon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {txn.description}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Channel: {txn.channel || 'INTERNAL'} • {txn.fromAccountType} &rarr; {txn.toAccountType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* UTR Reference */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {txn.referenceId}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                          {txn.category}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {formatDateTime(txn.timestamp)}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-extrabold font-mono text-xs sm:text-sm">
                        <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}>
                          {isPositive ? '+' : '-'}{formatCurrency(txn.amount)}
                        </span>
                      </td>

                      {/* Balance After */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400 text-xs">
                        {formatCurrency(txn.balanceAfter)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold capitalize font-mono">
                          <CheckCircle className="w-3 h-3" />
                          <span>{txn.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Official Transaction Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        transaction={selectedTxn}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};
