import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  runTransaction
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  UserAccount,
  Transaction,
  DepositRequest,
  WithdrawalRequest,
  TransferRequest,
  InternalTransferRequest,
  CurrencyCode
} from '../types';
import {
  generateAccountNumber,
  generateCardNumber,
  generateReferenceId,
  generateUPIId
} from '../utils/formatters';

const STORAGE_USERS_KEY = 'novavault_demo_users_inr_v1';
const STORAGE_TXNS_KEY = 'novavault_demo_txns_inr_v1';
const OLD_USD_USERS_KEY = 'novavault_demo_users_v2';
const OLD_USD_TXNS_KEY = 'novavault_demo_txns_v2';

// Same-origin in production: Flask serves the Vite bundle and owns persistence.
const flask = async (path: string, init?: RequestInit) => {
  const response = await fetch(path, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, ...init });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(body?.error || 'AccountPulse API request failed.');
  return body;
};
const apiTxn = (t: any): Transaction => ({ ...t, senderId: '', senderName: '', senderAccountNumber: '', fromAccountType: 'checking', toAccountType: 'checking', channel: 'INTERNAL', status: 'completed', notes: t.description });

export const DEFAULT_IFSC = 'NVBL000401';
export const DEFAULT_MICR = '560002041';
export const DEFAULT_BRANCH = 'Campus Center Branch, Bengaluru - 560001';

// Initial preloaded seed accounts in Indian Rupees (INR)
const INITIAL_DEMO_USERS_INR: UserAccount[] = [
  {
    uid: 'demo-admin-uid',
    email: 'admin@novavault.bank',
    displayName: 'NovaVault Operations Admin',
    role: 'admin',
    accountNumber: 'NV-1000-0001',
    ifscCode: DEFAULT_IFSC,
    micrCode: DEFAULT_MICR,
    branch: DEFAULT_BRANCH,
    upiId: 'admin@novavault',
    currency: 'INR',
    checkingBalance: 2500000.00, // ₹25,00,000 (₹25 Lakhs)
    savingsBalance: 15000000.00, // ₹1,50,00,000 (₹1.50 Crore)
    isFrozen: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
    phoneNumber: '+91 98765 43210',
    address: 'Level 14, Nova Tower, MG Road, Bengaluru, Karnataka 560001',
    tier: 'Platinum',
    dailyWithdrawLimit: 500000, // ₹5,00,000
    dailyWithdrawSpent: 0,
    twoFactorEnabled: true,
    card: {
      cardNumber: '6080 9901 2288 1001',
      cardHolder: 'ADMINISTRATOR',
      expiryMonth: '12',
      expiryYear: '29',
      cvv: '991',
      isCardFrozen: false,
      network: 'RuPay'
    },
    savingsGoals: [
      { id: 'goal-admin-1', name: 'Reserve Liquidity Buffer', targetAmount: 20000000, currentAmount: 15000000, category: 'Liquidity' }
    ]
  },
  {
    uid: 'demo-alice-uid',
    email: 'alice@demo.com',
    displayName: 'Alice Johnson',
    role: 'user',
    accountNumber: 'NV-2048-8912',
    ifscCode: DEFAULT_IFSC,
    micrCode: DEFAULT_MICR,
    branch: DEFAULT_BRANCH,
    upiId: 'alice@novavault',
    currency: 'INR',
    checkingBalance: 185000.00, // ₹1,85,000 (₹1.85 Lakhs)
    savingsBalance: 450000.00,  // ₹4,50,000 (₹4.50 Lakhs)
    isFrozen: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
    phoneNumber: '+91 98451 20489',
    address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103',
    tier: 'Gold',
    dailyWithdrawLimit: 50000, // ₹50,000
    dailyWithdrawSpent: 5000,
    twoFactorEnabled: true,
    card: {
      cardNumber: '6080 8820 1934 8912',
      cardHolder: 'ALICE JOHNSON',
      expiryMonth: '08',
      expiryYear: '28',
      cvv: '428',
      isCardFrozen: false,
      network: 'RuPay'
    },
    savingsGoals: [
      { id: 'goal-1', name: 'Higher Education Tuition Fund', targetAmount: 500000, currentAmount: 320000, category: 'Education', deadline: '2027-06-30' },
      { id: 'goal-2', name: 'MacBook Pro M4 Max', targetAmount: 250000, currentAmount: 180000, category: 'Tech' },
      { id: 'goal-3', name: 'Goa Weekend Holiday', targetAmount: 60000, currentAmount: 45000, category: 'Travel' }
    ]
  },
  {
    uid: 'demo-bob-uid',
    email: 'bob@demo.com',
    displayName: 'Bob Smith',
    role: 'user',
    accountNumber: 'NV-5091-3482',
    ifscCode: DEFAULT_IFSC,
    micrCode: DEFAULT_MICR,
    branch: DEFAULT_BRANCH,
    upiId: 'bob@novavault',
    currency: 'INR',
    checkingBalance: 42500.00, // ₹42,500
    savingsBalance: 120000.00, // ₹1,20,000
    isFrozen: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    phoneNumber: '+91 97402 50913',
    address: '12th Cross, Indiranagar, Bengaluru, Karnataka 560038',
    tier: 'Standard',
    dailyWithdrawLimit: 25000, // ₹25,000
    dailyWithdrawSpent: 0,
    twoFactorEnabled: false,
    card: {
      cardNumber: '6080 5519 8201 3482',
      cardHolder: 'BOB SMITH',
      expiryMonth: '03',
      expiryYear: '27',
      cvv: '815',
      isCardFrozen: false,
      network: 'RuPay'
    },
    savingsGoals: [
      { id: 'goal-bob-1', name: 'Emergency Rainy Day Fund', targetAmount: 200000, currentAmount: 120000, category: 'Safety' }
    ]
  },
  {
    uid: 'demo-carlos-uid',
    email: 'carlos@demo.com',
    displayName: 'Carlos Rodriguez',
    role: 'user',
    accountNumber: 'NV-7834-1290',
    ifscCode: DEFAULT_IFSC,
    micrCode: DEFAULT_MICR,
    branch: DEFAULT_BRANCH,
    upiId: 'carlos@novavault',
    currency: 'INR',
    checkingBalance: 95000.00, // ₹95,000
    savingsBalance: 250000.00, // ₹2,50,000
    isFrozen: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
    phoneNumber: '+91 99001 78341',
    address: '7th Block, Koramangala, Bengaluru, Karnataka 560095',
    tier: 'Gold',
    dailyWithdrawLimit: 50000,
    dailyWithdrawSpent: 0,
    twoFactorEnabled: true,
    card: {
      cardNumber: '6080 7701 9923 1290',
      cardHolder: 'CARLOS RODRIGUEZ',
      expiryMonth: '11',
      expiryYear: '28',
      cvv: '190',
      isCardFrozen: false,
      network: 'RuPay'
    },
    savingsGoals: [
      { id: 'goal-carlos-1', name: 'Apartment Security Deposit', targetAmount: 150000, currentAmount: 110000, category: 'Housing' }
    ]
  }
];

// Preloaded realistic seed transactions in Indian Rupees
const INITIAL_DEMO_TRANSACTIONS_INR: Transaction[] = [
  {
    id: 'txn-seed-1',
    referenceId: 'UTR-2026-1002914',
    type: 'deposit',
    amount: 125000.00,
    currency: 'INR',
    senderId: 'system',
    senderName: 'Infosys BPM Ltd Payroll',
    senderAccountNumber: 'CORP-SALARY-NEFT',
    recipientId: 'demo-alice-uid',
    recipientName: 'Alice Johnson',
    recipientAccountNumber: 'NV-2048-8912',
    fromAccountType: 'external_bank',
    toAccountType: 'checking',
    channel: 'NEFT',
    category: 'Salary',
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 12,
    description: 'Monthly Salary Credited via NEFT - Infosys Technologies',
    balanceAfter: 197500.00
  },
  {
    id: 'txn-seed-2',
    referenceId: 'UTR-2026-1004128',
    type: 'transfer_out',
    amount: 12500.00,
    currency: 'INR',
    senderId: 'demo-alice-uid',
    senderName: 'Alice Johnson',
    senderAccountNumber: 'NV-2048-8912',
    recipientId: 'demo-bob-uid',
    recipientName: 'Bob Smith',
    recipientAccountNumber: 'NV-5091-3482',
    recipientUpiId: 'bob@novavault',
    fromAccountType: 'checking',
    toAccountType: 'checking',
    channel: 'UPI',
    category: 'UPI Transfer',
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
    description: 'UPI Transfer to Bob Smith (bob@novavault) - Shared Hostel Rent',
    balanceAfter: 185000.00
  },
  {
    id: 'txn-seed-3',
    referenceId: 'UTR-2026-1004128',
    type: 'transfer_in',
    amount: 12500.00,
    currency: 'INR',
    senderId: 'demo-alice-uid',
    senderName: 'Alice Johnson',
    senderAccountNumber: 'NV-2048-8912',
    recipientId: 'demo-bob-uid',
    recipientName: 'Bob Smith',
    recipientAccountNumber: 'NV-5091-3482',
    fromAccountType: 'checking',
    toAccountType: 'checking',
    channel: 'UPI',
    category: 'UPI Transfer',
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7,
    description: 'UPI Transfer received from Alice Johnson',
    balanceAfter: 42500.00
  },
  {
    id: 'txn-seed-4',
    referenceId: 'UTR-2026-1005892',
    type: 'withdrawal',
    amount: 5000.00,
    currency: 'INR',
    senderId: 'demo-alice-uid',
    senderName: 'Alice Johnson',
    senderAccountNumber: 'NV-2048-8912',
    fromAccountType: 'checking',
    toAccountType: 'external_bank',
    channel: 'INTERNAL',
    category: 'Withdrawal',
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
    description: 'ATM Cash Dispensed - SBI Campus Center ATM #2',
    balanceAfter: 180000.00
  },
  {
    id: 'txn-seed-5',
    referenceId: 'UTR-2026-1006401',
    type: 'withdrawal',
    amount: 3450.00,
    currency: 'INR',
    senderId: 'demo-alice-uid',
    senderName: 'Alice Johnson',
    senderAccountNumber: 'NV-2048-8912',
    fromAccountType: 'checking',
    toAccountType: 'external_bank',
    channel: 'UPI',
    category: 'Bills & Utilities',
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2,
    description: 'BESCOM Electricity Bill Paid via Bharat BillPay (BBPS)',
    balanceAfter: 176550.00
  },
  {
    id: 'txn-seed-6',
    referenceId: 'UTR-2026-1007205',
    type: 'deposit',
    amount: 50000.00,
    currency: 'INR',
    senderId: 'system',
    senderName: 'CTS-2010 Cheque Clearance',
    senderAccountNumber: 'CHQ-CTS-401928',
    recipientId: 'demo-bob-uid',
    recipientName: 'Bob Smith',
    recipientAccountNumber: 'NV-5091-3482',
    fromAccountType: 'external_bank',
    toAccountType: 'checking',
    channel: 'INTERNAL',
    category: 'Deposit',
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 14,
    description: 'Simulated Mobile Cheque Scan #401928 Cleared via CTS',
    balanceAfter: 30000.00
  }
];

// Helper: Local storage accessor with safe INR migration
const getLocalUsers = (): UserAccount[] => {
  try {
    // Purge old USD storage keys if present
    if (localStorage.getItem(OLD_USD_USERS_KEY)) {
      localStorage.removeItem(OLD_USD_USERS_KEY);
      localStorage.removeItem(OLD_USD_TXNS_KEY);
      console.info('[NovaVault] Purged previous USD demo cache for clean Indian Rupee (INR) system conversion.');
    }

    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_DEMO_USERS_INR));
      return INITIAL_DEMO_USERS_INR;
    }
    const users: UserAccount[] = JSON.parse(raw);
    // Verify currency is INR on loaded users
    let needsResave = false;
    for (const u of users) {
      if (u.currency !== 'INR') {
        u.currency = 'INR';
        needsResave = true;
      }
      if (!u.ifscCode) {
        u.ifscCode = DEFAULT_IFSC;
        u.micrCode = DEFAULT_MICR;
        u.branch = DEFAULT_BRANCH;
        u.upiId = generateUPIId(u.displayName);
        needsResave = true;
      }
    }
    if (needsResave) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    }
    return users;
  } catch (err) {
    console.error('Failed reading local INR users, resetting to default:', err);
    return INITIAL_DEMO_USERS_INR;
  }
};

const saveLocalUsers = (users: UserAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed saving local users', err);
  }
};

const getLocalTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_TXNS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_TXNS_KEY, JSON.stringify(INITIAL_DEMO_TRANSACTIONS_INR));
      return INITIAL_DEMO_TRANSACTIONS_INR;
    }
    const txns: Transaction[] = JSON.parse(raw);
    // Ensure all transactions have currency INR
    let needsUpdate = false;
    for (const t of txns) {
      if (t.currency !== 'INR') {
        t.currency = 'INR';
        needsUpdate = true;
      }
    }
    if (needsUpdate) {
      localStorage.setItem(STORAGE_TXNS_KEY, JSON.stringify(txns));
    }
    return txns;
  } catch (err) {
    console.error('Failed reading local txns', err);
    return INITIAL_DEMO_TRANSACTIONS_INR;
  }
};

const saveLocalTransactions = (txns: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_TXNS_KEY, JSON.stringify(txns));
  } catch (err) {
    console.error('Failed saving local txns', err);
  }
};

export class BankingService {
  /**
   * Reset local demo database back to default Indian Rupee seed users and sample transactions
   */
  static resetDemoData(): void {
    localStorage.removeItem(OLD_USD_USERS_KEY);
    localStorage.removeItem(OLD_USD_TXNS_KEY);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_DEMO_USERS_INR));
    localStorage.setItem(STORAGE_TXNS_KEY, JSON.stringify(INITIAL_DEMO_TRANSACTIONS_INR));
  }

  /**
   * Fetch user account by UID
   */
  static async getUserAccount(uid: string): Promise<UserAccount | null> {
    try { return await flask('/api/me') as UserAccount; } catch (_) { /* Firebase/local fallback */ }
    if (isFirebaseConfigured && db) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          return userDoc.data() as UserAccount;
        }
      } catch (err) {
        console.warn('Firestore fetch failed, checking local storage:', err);
      }
    }

    const localUsers = getLocalUsers();
    return localUsers.find(u => u.uid === uid) || null;
  }

  /**
   * Find account by 10/12-digit Account Number (e.g. NV-2048-8912)
   */
  static async findAccountByNumber(accountNumber: string): Promise<UserAccount | null> {
    const cleanNumber = accountNumber.trim().toUpperCase();

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'users'), where('accountNumber', '==', cleanNumber));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs[0].data() as UserAccount;
        }
      } catch (err) {
        console.warn('Firestore lookup failed, checking local:', err);
      }
    }

    const localUsers = getLocalUsers();
    return localUsers.find(u => u.accountNumber.toUpperCase() === cleanNumber) || null;
  }

  /**
   * Find account by UPI ID (e.g. bob@novavault)
   */
  static async findAccountByUPI(upiId: string): Promise<UserAccount | null> {
    const cleanUpi = upiId.trim().toLowerCase();

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'users'), where('upiId', '==', cleanUpi));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs[0].data() as UserAccount;
        }
      } catch (err) {
        console.warn('Firestore UPI lookup failed, checking local:', err);
      }
    }

    const localUsers = getLocalUsers();
    return localUsers.find(u => (u.upiId || '').toLowerCase() === cleanUpi) || null;
  }

  /**
   * Find account by email address
   */
  static async findAccountByEmail(email: string): Promise<UserAccount | null> {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs[0].data() as UserAccount;
        }
      } catch (err) {
        console.warn('Firestore lookup failed, checking local:', err);
      }
    }

    const localUsers = getLocalUsers();
    return localUsers.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  /**
   * Create or register a new user demo account with INR balances
   */
  static async createUserAccount(accountData: Partial<UserAccount> & { uid: string; email: string; displayName: string }): Promise<UserAccount> {
    const starterChecking = accountData.checkingBalance ?? 50000.00; // Starter ₹50,000
    const starterSavings = accountData.savingsBalance ?? 25000.00;  // Starter ₹25,000

    const newAccount: UserAccount = {
      uid: accountData.uid,
      email: accountData.email.toLowerCase(),
      displayName: accountData.displayName,
      role: accountData.role || 'user',
      accountNumber: accountData.accountNumber || generateAccountNumber(),
      ifscCode: DEFAULT_IFSC,
      micrCode: DEFAULT_MICR,
      branch: DEFAULT_BRANCH,
      upiId: accountData.upiId || generateUPIId(accountData.displayName),
      currency: 'INR',
      checkingBalance: starterChecking,
      savingsBalance: starterSavings,
      isFrozen: false,
      createdAt: Date.now(),
      phoneNumber: accountData.phoneNumber || '+91 90000 00000',
      address: accountData.address || 'Campus Center, Bengaluru, Karnataka - 560001',
      tier: accountData.tier || 'Standard',
      dailyWithdrawLimit: 50000, // ₹50,000 daily
      dailyWithdrawSpent: 0,
      twoFactorEnabled: true,
      card: {
        cardNumber: generateCardNumber(),
        cardHolder: accountData.displayName.toUpperCase(),
        expiryMonth: '10',
        expiryYear: '29',
        cvv: String(Math.floor(100 + Math.random() * 900)),
        isCardFrozen: false,
        network: 'RuPay'
      },
      savingsGoals: [
        {
          id: `goal-${Date.now()}`,
          name: 'College Savings Goal',
          targetAmount: 100000,
          currentAmount: starterSavings,
          category: 'Education'
        }
      ]
    };

    // Initial starter deposit transaction in INR
    const initialDepositTxn: Transaction = {
      id: `txn-welcome-${Date.now()}`,
      referenceId: generateReferenceId(),
      type: 'deposit',
      amount: newAccount.checkingBalance,
      currency: 'INR',
      senderId: 'system',
      senderName: 'NovaVault Academic Welcome Grant',
      senderAccountNumber: 'WELCOME-GRANT',
      recipientId: newAccount.uid,
      recipientName: newAccount.displayName,
      recipientAccountNumber: newAccount.accountNumber,
      recipientUpiId: newAccount.upiId,
      fromAccountType: 'external_bank',
      toAccountType: 'checking',
      channel: 'NEFT',
      category: 'Deposit',
      status: 'completed',
      timestamp: Date.now(),
      description: 'Initial Simulated INR Account Opening Balance Credit',
      balanceAfter: newAccount.checkingBalance
    };

    // Write to Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'users', newAccount.uid), newAccount);
        await setDoc(doc(db, 'transactions', initialDepositTxn.id), initialDepositTxn);
      } catch (err) {
        console.warn('Failed saving to Firestore, saving to local state:', err);
      }
    }

    // Save to local storage
    const localUsers = getLocalUsers();
    const existingIndex = localUsers.findIndex(u => u.uid === newAccount.uid);
    if (existingIndex >= 0) {
      localUsers[existingIndex] = newAccount;
    } else {
      localUsers.push(newAccount);
    }
    saveLocalUsers(localUsers);

    const localTxns = getLocalTransactions();
    localTxns.unshift(initialDepositTxn);
    saveLocalTransactions(localTxns);

    return newAccount;
  }

  /**
   * Deposit Money (Simulated in INR)
   */
  static async deposit(uid: string, req: DepositRequest): Promise<{ success: boolean; transaction: Transaction; error?: string }> {
    try {
      const t = await flask('/api/transactions/deposit', { method: 'POST', body: JSON.stringify({ amount: req.amount, category: 'Deposit', description: req.referenceNote || 'Simulated INR deposit' }) });
      return { success: true, transaction: apiTxn(t) };
    } catch (error: any) {
      if (!String(error.message || '').includes('Failed to fetch')) return { success: false, transaction: null as any, error: error.message };
    }
    const amount = Number(req.amount);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, transaction: null as any, error: 'Deposit amount must be greater than ₹0.' };
    }

    if (amount > 10000000) {
      return { success: false, transaction: null as any, error: 'Maximum single demo deposit limit is ₹1,00,00,000 (1 Crore).' };
    }

    if (isFirebaseConfigured && db) {
      try {
        const userRef = doc(db, 'users', uid);
        const txnId = `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const txnRef = doc(db, 'transactions', txnId);

        const resultTxn = await runTransaction(db, async (t) => {
          const userDoc = await t.get(userRef);
          if (!userDoc.exists()) throw new Error('User account not found.');

          const userData = userDoc.data() as UserAccount;
          if (userData.isFrozen) throw new Error('This account is frozen. Deposits are disabled.');

          const currentBalance = req.destinationAccount === 'savings' ? userData.savingsBalance : userData.checkingBalance;
          const newBalance = Number((currentBalance + amount).toFixed(2));

          const updatePayload = req.destinationAccount === 'savings'
            ? { savingsBalance: newBalance }
            : { checkingBalance: newBalance };

          t.update(userRef, updatePayload);

          const txnRecord: Transaction = {
            id: txnId,
            referenceId: generateReferenceId(),
            type: 'deposit',
            amount,
            currency: 'INR',
            senderId: 'external',
            senderName: req.method === 'simulated_cheque' ? 'CTS Cheque Clearance' : (req.referenceNote || 'Simulated Inflow'),
            senderAccountNumber: 'EXT-INFLOW-INR',
            recipientId: userData.uid,
            recipientName: userData.displayName,
            recipientAccountNumber: userData.accountNumber,
            recipientUpiId: userData.upiId,
            fromAccountType: 'external_bank',
            toAccountType: req.destinationAccount,
            channel: req.method === 'upi' ? 'UPI' : (req.method === 'neft_imps' ? 'IMPS' : 'INTERNAL'),
            category: 'Deposit',
            status: 'completed',
            timestamp: Date.now(),
            description: req.method === 'simulated_cheque'
              ? `CTS-2010 Cheque Clearance #${req.chequeNumber || '102941'}: ${req.referenceNote || 'Cheque Deposit'}`
              : `Simulated Inward Remittance via ${req.method.toUpperCase().replace('_', '/')}`,
            balanceAfter: newBalance,
            notes: req.referenceNote
          };

          t.set(txnRef, txnRecord);
          return txnRecord;
        });

        this.syncLocalDeposit(uid, amount, req.destinationAccount, resultTxn);
        return { success: true, transaction: resultTxn };
      } catch (err: any) {
        console.warn('Firestore deposit failed, running in local simulator:', err);
        return this.localDeposit(uid, req);
      }
    }

    return this.localDeposit(uid, req);
  }

  private static localDeposit(uid: string, req: DepositRequest): { success: boolean; transaction: Transaction; error?: string } {
    const amount = Number(req.amount);
    const users = getLocalUsers();
    const user = users.find(u => u.uid === uid);

    if (!user) return { success: false, transaction: null as any, error: 'User account not found.' };
    if (user.isFrozen) return { success: false, transaction: null as any, error: 'This demo account is frozen by administrator.' };

    const currentBalance = req.destinationAccount === 'savings' ? user.savingsBalance : user.checkingBalance;
    const newBalance = Number((currentBalance + amount).toFixed(2));

    if (req.destinationAccount === 'savings') {
      user.savingsBalance = newBalance;
    } else {
      user.checkingBalance = newBalance;
    }
    saveLocalUsers(users);

    const txnRecord: Transaction = {
      id: `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      referenceId: generateReferenceId(),
      type: 'deposit',
      amount,
      currency: 'INR',
      senderId: 'external',
      senderName: req.method === 'simulated_cheque' ? 'CTS Cheque Clearance' : 'Simulated Inward Remittance',
      senderAccountNumber: 'EXT-INFLOW-INR',
      recipientId: user.uid,
      recipientName: user.displayName,
      recipientAccountNumber: user.accountNumber,
      recipientUpiId: user.upiId,
      fromAccountType: 'external_bank',
      toAccountType: req.destinationAccount,
      channel: req.method === 'upi' ? 'UPI' : (req.method === 'neft_imps' ? 'IMPS' : 'INTERNAL'),
      category: 'Deposit',
      status: 'completed',
      timestamp: Date.now(),
      description: req.method === 'simulated_cheque'
        ? `CTS-2010 Cheque Clearance #${req.chequeNumber || '102941'}: ${req.referenceNote || 'Cheque Deposit'}`
        : `Simulated Inward Remittance via ${req.method.toUpperCase().replace('_', '/')}`,
      balanceAfter: newBalance,
      notes: req.referenceNote
    };

    const txns = getLocalTransactions();
    txns.unshift(txnRecord);
    saveLocalTransactions(txns);

    return { success: true, transaction: txnRecord };
  }

  private static syncLocalDeposit(uid: string, amount: number, destination: 'checking' | 'savings', txn: Transaction) {
    const users = getLocalUsers();
    const u = users.find(x => x.uid === uid);
    if (u) {
      if (destination === 'savings') {
        u.savingsBalance = Number((u.savingsBalance + amount).toFixed(2));
      } else {
        u.checkingBalance = Number((u.checkingBalance + amount).toFixed(2));
      }
      saveLocalUsers(users);
    }
    const txns = getLocalTransactions();
    txns.unshift(txn);
    saveLocalTransactions(txns);
  }

  /**
   * Withdraw Money (Simulated in INR)
   */
  static async withdraw(uid: string, req: WithdrawalRequest): Promise<{ success: boolean; transaction: Transaction; error?: string }> {
    try {
      const t = await flask('/api/transactions/withdrawal', { method: 'POST', body: JSON.stringify({ amount: req.amount, category: 'Withdrawal', description: req.referenceNote || 'Simulated INR withdrawal' }) });
      return { success: true, transaction: apiTxn(t) };
    } catch (error: any) {
      if (!String(error.message || '').includes('Failed to fetch')) return { success: false, transaction: null as any, error: error.message };
    }
    const amount = Number(req.amount);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, transaction: null as any, error: 'Withdrawal amount must be greater than ₹0.' };
    }

    if (isFirebaseConfigured && db) {
      try {
        const userRef = doc(db, 'users', uid);
        const txnId = `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const txnRef = doc(db, 'transactions', txnId);

        const resultTxn = await runTransaction(db, async (t) => {
          const userDoc = await t.get(userRef);
          if (!userDoc.exists()) throw new Error('User account not found.');

          const userData = userDoc.data() as UserAccount;
          if (userData.isFrozen) throw new Error('This account is frozen. Withdrawals disabled.');

          const currentBalance = req.sourceAccount === 'savings' ? userData.savingsBalance : userData.checkingBalance;
          if (currentBalance < amount) {
            throw new Error(`Insufficient funds. Your demo balance is ₹${currentBalance.toLocaleString('en-IN')}, attempted withdrawal is ₹${amount.toLocaleString('en-IN')}.`);
          }

          if (userData.dailyWithdrawSpent + amount > userData.dailyWithdrawLimit) {
            throw new Error(`Daily demo withdrawal limit exceeded! Limit: ₹${userData.dailyWithdrawLimit.toLocaleString('en-IN')}, spent: ₹${userData.dailyWithdrawSpent.toLocaleString('en-IN')}.`);
          }

          const newBalance = Number((currentBalance - amount).toFixed(2));
          const newSpent = userData.dailyWithdrawSpent + amount;

          const updatePayload = req.sourceAccount === 'savings'
            ? { savingsBalance: newBalance, dailyWithdrawSpent: newSpent }
            : { checkingBalance: newBalance, dailyWithdrawSpent: newSpent };

          t.update(userRef, updatePayload);

          const txnRecord: Transaction = {
            id: txnId,
            referenceId: generateReferenceId(),
            type: 'withdrawal',
            amount,
            currency: 'INR',
            senderId: userData.uid,
            senderName: userData.displayName,
            senderAccountNumber: userData.accountNumber,
            fromAccountType: req.sourceAccount,
            toAccountType: 'external_bank',
            channel: 'INTERNAL',
            category: 'Withdrawal',
            status: 'completed',
            timestamp: Date.now(),
            description: `ATM Cash Dispensation - Campus ATM: ${req.referenceNote || 'Cash Dispensed'}`,
            balanceAfter: newBalance,
            notes: req.referenceNote
          };

          t.set(txnRef, txnRecord);
          return txnRecord;
        });

        this.syncLocalWithdrawal(uid, amount, req.sourceAccount, resultTxn);
        return { success: true, transaction: resultTxn };
      } catch (err: any) {
        console.warn('Firestore withdrawal failed, fallback to local simulator:', err);
        return this.localWithdraw(uid, req);
      }
    }

    return this.localWithdraw(uid, req);
  }

  private static localWithdraw(uid: string, req: WithdrawalRequest): { success: boolean; transaction: Transaction; error?: string } {
    const amount = Number(req.amount);
    const users = getLocalUsers();
    const user = users.find(u => u.uid === uid);

    if (!user) return { success: false, transaction: null as any, error: 'User account not found.' };
    if (user.isFrozen) return { success: false, transaction: null as any, error: 'Account is frozen by administrator.' };

    const currentBalance = req.sourceAccount === 'savings' ? user.savingsBalance : user.checkingBalance;
    if (currentBalance < amount) {
      return {
        success: false,
        transaction: null as any,
        error: `Insufficient funds! Available: ₹${currentBalance.toLocaleString('en-IN')}, Requested: ₹${amount.toLocaleString('en-IN')}.`
      };
    }

    if ((user.dailyWithdrawSpent || 0) + amount > user.dailyWithdrawLimit) {
      return {
        success: false,
        transaction: null as any,
        error: `Daily withdrawal limit exceeded! Max daily: ₹${user.dailyWithdrawLimit.toLocaleString('en-IN')}, remaining today: ₹${(user.dailyWithdrawLimit - (user.dailyWithdrawSpent || 0)).toLocaleString('en-IN')}.`
      };
    }

    const newBalance = Number((currentBalance - amount).toFixed(2));
    if (req.sourceAccount === 'savings') {
      user.savingsBalance = newBalance;
    } else {
      user.checkingBalance = newBalance;
    }
    user.dailyWithdrawSpent = (user.dailyWithdrawSpent || 0) + amount;
    saveLocalUsers(users);

    const txnRecord: Transaction = {
      id: `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      referenceId: generateReferenceId(),
      type: 'withdrawal',
      amount,
      currency: 'INR',
      senderId: user.uid,
      senderName: user.displayName,
      senderAccountNumber: user.accountNumber,
      fromAccountType: req.sourceAccount,
      toAccountType: 'external_bank',
      channel: 'INTERNAL',
      category: 'Withdrawal',
      status: 'completed',
      timestamp: Date.now(),
      description: `ATM Cash Dispensation - Campus ATM: ${req.referenceNote || 'Cash Dispensed'}`,
      balanceAfter: newBalance,
      notes: req.referenceNote
    };

    const txns = getLocalTransactions();
    txns.unshift(txnRecord);
    saveLocalTransactions(txns);

    return { success: true, transaction: txnRecord };
  }

  private static syncLocalWithdrawal(uid: string, amount: number, source: 'checking' | 'savings', txn: Transaction) {
    const users = getLocalUsers();
    const u = users.find(x => x.uid === uid);
    if (u) {
      if (source === 'savings') {
        u.savingsBalance = Number((u.savingsBalance - amount).toFixed(2));
      } else {
        u.checkingBalance = Number((u.checkingBalance - amount).toFixed(2));
      }
      u.dailyWithdrawSpent = (u.dailyWithdrawSpent || 0) + amount;
      saveLocalUsers(users);
    }
    const txns = getLocalTransactions();
    txns.unshift(txn);
    saveLocalTransactions(txns);
  }

  /**
   * Transfer Funds Between Registered Demo Accounts (in INR)
   * Supports Account Number or UPI ID lookup!
   */
  static async transferFunds(senderUid: string, req: TransferRequest): Promise<{ success: boolean; transaction: Transaction; error?: string }> {
    try {
      const t = await flask('/api/transfers', { method: 'POST', body: JSON.stringify({ accountNumber: req.recipientAccountNumber, amount: req.amount, category: req.category }) });
      return { success: true, transaction: apiTxn(t) };
    } catch (error: any) {
      if (!String(error.message || '').includes('Failed to fetch')) return { success: false, transaction: null as any, error: error.message };
    }
    const amount = Number(req.amount);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, transaction: null as any, error: 'Transfer amount must be greater than ₹0.' };
    }

    const cleanRecipientQuery = req.recipientAccountNumber.trim().toUpperCase();

    // 1. Firebase live mode atomic transaction
    if (isFirebaseConfigured && db) {
      try {
        const senderRef = doc(db, 'users', senderUid);

        // Find recipient by Account Number OR UPI ID
        let recipientSnap = await getDocs(query(collection(db, 'users'), where('accountNumber', '==', cleanRecipientQuery)));
        if (recipientSnap.empty) {
          recipientSnap = await getDocs(query(collection(db, 'users'), where('upiId', '==', cleanRecipientQuery.toLowerCase())));
        }

        if (recipientSnap.empty) {
          return { success: false, transaction: null as any, error: `Recipient "${cleanRecipientQuery}" not found in registered accounts.` };
        }

        const recipientDocSnapshot = recipientSnap.docs[0];
        const recipientRef = doc(db, 'users', recipientDocSnapshot.id);

        const refId = generateReferenceId();
        const txnSenderId = `txn-out-${Date.now()}`;
        const txnRecipientId = `txn-in-${Date.now()}`;

        const result = await runTransaction(db, async (t) => {
          const senderDoc = await t.get(senderRef);
          const recipientDoc = await t.get(recipientRef);

          if (!senderDoc.exists()) throw new Error('Sender account not found.');
          if (!recipientDoc.exists()) throw new Error('Recipient account not found.');

          const senderData = senderDoc.data() as UserAccount;
          const recipientData = recipientDoc.data() as UserAccount;

          if (senderData.isFrozen) throw new Error('Your demo account is frozen. Transfers are blocked.');
          if (recipientData.isFrozen) throw new Error('The recipient demo account is frozen.');
          if (senderData.accountNumber.toUpperCase() === recipientData.accountNumber.toUpperCase()) {
            throw new Error('Cannot transfer to your own account via external transfer. Use Internal Account Transfer.');
          }

          const senderBalance = req.sourceAccount === 'savings' ? senderData.savingsBalance : senderData.checkingBalance;
          if (senderBalance < amount) {
            throw new Error(`Insufficient funds. Your demo balance is ₹${senderBalance.toLocaleString('en-IN')}, transfer amount is ₹${amount.toLocaleString('en-IN')}.`);
          }

          const newSenderBalance = Number((senderBalance - amount).toFixed(2));
          const newRecipientBalance = Number((recipientData.checkingBalance + amount).toFixed(2));

          if (req.sourceAccount === 'savings') {
            t.update(senderRef, { savingsBalance: newSenderBalance });
          } else {
            t.update(senderRef, { checkingBalance: newSenderBalance });
          }
          t.update(recipientRef, { checkingBalance: newRecipientBalance });

          // Sender Transaction
          const senderTxn: Transaction = {
            id: txnSenderId,
            referenceId: refId,
            type: 'transfer_out',
            amount,
            currency: 'INR',
            senderId: senderData.uid,
            senderName: senderData.displayName,
            senderAccountNumber: senderData.accountNumber,
            recipientId: recipientData.uid,
            recipientName: recipientData.displayName,
            recipientAccountNumber: recipientData.accountNumber,
            recipientUpiId: recipientData.upiId,
            fromAccountType: req.sourceAccount,
            toAccountType: 'checking',
            channel: req.channel,
            category: req.category || 'Transfer',
            status: 'completed',
            timestamp: Date.now(),
            description: `${req.channel} Transfer to ${recipientData.displayName} (${recipientData.accountNumber})${req.notes ? ': ' + req.notes : ''}`,
            balanceAfter: newSenderBalance,
            notes: req.notes
          };

          // Recipient Transaction
          const recipientTxn: Transaction = {
            id: txnRecipientId,
            referenceId: refId,
            type: 'transfer_in',
            amount,
            currency: 'INR',
            senderId: senderData.uid,
            senderName: senderData.displayName,
            senderAccountNumber: senderData.accountNumber,
            recipientId: recipientData.uid,
            recipientName: recipientData.displayName,
            recipientAccountNumber: recipientData.accountNumber,
            recipientUpiId: recipientData.upiId,
            fromAccountType: req.sourceAccount,
            toAccountType: 'checking',
            channel: req.channel,
            category: req.category || 'Transfer',
            status: 'completed',
            timestamp: Date.now(),
            description: `${req.channel} Transfer received from ${senderData.displayName} (${senderData.accountNumber})${req.notes ? ': ' + req.notes : ''}`,
            balanceAfter: newRecipientBalance,
            notes: req.notes
          };

          t.set(doc(db, 'transactions', txnSenderId), senderTxn);
          t.set(doc(db, 'transactions', txnRecipientId), recipientTxn);

          return { senderTxn, recipientTxn };
        });

        this.syncLocalTransfer(result.senderTxn, result.recipientTxn, amount, req.sourceAccount);
        return { success: true, transaction: result.senderTxn };
      } catch (err: any) {
        console.warn('Firestore transfer failed, executing in local simulator:', err);
        return this.localTransfer(senderUid, req);
      }
    }

    return this.localTransfer(senderUid, req);
  }

  private static localTransfer(senderUid: string, req: TransferRequest): { success: boolean; transaction: Transaction; error?: string } {
    const amount = Number(req.amount);
    const cleanQuery = req.recipientAccountNumber.trim().toUpperCase();
    const users = getLocalUsers();

    const sender = users.find(u => u.uid === senderUid);
    if (!sender) return { success: false, transaction: null as any, error: 'Sender account not found.' };

    const recipient = users.find(u =>
      u.accountNumber.toUpperCase() === cleanQuery ||
      (u.upiId && u.upiId.toUpperCase() === cleanQuery) ||
      (u.email && u.email.toUpperCase() === cleanQuery)
    );

    if (!recipient) {
      return {
        success: false,
        transaction: null as any,
        error: `Demo recipient "${cleanQuery}" does not exist. Check Account Number (e.g. NV-5091-3482) or UPI ID (e.g. bob@novavault).`
      };
    }

    if (sender.accountNumber.toUpperCase() === recipient.accountNumber.toUpperCase()) {
      return {
        success: false,
        transaction: null as any,
        error: 'Cannot transfer funds to your own account via external transfer. Please use internal account transfer.'
      };
    }

    if (sender.isFrozen) {
      return { success: false, transaction: null as any, error: 'Your demo account is frozen. Outgoing transfers are blocked.' };
    }
    if (recipient.isFrozen) {
      return { success: false, transaction: null as any, error: 'Recipient account is frozen and cannot receive incoming funds.' };
    }

    const senderBalance = req.sourceAccount === 'savings' ? sender.savingsBalance : sender.checkingBalance;
    if (senderBalance < amount) {
      return {
        success: false,
        transaction: null as any,
        error: `Insufficient funds! Available balance: ₹${senderBalance.toLocaleString('en-IN')}, required: ₹${amount.toLocaleString('en-IN')}.`
      };
    }

    const newSenderBalance = Number((senderBalance - amount).toFixed(2));
    const newRecipientBalance = Number((recipient.checkingBalance + amount).toFixed(2));

    if (req.sourceAccount === 'savings') {
      sender.savingsBalance = newSenderBalance;
    } else {
      sender.checkingBalance = newSenderBalance;
    }
    recipient.checkingBalance = newRecipientBalance;
    saveLocalUsers(users);

    const refId = generateReferenceId();
    const senderTxn: Transaction = {
      id: `txn-out-${Date.now()}`,
      referenceId: refId,
      type: 'transfer_out',
      amount,
      currency: 'INR',
      senderId: sender.uid,
      senderName: sender.displayName,
      senderAccountNumber: sender.accountNumber,
      recipientId: recipient.uid,
      recipientName: recipient.displayName,
      recipientAccountNumber: recipient.accountNumber,
      recipientUpiId: recipient.upiId,
      fromAccountType: req.sourceAccount,
      toAccountType: 'checking',
      channel: req.channel,
      category: req.category || 'Transfer',
      status: 'completed',
      timestamp: Date.now(),
      description: `${req.channel} Transfer to ${recipient.displayName} (${recipient.accountNumber})${req.notes ? ': ' + req.notes : ''}`,
      balanceAfter: newSenderBalance,
      notes: req.notes
    };

    const recipientTxn: Transaction = {
      id: `txn-in-${Date.now()}`,
      referenceId: refId,
      type: 'transfer_in',
      amount,
      currency: 'INR',
      senderId: sender.uid,
      senderName: sender.displayName,
      senderAccountNumber: sender.accountNumber,
      recipientId: recipient.uid,
      recipientName: recipient.displayName,
      recipientAccountNumber: recipient.accountNumber,
      recipientUpiId: recipient.upiId,
      fromAccountType: req.sourceAccount,
      toAccountType: 'checking',
      channel: req.channel,
      category: req.category || 'Transfer',
      status: 'completed',
      timestamp: Date.now(),
      description: `${req.channel} Transfer received from ${sender.displayName} (${sender.accountNumber})${req.notes ? ': ' + req.notes : ''}`,
      balanceAfter: newRecipientBalance,
      notes: req.notes
    };

    const txns = getLocalTransactions();
    txns.unshift(senderTxn);
    txns.unshift(recipientTxn);
    saveLocalTransactions(txns);

    return { success: true, transaction: senderTxn };
  }

  private static syncLocalTransfer(senderTxn: Transaction, recipientTxn: Transaction, amount: number, sourceAccount: 'checking' | 'savings') {
    const users = getLocalUsers();
    const sender = users.find(u => u.uid === senderTxn.senderId);
    const recipient = users.find(u => u.uid === recipientTxn.recipientId);

    if (sender) {
      if (sourceAccount === 'savings') {
        sender.savingsBalance = Number((sender.savingsBalance - amount).toFixed(2));
      } else {
        sender.checkingBalance = Number((sender.checkingBalance - amount).toFixed(2));
      }
    }
    if (recipient) {
      recipient.checkingBalance = Number((recipient.checkingBalance + amount).toFixed(2));
    }
    saveLocalUsers(users);

    const txns = getLocalTransactions();
    txns.unshift(senderTxn);
    txns.unshift(recipientTxn);
    saveLocalTransactions(txns);
  }

  /**
   * Internal Transfer (Checking <-> Savings in INR)
   */
  static async internalTransfer(uid: string, req: InternalTransferRequest): Promise<{ success: boolean; transaction: Transaction; error?: string }> {
    const amount = Number(req.amount);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, transaction: null as any, error: 'Amount must be greater than ₹0.' };
    }
    if (req.fromAccount === req.toAccount) {
      return { success: false, transaction: null as any, error: 'Source and destination accounts must be different.' };
    }

    const users = getLocalUsers();
    const user = users.find(u => u.uid === uid);
    if (!user) return { success: false, transaction: null as any, error: 'Account not found.' };

    const sourceBal = req.fromAccount === 'checking' ? user.checkingBalance : user.savingsBalance;
    if (sourceBal < amount) {
      return { success: false, transaction: null as any, error: `Insufficient funds in ${req.fromAccount} account.` };
    }

    if (req.fromAccount === 'checking') {
      user.checkingBalance = Number((user.checkingBalance - amount).toFixed(2));
      user.savingsBalance = Number((user.savingsBalance + amount).toFixed(2));
    } else {
      user.savingsBalance = Number((user.savingsBalance - amount).toFixed(2));
      user.checkingBalance = Number((user.checkingBalance + amount).toFixed(2));
    }
    saveLocalUsers(users);

    const refId = generateReferenceId();
    const txnRecord: Transaction = {
      id: `txn-internal-${Date.now()}`,
      referenceId: refId,
      type: 'internal_transfer',
      amount,
      currency: 'INR',
      senderId: user.uid,
      senderName: user.displayName,
      senderAccountNumber: user.accountNumber,
      recipientId: user.uid,
      recipientName: user.displayName,
      recipientAccountNumber: user.accountNumber,
      fromAccountType: req.fromAccount,
      toAccountType: req.toAccount,
      channel: 'INTERNAL',
      category: 'Transfer',
      status: 'completed',
      timestamp: Date.now(),
      description: `Internal Transfer: ${req.fromAccount.toUpperCase()} to ${req.toAccount.toUpperCase()}${req.notes ? ' - ' + req.notes : ''}`,
      balanceAfter: req.fromAccount === 'checking' ? user.checkingBalance : user.savingsBalance,
      notes: req.notes
    };

    const txns = getLocalTransactions();
    txns.unshift(txnRecord);
    saveLocalTransactions(txns);

    return { success: true, transaction: txnRecord };
  }

  /**
   * Fetch transactions for a specific user
   */
  static async getUserTransactions(uid: string): Promise<Transaction[]> {
    try { return (await flask('/api/transactions')).map(apiTxn); } catch (_) { /* Firebase/local fallback */ }
    if (isFirebaseConfigured && db) {
      try {
        const qSender = query(collection(db, 'transactions'), where('senderId', '==', uid));
        const qRecipient = query(collection(db, 'transactions'), where('recipientId', '==', uid));
        const [senderSnap, recipientSnap] = await Promise.all([getDocs(qSender), getDocs(qRecipient)]);

        const map = new Map<string, Transaction>();
        senderSnap.docs.forEach(d => map.set(d.id, d.data() as Transaction));
        recipientSnap.docs.forEach(d => map.set(d.id, d.data() as Transaction));

        return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
      } catch (err) {
        console.warn('Firestore transactions query failed, loading from local state:', err);
      }
    }

    const allTxns = getLocalTransactions();
    return allTxns
      .filter(t => t.senderId === uid || t.recipientId === uid)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Admin: Fetch all registered users
   */
  static async getAllUsers(): Promise<UserAccount[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as UserAccount);
        }
      } catch (err) {
        console.warn('Firestore users fetch failed, loading local:', err);
      }
    }

    return getLocalUsers();
  }

  /**
   * Admin: Fetch all transactions system-wide
   */
  static async getAllTransactions(): Promise<Transaction[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'transactions'));
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as Transaction).sort((a, b) => b.timestamp - a.timestamp);
        }
      } catch (err) {
        console.warn('Firestore txns fetch failed, loading local:', err);
      }
    }

    return getLocalTransactions().sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Admin: Freeze or Unfreeze an account
   */
  static async toggleFreezeAccount(uid: string, freeze: boolean): Promise<boolean> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', uid), { isFrozen: freeze });
      } catch (err) {
        console.warn('Firestore freeze update failed:', err);
      }
    }

    const users = getLocalUsers();
    const user = users.find(u => u.uid === uid);
    if (user) {
      user.isFrozen = freeze;
      saveLocalUsers(users);
      return true;
    }
    return false;
  }

  /**
   * Admin: Adjust user balance in INR
   */
  static async adjustBalance(uid: string, checkingAdjustment: number, reason: string): Promise<boolean> {
    const users = getLocalUsers();
    const user = users.find(u => u.uid === uid);
    if (!user) return false;

    const newChecking = Number((user.checkingBalance + checkingAdjustment).toFixed(2));
    if (newChecking < 0) return false;

    user.checkingBalance = newChecking;
    saveLocalUsers(users);

    const txnRecord: Transaction = {
      id: `txn-admin-adj-${Date.now()}`,
      referenceId: generateReferenceId(),
      type: checkingAdjustment >= 0 ? 'deposit' : 'withdrawal',
      amount: Math.abs(checkingAdjustment),
      currency: 'INR',
      senderId: 'admin-action',
      senderName: 'NovaVault Operations Admin',
      senderAccountNumber: 'ADMIN-ADJUSTMENT',
      recipientId: user.uid,
      recipientName: user.displayName,
      recipientAccountNumber: user.accountNumber,
      fromAccountType: 'external_bank',
      toAccountType: 'checking',
      channel: 'INTERNAL',
      category: 'General',
      status: 'completed',
      timestamp: Date.now(),
      description: `Administrative Liquidity Adjustment: ${reason}`,
      balanceAfter: newChecking,
      notes: reason
    };

    const txns = getLocalTransactions();
    txns.unshift(txnRecord);
    saveLocalTransactions(txns);

    return true;
  }

  /**
   * Update Profile Details
   */
  static async updateProfile(uid: string, updates: Partial<UserAccount>): Promise<UserAccount | null> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', uid), updates);
      } catch (err) {
        console.warn('Firestore update profile failed:', err);
      }
    }

    const users = getLocalUsers();
    const user = users.find(u => u.uid === uid);
    if (user) {
      Object.assign(user, updates);
      saveLocalUsers(users);
      return user;
    }
    return null;
  }

  /**
   * Toggle Virtual Debit Card Freeze
   */
  static async toggleCardFreeze(uid: string): Promise<boolean> {
    const users = getLocalUsers();
    const user = users.find(u => u.uid === uid);
    if (user && user.card) {
      user.card.isCardFrozen = !user.card.isCardFrozen;
      saveLocalUsers(users);
      return user.card.isCardFrozen;
    }
    return false;
  }
}
