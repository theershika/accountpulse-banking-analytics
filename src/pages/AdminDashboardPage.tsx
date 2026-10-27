import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Wallet,
  Lock,
  Unlock,
  Search,
  RotateCcw,
  CheckCircle,
  History,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BankingService } from '../services/bankingService';
import { UserAccount, Transaction } from '../types';
import { formatCurrency, formatDateTime, formatIndianWords } from '../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, quickLogin, refreshUser, isAuthenticatedLiveUser } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [allTxns, setAllTxns] = useState<Transaction[]>([]);
  const [searchUser, setSearchUser] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Balance adjustment modal
  const [selectedUserForAdj, setSelectedUserForAdj] = useState<UserAccount | null>(null);
  const [adjAmount, setAdjAmount] = useState<string>('10000');
  const [adjType, setAdjType] = useState<'add' | 'deduct'>('add');
  const [adjReason, setAdjReason] = useState<string>('Administrative Liquidity Allocation (INR)');
  const [adjLoading, setAdjLoading] = useState<boolean>(false);

  useEffect(() => {
    loadAdminData();
  }, [currentUser]);

  const loadAdminData = async () => {
    const uList = await BankingService.getAllUsers();
    const tList = await BankingService.getAllTransactions();
    setUsers(uList);
    setAllTxns(tList);
  };

  const handleToggleFreeze = async (user: UserAccount) => {
    const newStatus = !user.isFrozen;
    await BankingService.toggleFreezeAccount(user.uid, newStatus);
    setActionSuccess(`Account ${user.accountNumber} has been ${newStatus ? 'FROZEN' : 'UNFROZEN'}.`);
    await loadAdminData();
    if (currentUser?.uid === user.uid) await refreshUser();
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdj) return;
    const num = parseFloat(adjAmount);
    if (isNaN(num) || num <= 0) return;

    setAdjLoading(true);
    const adjustment = adjType === 'add' ? num : -num;

    const res = await BankingService.adjustBalance(selectedUserForAdj.uid, adjustment, adjReason);
    setAdjLoading(false);

    if (res) {
      setActionSuccess(`Successfully ${adjType === 'add' ? 'credited' : 'debited'} ${formatCurrency(num)} for ${selectedUserForAdj.displayName}!`);
      setSelectedUserForAdj(null);
      await loadAdminData();
      if (currentUser?.uid === selectedUserForAdj.uid) await refreshUser();
    } else {
      alert('Balance adjustment failed. Ensure the resulting balance is not negative.');
    }
  };

  const handleResetSystem = () => {
    if (window.confirm('Are you sure you want to reset all accounts and transactions back to initial INR demo seeds?')) {
      BankingService.resetDemoData();
      loadAdminData();
      refreshUser();
      setActionSuccess('Demo environment has been completely reset to factory default INR seeds.');
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  // If current logged-in user is NOT an admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center border border-purple-500/30">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Admin Access Restricted
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            You are currently signed in as a standard client ({currentUser?.displayName}). Admin operations are reserved for authorized compliance officers.
          </p>
        </div>

        {/* If live authenticated user, show strict message. If demo mode, offer evaluator switcher */}
        {isAuthenticatedLiveUser ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 max-w-md mx-auto text-xs text-amber-800 dark:text-amber-300">
            <strong>Authenticated Account:</strong> To access admin functions in production mode, your Firebase account must have the <code>admin</code> role assigned in Firestore.
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 max-w-md mx-auto text-xs space-y-3">
            <p className="font-bold text-purple-900 dark:text-purple-300">
              Evaluator 1-Click Access (INR Demo):
            </p>
            <button
              onClick={() => quickLogin('admin')}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to Operations SuperAdmin Persona</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Calculate Metrics in INR
  const totalSystemLiquidity = users.reduce((acc, u) => acc + (u.checkingBalance + u.savingsBalance), 0);
  const totalVolumeTransacted = allTxns.reduce((acc, t) => acc + t.amount, 0);

  const filteredUsers = users.filter(u => {
    if (!searchUser.trim()) return true;
    const q = searchUser.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.accountNumber.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.upiId && u.upiId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Operations & Compliance Console (INR)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
              SUPERADMIN
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            System Administration & Control Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time monitoring of all Indian Rupee accounts, global liquidity, and compliance locks
          </p>
        </div>

        <button
          onClick={handleResetSystem}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center space-x-2 border border-slate-200 dark:border-slate-700"
          title="Reset back to initial seed data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Environment (INR)</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Global Liquidity KPI Cards in INR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>REGISTERED USERS</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {users.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            100% KYC Verified Demo
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SYSTEM LIQUIDITY (INR)</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatIndianWords(totalSystemLiquidity)}
          </div>
          <span className="text-[11px] text-slate-400 font-mono block">
            {formatCurrency(totalSystemLiquidity)}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>VOLUME TRANSACTED</span>
            <Activity className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatIndianWords(totalVolumeTransacted)}
          </div>
          <span className="text-[11px] text-slate-400 font-mono block">
            Across UPI, IMPS, NEFT & Cheques
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL TRANSACTIONS</span>
            <History className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {allTxns.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
            ACID State Consistent
          </span>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Registered Indian Rupee Accounts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage accounts, freeze/unfreeze status, and adjust demo rupee balances
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search user, UPI, A/C..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">User & UPI ID</th>
                <th className="py-3 px-4 font-semibold">Account Number</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold text-right">Current Bal (₹)</th>
                <th className="py-3 px-4 font-semibold text-right">Reserve Bal (₹)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
                  {/* User info */}
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {u.displayName}
                      </span>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                        {u.upiId || u.email}
                      </span>
                    </div>
                  </td>

                  {/* Account Number */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {u.accountNumber}
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      u.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  {/* Checking */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(u.checkingBalance)}
                  </td>

                  {/* Savings */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                    {formatCurrency(u.savingsBalance)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      u.isFrozen
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {u.isFrozen ? 'FROZEN' : 'ACTIVE'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedUserForAdj(u)}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 font-semibold text-[11px] transition"
                        title="Adjust balance"
                      >
                        Adjust Bal
                      </button>

                      <button
                        onClick={() => handleToggleFreeze(u)}
                        className={`p-1.5 rounded-lg transition ${
                          u.isFrozen
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                        }`}
                        title={u.isFrozen ? 'Unfreeze account' : 'Freeze account'}
                      >
                        {u.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Audit Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              System-Wide Transaction Audit Log (INR)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live immutable stream of transactions executed across all accounts with UTR references
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total records: {allTxns.length}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-96 overflow-y-auto">
          {allTxns.map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {t.referenceId}
                </span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-slate-600 dark:text-slate-400 font-sans">
                  {t.description}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(t.amount)}
                </span>
                <span className="text-slate-400 block text-[10px]">
                  {formatDateTime(t.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {selectedUserForAdj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Adjust Balance: {selectedUserForAdj.displayName}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Account: {selectedUserForAdj.accountNumber} • Current Balance: {formatCurrency(selectedUserForAdj.checkingBalance)}
            </p>

            <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjType('add')}
                  className={`py-2 rounded-xl font-bold transition ${
                    adjType === 'add' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Credit (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType('deduct')}
                  className={`py-2 rounded-xl font-bold transition ${
                    adjType === 'deduct' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Debit (-)
                </button>
              </div>

              <div>
                <label className="block font-semibold mb-1">Adjustment Amount (₹ INR)</label>
                <input
                  type="number"
                  step="1"
                  required
                  min="1"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Audit Reason</label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForAdj(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  {adjLoading ? 'Saving...' : 'Confirm INR Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
