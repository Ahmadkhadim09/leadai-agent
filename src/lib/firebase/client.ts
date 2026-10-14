import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { validateFirebaseConfig } from "./config";

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export interface FirebaseClientInstance {
  isConfigured: boolean;
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

export function getFirebaseClient(): FirebaseClientInstance {
  if (cachedApp && cachedAuth && cachedDb) {
    return {
      isConfigured: true,
      app: cachedApp,
      auth: cachedAuth,
      db: cachedDb,
    };
  }

  const validation = validateFirebaseConfig({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });

  if (!validation.isValid || !validation.config) {
    return {
      isConfigured: false,
      app: null,
      auth: null,
      db: null,
    };
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(validation.config);
    const auth = getAuth(app);
    const db = getFirestore(app);

    cachedApp = app;
    cachedAuth = auth;
    cachedDb = db;

    return {
      isConfigured: true,
      app,
      auth,
      db,
    };
  } catch (error) {
    console.warn("Failed to initialize live Firebase client SDK, falling back to mock adapter:", error);
    return {
      isConfigured: false,
      app: null,
      auth: null,
      db: null,
    };
  }
}
