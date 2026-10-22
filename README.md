# NovaVault — Digital Banking Transaction Management System
> **College Capstone Project • Educational Banking Simulation Web Application**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/Academic-Educational%20Use%20Only-green.svg)]()

---

## ⚠️ Important Educational Simulation Disclaimer
**This application is strictly an educational banking simulation built for college project demonstration and evaluation.**
* No real money, payment gateways (e.g., Stripe, PayPal), or central clearing houses (ACH, Fedwire) are connected.
* All balances, accounts, cards, and routing codes are simulated demo assets.
* All balances and transaction receipts are explicitly labeled as **DEMO BALANCES**.

---

## 🌟 Key Project Highlights

1. **Enterprise-Grade UI/UX Design**
   * Built with React 19, TypeScript, and modern Tailwind CSS.
   * Responsive layout with collapsible sidebar and top navigation.
   * Persistent Light & Dark mode support.
   * Interactive Virtual Debit Card with 3D hover effects, number mask/reveal, and instant freezing.

2. **Complete Banking Life-Cycle Pages**
   * **Landing Page:** Interactive hero with live simulated Forex rates, technical specs, and instant evaluator login pills.
   * **User Registration:** Automatic 10-digit demo account number generation (`NV-XXXX-XXXX`), starter deposit tier selection, and password strength validation.
   * **Secure Login:** Email/password authentication, demo auto-fill for 1-click viva grading.
   * **Banking Dashboard:** Consolidated net worth, checking & savings breakdown cards, spending analytics, and quick-send beneficiaries.
   * **Account Balances:** High-yield savings tracker (4.25% APY simulation), savings goals progress bars, daily limit meters, and official wire specs.
   * **Deposit Money:** Simulated Direct Deposit, Mobile Check Scanner Simulator with OCR emulation, and Domestic Wire.
   * **Withdraw Money:** Simulated ATM cash dispenser, overdraw prevention, daily limit checks, and PIN verification.
   * **Inter-Account Transfers:** Real-time recipient lookup by account number or email with verification badges, two-sided atomic ledger sync, and celebratory feedback.
   * **Transaction History:** Real-time search, filters by type, pagination, print view, and 1-click CSV Statement download.
   * **Digital Verification Receipt:** Print-ready official receipt modal with reference IDs, timestamps, and 256-bit encryption simulation badges.
   * **User Profile:** Identity details editor, 2FA toggle simulation, ATM PIN configuration, and security session logs.
   * **Admin Console:** Restricted to authorized accounts (`role: 'admin'`). Provides global system liquidity KPIs, user freeze/unfreeze controls, liquidity adjustment modal, and system-wide audit logs.

3. **Atomic Transactions & Non-Negative Balance Safeguards**
   * Employs ACID-compliant database transactions (`runTransaction`).
   * Prevents race conditions and overdrafts.
   * Strictly enforces positive transaction values and balance limits.

4. **Dual-Mode Engine (Zero-Config Immediate Evaluation)**
   * **Mode 1 (Interactive Demo Engine):** Works immediately out of the box with zero setup! Pre-seeded with realistic accounts, atomic state locks, and local storage persistence.
   * **Mode 2 (Live Cloud Firestore & Firebase Auth):** Connects seamlessly by entering Firebase project credentials in `.env`.

---

## 👥 Preloaded Demo Personas for Evaluation

| Persona | Email | Account Number | Initial Checking | Initial Savings | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Alice Johnson** | `alice@demo.com` | `NV-2048-8912` | $14,850.50 | $28,400.00 | User |
| **Bob Smith** | `bob@demo.com` | `NV-5091-3482` | $5,240.25 | $11,500.00 | User |
| **Carlos Rodriguez** | `carlos@demo.com` | `NV-7834-1290` | $8,750.00 | $16,200.00 | User |
| **Operations Admin** | `admin@novavault.bank` | `NV-1000-0001` | $250,000.00 | $750,000.00 | Admin |

> *Tip: You can switch between any of these personas with 1 click using the "Switch User" dropdown in the top header or from the login screen!*

---

## 🚀 Getting Started Locally

### 1. Prerequisites
* Node.js v20+ and npm

### 2. Installation
```bash
# Clone or navigate to the project directory
cd kooojaaaa

# Install dependencies (already completed)
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized, production-ready bundle in the `dist` folder.

---

## 🔥 Firebase Setup Guide (Cloud Firestore & Hosting)

If you wish to connect your own free-tier Google Firebase backend:

### Step 1: Create a Project
1. Navigate to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and enter a name (e.g., `novavault-banking`).

### Step 2: Enable Firebase Authentication
1. Go to **Build > Authentication > Get started**.
2. Under **Sign-in method**, enable **Email/Password**.

### Step 3: Enable Cloud Firestore
1. Go to **Build > Firestore Database > Create database**.
2. Select your nearest region and start in **Production mode**.
3. Deploy the included `firestore.rules` file:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Step 4: Add Environment Variables
1. Go to **Project Settings > General > Your apps > Web app (</>)**.
2. Copy the credentials into a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY="AIzaSyYourActualApiKeyHere"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
```

### Step 5: Deploy to Firebase Hosting (Free Public URL)
```bash
# 1. Build the production application
npm run build

# 2. Install Firebase CLI globally (if not installed)
npm install -g firebase-tools

# 3. Log in to Firebase
firebase login

# 4. Initialize Hosting (select existing project and use "dist" as public directory)
firebase init hosting

# 5. Deploy live to free public URL!
firebase deploy --only hosting
```

Your banking application will be live at:
`https://your-project-id.web.app` or `https://your-project-id.firebaseapp.com`

---

## 🛡️ Security Architecture & Firestore Rules

The `firestore.rules` file enforces strict role-based access control:
* **Account Ownership:** Users can only query and read their own profile document.
* **Privilege Escalation Prevention:** Registration rejects any attempt to self-assign the `admin` role.
* **Balance Integrity:** Database rejections occur if balances are manipulated below zero.
* **Audit Trail Immutability:** Transaction logs cannot be deleted or modified by standard users.
* **Admin Guard:** Only accounts with `role == 'admin'` can execute account freeze commands or view system liquidity reports.

---

## 📁 Project Structure

```
kooojaaaa/
├── public/                 # Favicon and static assets
├── src/
│   ├── components/
│   │   ├── cards/
│   │   │   └── VirtualDebitCard.tsx    # 3D Debit card with freeze controls
│   │   └── common/
│   │       ├── EducationalBanner.tsx   # Academic simulation disclaimer
│   │       ├── FirebaseSetupModal.tsx  # Step-by-step setup modal
│   │       ├── Header.tsx              # Navbar with persona switcher & theme toggle
│   │       ├── ReceiptModal.tsx        # Official digital receipt generator
│   │       └── Sidebar.tsx             # Collapsible modern navigation
│   ├── context/
│   │   ├── AuthContext.tsx             # Session state & demo persona engine
│   │   └── ThemeContext.tsx            # Light/Dark mode state
│   ├── pages/
│   │   ├── AccountBalancePage.tsx      # High-yield savings & internal transfers
│   │   ├── AdminDashboardPage.tsx      # System liquidity & user freeze controls
│   │   ├── DashboardPage.tsx           # Net worth cards, card widget, analytics
│   │   ├── DepositPage.tsx             # Direct deposit & check scanner simulator
│   │   ├── LandingPage.tsx             # Public showcase & live Forex ticker
│   │   ├── LoginPage.tsx               # Client sign-in with 1-click test fill
│   │   ├── RegisterPage.tsx            # Account opening & tier selection
│   │   ├── TransactionHistoryPage.tsx  # Search, filters & CSV exporter
│   │   ├── TransferPage.tsx            # P2P transfers with recipient lookup & 2FA
│   │   ├── UserProfilePage.tsx         # Profile details & security settings
│   │   └── WithdrawPage.tsx            # ATM simulator with daily limits
│   ├── services/
│   │   ├── bankingService.ts           # Unified Firestore & atomic demo engine
│   │   └── firebase.ts                 # Firebase SDK client initialization
│   ├── types/
│   │   └── index.ts                    # TypeScript domain interfaces
│   ├── utils/
│   │   └── formatters.ts               # Currency, account numbers, dates
│   ├── App.tsx                         # Core application router
│   ├── index.css                       # Tailwind directives and custom scrollbar
│   └── main.tsx                        # Root React mounting
├── firestore.rules                     # Cloud Firestore production security rules
├── firebase.json                       # Firebase Hosting configuration
├── .firebaserc                         # Firebase project alias
├── tailwind.config.js                  # Tailwind design system configuration
├── tsconfig.json                       # TypeScript compiler configuration
└── package.json                        # Project dependencies and build scripts
```

---

## 🎓 Viva & Presentation Talking Points
1. **How is atomic consistency achieved?**
   Through Firestore `runTransaction` (and the mirror atomic simulation lock), ensuring that in a peer transfer, debiting the sender and crediting the recipient happen as a single unified atomic transaction. If either fails, the entire transaction rolls back.
2. **How are negative balances prevented?**
   Validation checks run both client-side and server-side in security rules (`balance >= 0` check), guaranteeing that overdrafts cannot occur.
3. **How does recipient lookup work?**
   The application performs real-time queries against the accounts registry as the user types, displaying the verified recipient name before the sender authorizes the transfer.
4. **Why is dual-mode valuable?**
   It allows immediate offline presentation during lab evaluations without requiring an active internet connection or pre-configured cloud API keys, while retaining 100% cloud readiness when deployed to Firebase Hosting.
