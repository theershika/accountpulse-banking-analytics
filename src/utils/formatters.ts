import { CurrencyCode } from '../types';

export const CURRENCY_SYMBOL = '₹';

/**
 * Format currency strictly in Indian Rupee format (en-IN):
 * e.g. ₹1,000.00, ₹10,000.00, ₹1,00,000.00, ₹10,00,000.00, ₹1,00,00,000.00
 */
export const formatCurrency = (
  amount: number,
  currency: CurrencyCode = 'INR',
  showSign: boolean = false
): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount || 0);

  // Formats in Indian lakhs and crores system (en-IN)
  const formatted = absAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (showSign && amount > 0) {
    return `+₹${formatted}`;
  }
  if (isNegative) {
    return `-₹${formatted}`;
  }
  return `₹${formatted}`;
};

/**
 * Compact Indian Lakhs / Crores representation for summary metrics
 * e.g. ₹1.50 Cr, ₹25.00 L, ₹50,000
 */
export const formatIndianWords = (amount: number): string => {
  const abs = Math.abs(amount || 0);
  if (abs >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return formatCurrency(amount);
};

export const formatAccountNumber = (accNumber: string): string => {
  if (!accNumber) return 'NV-0000-0000';
  return accNumber;
};

export const maskAccountNumber = (accNumber: string): string => {
  if (!accNumber || accNumber.length < 8) return '**** ****';
  const parts = accNumber.split('-');
  if (parts.length >= 3) {
    return `${parts[0]}-****-${parts[2]}`;
  }
  return `****${accNumber.slice(-4)}`;
};

export const maskCardNumber = (cardNum: string): string => {
  if (!cardNum) return '•••• •••• •••• ••••';
  const clean = cardNum.replace(/\s+/g, '');
  if (clean.length < 16) return clean;
  return `•••• •••• •••• ${clean.slice(-4)}`;
};

export const formatDate = (timestamp: number): string => {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (timestamp: number): string => {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const generateAccountNumber = (): string => {
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  return `NV-${part1}-${part2}`;
};

export const generateUPIId = (name: string): string => {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean || 'user'}@novavault`;
};

export const generateCardNumber = (): string => {
  // RuPay card demo BIN prefix 6080
  const p1 = '6080';
  const p2 = Math.floor(1000 + Math.random() * 9000);
  const p3 = Math.floor(1000 + Math.random() * 9000);
  const p4 = Math.floor(1000 + Math.random() * 9000);
  return `${p1} ${p2} ${p3} ${p4}`;
};

export const generateReferenceId = (): string => {
  // Indian Banking UTR (Unique Transaction Reference) format
  const random = Math.floor(10000000 + Math.random() * 90000000);
  const year = new Date().getFullYear();
  return `UTR-${year}-${random}`;
};
