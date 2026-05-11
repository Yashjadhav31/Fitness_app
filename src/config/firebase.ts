import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseConfig = {
  apiKey: envConfig.apiKey || 'AIzaSyCPGi-WZIOC6OqY0l9Q4FOSFsSLvUo9_8c',
  authDomain: envConfig.authDomain || 'ai-fitness-5bc96.firebaseapp.com',
  projectId: envConfig.projectId || 'ai-fitness-5bc96',
  storageBucket: envConfig.storageBucket || 'ai-fitness-5bc96.firebasestorage.app',
  messagingSenderId: envConfig.messagingSenderId || '1046617858186',
  appId: envConfig.appId || '1:1046617858186:web:2a55d47f927638632bcd73',
  measurementId: envConfig.measurementId || 'G-GV81HREGR4',
};

const firestoreDatabaseId =
  ((import.meta.env.VITE_FIREBASE_DATABASE_ID as string | undefined) || 'default').trim();

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

let _db: Firestore | null = null;
try {
  _db = getFirestore(app, firestoreDatabaseId);
  console.info(`[firebase] Firestore initialized for database "${firestoreDatabaseId}"`);
} catch (err) {
  console.error('[firebase] Failed to initialize Firestore:', err);
  console.warn('[firebase] Falling back to localStorage-only mode — Firestore features will be disabled.');
}
export const db = _db;

if (import.meta.env.DEV) {
  // Helpful to confirm runtime config when debugging Auth errors.
  console.info('[firebase] initialized', {
    origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
    projectId: app.options.projectId,
    authDomain: app.options.authDomain,
    firestoreDatabaseId,
    hasRequiredEnvConfig: Boolean(
      envConfig.apiKey &&
      envConfig.authDomain &&
      envConfig.projectId &&
      envConfig.appId
    ),
  });
}

export let analytics: Analytics | null = null;
isSupported()
  .then((supported) => {
    analytics = supported ? getAnalytics(app) : null;
  })
  .catch(() => {
    analytics = null;
  });
