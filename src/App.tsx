import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar, PageId } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { EducationalBanner } from './components/common/EducationalBanner';
import { FirebaseSetupModal } from './components/common/FirebaseSetupModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AccountBalancePage } from './pages/AccountBalancePage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { TransferPage } from './pages/TransferPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export const App: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Loading spinner during initial auth resolution
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
          AP
        </div>
        <p className="mt-4 font-bold text-sm tracking-wide">Loading AccountPulse Banking Core...</p>
        <span className="text-xs text-slate-400 mt-1">Initializing ACID Transaction State</span>
      </div>
    );
  }

  // Handle dedicated auth views
  if (authMode === 'login') {
    return (
      <LoginPage
        onSuccess={() => {
          setAuthMode(null);
          setCurrentPage('dashboard');
        }}
        onNavigateToRegister={() => setAuthMode('register')}
        onNavigateToLanding={() => setAuthMode(null)}
      />
    );
  }

  if (authMode === 'register') {
    return (
      <RegisterPage
        onSuccess={() => {
          setAuthMode(null);
          setCurrentPage('dashboard');
        }}
        onNavigateToLogin={() => setAuthMode('login')}
        onNavigateToLanding={() => setAuthMode(null)}
      />
    );
  }

  // Handle Landing Page
  if (currentPage === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <EducationalBanner onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)} />
        <LandingPage
          onNavigate={(page) => setCurrentPage(page)}
          onOpenAuth={(mode) => setAuthMode(mode)}
        />
        <FirebaseSetupModal
          isOpen={isFirebaseModalOpen}
          onClose={() => setIsFirebaseModalOpen(false)}
        />
      </div>
    );
  }

  // Page title mapping for header
  const pageTitles: Record<PageId, string> = {
    landing: 'Home',
    dashboard: 'Banking Dashboard',
    balance: 'Account Balances & Ledger',
    deposit: 'Simulated Money Deposit',
    withdraw: 'Simulated Cash Withdrawal',
    transfer: 'Inter-Account Fund Transfer',
    history: 'Transaction History & Statements',
    profile: 'User Profile & Security',
    admin: 'Operations Admin Console'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Educational Simulation Banner */}
        <EducationalBanner onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)} />

        {/* Global Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
          currentPageTitle={pageTitles[currentPage] || 'Banking Portal'}
        />

        {/* Dynamic Page Component */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
          {currentPage === 'balance' && <AccountBalancePage />}
          {currentPage === 'deposit' && <DepositPage />}
          {currentPage === 'withdraw' && <WithdrawPage />}
          {currentPage === 'transfer' && <TransferPage />}
          {currentPage === 'history' && <TransactionHistoryPage />}
          {currentPage === 'profile' && <UserProfilePage />}
          {currentPage === 'admin' && <AdminDashboardPage />}
        </main>

        {/* Footer info line */}
        <footer className="py-4 px-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-400">
          <span>AccountPulse Banking Transaction Analysis System • Educational simulation • All balances are simulated demo assets</span>
        </footer>
      </div>

      {/* Firebase setup guide modal */}
      <FirebaseSetupModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
};

export default App;
