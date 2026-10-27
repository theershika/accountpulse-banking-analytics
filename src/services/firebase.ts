import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Environment variables or fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if valid Firebase credentials are provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" &&
  firebaseConfig.apiKey.length > 10
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully with project:", firebaseConfig.projectId);
  } catch (err) {
    console.warn("Failed to initialize Firebase client, running in Demo Local Storage Mode:", err);
  }
} else {
  console.info(
    "%c[AccountPulse]%c Running in Interactive Demo Mode (Local Storage + Simulated Atomic Transactions). To connect real Firebase, provide VITE_FIREBASE_* in .env",
    "background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
    "color: inherit;"
  );
}

export { app, auth, db, firebaseConfig };
