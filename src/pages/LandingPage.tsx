import React from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Zap,
  Lock,
  CreditCard,
  Smartphone,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { PageId } from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { quickLogin, isAuthenticatedLiveUser } = useAuth();

  const exchangeRates = [
    { pair: 'USD/INR', rate: '₹86.45', change: '+0.12%' },
    { pair: 'EUR/INR', rate: '₹93.60', change: '-0.08%' },
    { pair: 'GBP/INR', rate: '₹112.30', change: '+0.25%' },
    { pair: 'AED/INR', rate: '₹23.54', change: '+0.04%' },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Instant UPI & IMPS Transfers',
      desc: 'Simulated 24x7 instantaneous atomic transfers using Indian Demo Account Numbers or UPI IDs (e.g. user@novavault) with two-sided atomic consistency.'
    },
    {
      icon: Lock,
      title: 'ACID Atomic Ledger',
      desc: 'Powered by Cloud Firestore and atomic transaction locks. Overdrawing and negative balances are mathematically prevented.'
    },
    {
      icon: CreditCard,
      title: 'Virtual RuPay Platinum Cards',
      desc: 'Contactless EMV chip demo cards with simulated CVV codes, number masking/reveal, and instant one-click freezing.'
    },
    {
      icon: Smartphone,
      title: 'CTS-2010 Cheque & ATM Simulator',
      desc: 'Simulated mobile cheque capture with CTS clearing, simulated ATM cash dispensation with daily limits, and verified digital receipts.'
    },
    {
      icon: ShieldCheck,
      title: 'Role-Based Access Control',
      desc: 'Strict authorization rules separating standard bank clients from the SuperAdmin control center with global liquidity monitoring.'
    },
    {
      icon: BarChart3,
      title: 'Financial Analytics & CSV Statements',
      desc: 'Monthly expenditure tracking across Indian categories (Hostel, Bills, Dining, UPI) with one-click official CSV statement downloads in INR.'
    }
  ];

  const techStack = [
    { name: 'React 19', role: 'Modern Component Engine' },
    { name: 'TypeScript', role: 'Type-Safe Banking Domain' },
    { name: 'Tailwind CSS', role: 'Responsive Modern UI' },
    { name: 'Cloud Firestore', role: 'NoSQL Database & Atomic Transactions' },
    { name: 'Firebase Auth', role: 'Secure User Authentication' },
    { name: 'Firebase Hosting', role: 'Public HTTPS Edge Deployment' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Exchange Rates Ticker Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between space-x-6 whitespace-nowrap">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE SIMULATED FOREX TICKER (INR BASE):</span>
          </div>
          <div className="flex items-center space-x-8 text-xs font-mono">
            {exchangeRates.map((ex, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className="font-semibold text-white">{ex.pair}</span>
                <span className="text-slate-300">{ex.rate}</span>
                <span className={ex.change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}>
                  {ex.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Indian Banking Project Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COLLEGE CAPSTONE PROJECT • INDIAN BANKING SYSTEM (INR ₹)</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Next-Generation{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Digital Banking
              </span>{' '}
              Transaction System
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              A comprehensive educational fintech web application simulating real-world Indian banking operations: simulated UPI & IMPS transfers, atomic ledger synchronization, virtual RuPay debit cards, and administrative compliance.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all flex items-center space-x-2"
              >
                <span>Launch Banking Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm shadow-sm transition-all"
              >
                Sign In to Account
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="px-6 py-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 font-bold text-sm transition-all"
              >
                Open Demo Account
              </button>
            </div>

            {/* Quick 1-Click Evaluation Personas in INR */}
            {!isAuthenticatedLiveUser && (
              <div className="pt-8 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold block mb-2 uppercase tracking-wider text-[11px]">
                  Evaluator 1-Click Test Personas (INR):
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={async () => { await quickLogin('alice'); onNavigate('dashboard'); }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20 text-slate-800 dark:text-slate-200 font-medium transition"
                  >
                    Alice Johnson (₹6,35,000 Demo)
                  </button>
                  <button
                    onClick={async () => { await quickLogin('bob'); onNavigate('dashboard'); }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20 text-slate-800 dark:text-slate-200 font-medium transition"
                  >
                    Bob Smith (₹1,62,500 Demo)
                  </button>
                  <button
                    onClick={async () => { await quickLogin('admin'); onNavigate('admin'); }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-500/25 transition"
                  >
                    SuperAdmin (₹1.75 Cr Liquidity)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Indian Banking System Features & Specifications
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Built according to Indian banking norms with IFSC routing, UPI IDs, RuPay debit card emulation, and ACID transaction guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition-all hover:shadow-lg group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-2">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
              Technical Specifications
            </h3>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Built With Modern Industry Standards
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm"
              >
                <div className="font-extrabold text-slate-900 dark:text-white text-sm mb-1">
                  {tech.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {tech.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Safety Banner */}
      <section className="py-12 bg-emerald-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-emerald-300">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Academic Project Certification & Safety
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            AccountPulse is developed strictly for academic evaluation. No connection exists to the Reserve Bank of India (RBI), National Payments Corporation of India (NPCI), or live payment gateways. All balances are simulated demo Indian Rupees.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-lg transition-colors"
            >
              Enter Banking Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-900 flex items-center justify-center font-black text-xs">
              NV
            </div>
            <span className="font-bold text-slate-200">AccountPulse Educational Banking</span>
            <span>• College Final Year Project (INR)</span>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-emerald-400">Dashboard</button>
            <button onClick={() => onNavigate('transfer')} className="hover:text-emerald-400">UPI Transfers</button>
            <button onClick={() => onNavigate('admin')} className="hover:text-emerald-400">Admin</button>
            <button onClick={() => onOpenAuth('login')} className="hover:text-emerald-400">Sign In</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
