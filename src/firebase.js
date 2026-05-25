import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Helper to get config from environment
const getEnvConfig = () => {
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }
  return null;
};

// Helper to get config from localStorage
const getLocalConfig = () => {
  const saved = localStorage.getItem('peixevoador_firebase_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const getFirebaseConfig = () => {
  return getLocalConfig() || getEnvConfig();
};

export const saveFirebaseConfig = (config) => {
  localStorage.setItem('peixevoador_firebase_config', JSON.stringify(config));
};

export const deleteFirebaseConfig = () => {
  localStorage.removeItem('peixevoador_firebase_config');
};

let dbInstance = null;

export const initFirebase = () => {
  const config = getFirebaseConfig();
  if (!config) {
    dbInstance = null;
    return null;
  }
  try {
    if (getApps().length > 0) {
      dbInstance = getFirestore(getApp());
      return dbInstance;
    }
    const app = initializeApp(config);
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (error) {
    console.error("Erro ao inicializar o Firebase:", error);
    dbInstance = null;
    return null;
  }
};

export const getDb = () => {
  if (dbInstance) return dbInstance;
  return initFirebase();
};

export const isFirebaseActive = () => {
  return getDb() !== null;
};
