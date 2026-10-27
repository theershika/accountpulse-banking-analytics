import React, { useState } from 'react';
import { ShieldAlert, Info, X, Database, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface EducationalBannerProps {
  onOpenFirebaseModal?: () => void;
}

export const EducationalBanner: React.FC<EducationalBannerProps> = ({ onOpenFirebaseModal }) => {
  const [dismissed, setDismissed] = useState(false);
  const { isFirebaseLive } = useAuth();

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-blue-500/15 border-b border-amber-500/20 text-slate-800 dark:text-slate-200 text-xs sm:text-sm py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 font-bold text-[10px]">
            DEMO
          </span>
          <p className="font-medium text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-amber-700 dark:text-amber-400">College Project Simulation:</span>{' '}
            All balances, accounts, and transactions are strictly simulated demo assets. No real currency is involved.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={onOpenFirebaseModal}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border transition-all ${
              isFirebaseLive
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25'
                : 'bg-blue-500/10 border-blue-500/25 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            {isFirebaseLive ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Live Cloud Firestore</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Interactive Offline Demo Engine (Click to Setup Firebase)</span>
              </>
            )}
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
