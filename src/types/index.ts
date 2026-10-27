export type UserRole = 'user' | 'admin';
export type CurrencyCode = 'INR';
export type AccountTier = 'Standard' | 'Gold' | 'Platinum';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer_out' | 'transfer_in' | 'internal_transfer';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export type TransferChannel = 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'INTERNAL';

export type TransactionCategory =
  | 'Deposit'
  | 'Withdrawal'
  | 'Transfer'
  | 'UPI Transfer'
  | 'Shopping'
  | 'Food & Dining'
  | 'Bills & Utilities'
  | 'Salary'
  | 'Education'
  | 'Entertainment'
  | 'General';

export interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  isCardFrozen: boolean;
  network: 'RuPay' | 'Visa';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline?: string;
}

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  accountNumber: string; // e.g. NV-4820-9182
  ifscCode: string; // e.g. NVBL000401
  micrCode: string; // e.g. 560002041
  branch: string;
  upiId: string; // e.g. name@novavault
  currency: CurrencyCode;
  checkingBalance: number; // Primary liquid / savings current
  savingsBalance: number;  // High-yield reserve / fixed deposit simulator
  isFrozen: boolean;
  createdAt: number;
  phoneNumber?: string;
  address?: string;
  tier: AccountTier;
  dailyWithdrawLimit: number;
  dailyWithdrawSpent: number;
  lastWithdrawDate?: string;
  card: CardDetails;
  savingsGoals?: SavingsGoal[];
  twoFactorEnabled?: boolean;
}

export interface Transaction {
  id: string;
  referenceId: string; // e.g. UTR-2026-904128
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  senderId: string;
  senderName: string;
  senderAccountNumber: string;
  recipientId?: string;
  recipientName?: string;
  recipientAccountNumber?: string;
  recipientUpiId?: string;
  fromAccountType: 'checking' | 'savings' | 'external_bank';
  toAccountType: 'checking' | 'savings' | 'external_bank';
  channel?: TransferChannel;
  category: TransactionCategory;
  status: TransactionStatus;
  timestamp: number;
  description: string;
  balanceAfter: number;
  fee?: number;
  notes?: string;
}

export interface DepositRequest {
  amount: number;
  destinationAccount: 'checking' | 'savings';
  method: 'upi' | 'neft_imps' | 'simulated_cheque' | 'net_banking';
  referenceNote?: string;
  chequeNumber?: string;
}

export interface WithdrawalRequest {
  amount: number;
  sourceAccount: 'checking' | 'savings';
  method: 'atm_cash' | 'branch_counter';
  referenceNote?: string;
  securityPin: string;
}

export interface TransferRequest {
  recipientAccountNumber: string; // or UPI ID
  amount: number;
  sourceAccount: 'checking' | 'savings';
  channel: TransferChannel;
  category: TransactionCategory;
  notes?: string;
  otpCode?: string;
}

export interface InternalTransferRequest {
  fromAccount: 'checking' | 'savings';
  toAccount: 'checking' | 'savings';
  amount: number;
  notes?: string;
}
