import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Lock, Snowflake, Wifi } from 'lucide-react';
import { CardDetails } from '../../types';
import { maskCardNumber } from '../../utils/formatters';

interface VirtualDebitCardProps {
  card: CardDetails;
  onToggleFreeze?: () => void;
}

export const VirtualDebitCard: React.FC<VirtualDebitCardProps> = ({ card, onToggleFreeze }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(card.cardNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group perspective-1000 max-w-sm w-full mx-auto sm:mx-0">
      {/* 3D RuPay Platinum Debit Card Body */}
      <div
        className={`relative aspect-[1.586/1] w-full rounded-2xl p-6 text-white shadow-xl transition-all duration-300 transform group-hover:scale-[1.02] overflow-hidden ${
          card.isCardFrozen
            ? 'bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-900 border border-cyan-500/30'
            : 'bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-950 border border-emerald-500/30 shadow-emerald-950/40'
        }`}
      >
        {/* Ambient Indian Emerald/Saffron subtle glow effects */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Frozen Overlay */}
        {card.isCardFrozen && (
          <div className="absolute inset-0 bg-cyan-950/70 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center space-y-2 text-cyan-200">
            <Snowflake className="w-8 h-8 animate-pulse text-cyan-300" />
            <span className="text-xs font-bold tracking-widest uppercase bg-cyan-900/60 px-3 py-1 rounded-full border border-cyan-400/30">
              CARD TEMPORARILY FROZEN
            </span>
          </div>
        )}

        {/* Card Content Layout */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Top Row: Bank name & RuPay / NFC */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center font-black text-xs text-emerald-300">
                NV
              </div>
              <span className="font-extrabold tracking-wider text-sm bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                ACCOUNTPULSE BANK
              </span>
              <span className="text-[9px] uppercase font-semibold tracking-widest text-emerald-300/80 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20">
                PLATINUM
              </span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Wifi className="w-4 h-4 rotate-90" />
            </div>
          </div>

          {/* EMV Chip */}
          <div className="flex items-center space-x-3 my-auto">
            <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-inner flex items-center justify-center border border-amber-300/50">
              <div className="w-6 h-4 border border-amber-800/40 rounded-sm grid grid-cols-2 gap-0.5 opacity-60" />
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300/80 font-bold">
              DOMESTIC & INTERNATIONAL
            </span>
          </div>

          {/* Card Number */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-base sm:text-lg tracking-widest font-semibold drop-shadow-md">
                {showDetails ? card.cardNumber : maskCardNumber(card.cardNumber)}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition"
                  title={showDetails ? 'Hide details' : 'Reveal details'}
                >
                  {showDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition"
                  title="Copy card number"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Holder name, expiry, cvv, RuPay badge */}
          <div className="flex items-end justify-between pt-1 text-xs">
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono">
                Card Holder
              </span>
              <span className="font-semibold tracking-wide uppercase text-slate-200 text-[11px]">
                {card.cardHolder || 'VALUED CLIENT'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono">
                  Valid Thru
                </span>
                <span className="font-mono font-medium text-slate-200 text-[11px]">
                  {card.expiryMonth}/{card.expiryYear}
                </span>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-mono">
                  CVV
                </span>
                <span className="font-mono font-medium text-slate-200 text-[11px]">
                  {showDetails ? card.cvv : '•••'}
                </span>
              </div>
            </div>

            {/* RuPay Official Styling Pill */}
            <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 p-[1.5px] rounded-lg">
              <div className="bg-slate-900 px-2 py-0.5 rounded-[6px] flex items-center space-x-1 font-black text-xs tracking-wider">
                <span className="text-orange-400">Ru</span>
                <span className="text-white">Pay</span>
                <span className="text-[8px] text-green-400 font-bold ml-0.5">🇮🇳</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card action buttons below */}
      <div className="flex items-center justify-between mt-3 text-xs px-1">
        <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>RBI Certified RuPay EMV</span>
        </span>
        {onToggleFreeze && (
          <button
            type="button"
            onClick={onToggleFreeze}
            className={`font-semibold transition-colors flex items-center space-x-1 px-2.5 py-1 rounded-lg border ${
              card.isCardFrozen
                ? 'border-cyan-500/30 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Snowflake className="w-3 h-3" />
            <span>{card.isCardFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
