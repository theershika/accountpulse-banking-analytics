import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, Database, Server, Flame } from 'lucide-react';
import { isFirebaseConfigured, firebaseConfig } from '../../services/firebase';

interface FirebaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupModal: React.FC<FirebaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const sampleEnvText = `# NovaVault Banking - Firebase Credentials
VITE_FIREBASE_API_KEY="AIzaSyYourActualApiKeyHere"
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"`;

  const deployCmds = `npm run build
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Firebase Integration & Hosting Setup Guide
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current status:{' '}
                <span className={isFirebaseConfigured ? 'text-emerald-500 font-semibold' : 'text-amber-500 font-semibold'}>
                  {isFirebaseConfigured ? 'Connected to live Firebase' : 'Running in Interactive Offline Demo Mode'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-blue-900 dark:text-blue-300">Instant Demo Evaluation Note:</span>
              <p>
                The website is fully functional right now using the built-in browser-based atomic transaction simulator. You can test deposits, withdrawals, transfers between accounts (Alice, Bob, Carlos), and admin tools immediately without configuring anything!
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">1</span>
              <span>Create Free Firebase Project</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">
              Go to the Firebase Console, click <strong>Create a project</strong>, and disable Google Analytics (optional).
            </p>
            <div className="pl-7">
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
              >
                <span>Open Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2 pt-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">2</span>
              <span>Enable Authentication & Cloud Firestore</span>
            </h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 pl-7 list-disc space-inside space-y-1">
              <li>In the console, navigate to <strong>Build &gt; Authentication &gt; Sign-in method</strong>, enable <strong>Email/Password</strong>.</li>
              <li>Go to <strong>Build &gt; Firestore Database</strong>, click <strong>Create database</strong> (choose your nearest region).</li>
              <li>The included <code className="text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">firestore.rules</code> file in the project directory is already configured for production security.</li>
            </ul>

            <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2 pt-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">3</span>
              <span>Add Web App & Environment Variables</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 pl-7">
              Add a Web app in Project Settings, copy the configuration credentials, and paste them into a <code className="text-emerald-600 dark:text-emerald-400 font-mono">.env</code> file in the project root:
            </p>
            <div className="pl-7 relative">
              <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                {sampleEnvText}
              </pre>
              <button
                onClick={() => handleCopy(sampleEnvText, 'env')}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Copy .env template"
              >
                {copiedStep === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white flex items-center space-x-2 pt-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">4</span>
              <span>Deploy to Firebase Hosting (Free Public URL)</span>
            </h4>
            <div className="pl-7 relative">
              <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                {deployCmds}
              </pre>
              <button
                onClick={() => handleCopy(deployCmds, 'deploy')}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Copy commands"
              >
                {copiedStep === 'deploy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
