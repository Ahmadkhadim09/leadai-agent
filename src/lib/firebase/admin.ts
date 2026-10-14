import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth, DecodedIdToken } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { isPlaceholder } from "./config";

let cachedApp: App | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

export interface FirebaseAdminInstance {
  app: App | null;
  auth: Auth | null;
  db: Firestore | null;
  isConfigured: boolean;
}

/**
 * Initializes and returns the server-side Firebase Admin SDK singleton.
 * Uses service account credentials when provided in environment variables,
 * or falls back to Application Default Credentials (ADC) in GCP environments.
 */
export function getFirebaseAdmin(): FirebaseAdminInstance {
  if (cachedApp && cachedAuth && cachedDb) {
    return {
      app: cachedApp,
      auth: cachedAuth,
      db: cachedDb,
      isConfigured: true,
    };
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (isPlaceholder(projectId)) {
    return { app: null, auth: null, db: null, isConfigured: false };
  }

  try {
    if (getApps().length > 0) {
      cachedApp = getApps()[0];
    } else if (
      !isPlaceholder(clientEmail) &&
      !isPlaceholder(privateKey) &&
      clientEmail &&
      privateKey
    ) {
      // Format private key for PEM compliance
      privateKey = privateKey.trim().replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");

      cachedApp = initializeApp({
        credential: cert({
          projectId: projectId!,
          clientEmail,
          privateKey,
        }),
        projectId: projectId!,
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE) {
      // Cloud environment with Application Default Credentials
      cachedApp = initializeApp({ projectId: projectId! });
    } else {
      // Project ID exists but no service account keys; initialize minimal app
      cachedApp = initializeApp({ projectId: projectId! });
    }

    cachedAuth = getAuth(cachedApp);
    cachedDb = getFirestore(cachedApp);

    return {
      app: cachedApp,
      auth: cachedAuth,
      db: cachedDb,
      isConfigured: true,
    };
  } catch (err) {
    console.warn("Firebase Admin SDK initialization skipped or failed:", err);
    return { app: null, auth: null, db: null, isConfigured: false };
  }
}

/**
 * Cryptographically verifies a Firebase ID token on the server.
 * Enforces RS256 signature verification, issuer, audience, and expiration.
 * Never trusts unverified client-supplied claims or decoded base64 strings.
 */
export async function verifyServerFirebaseIdToken(
  token: string
): Promise<{ valid: boolean; decoded?: DecodedIdToken; error?: string }> {
  const { auth, isConfigured } = getFirebaseAdmin();

  if (!isConfigured || !auth) {
    return {
      valid: false,
      error: "Firebase Admin is not configured on the server. Valid service account credentials required.",
    };
  }

  try {
    // Cryptographically verify ID token against Google's public certificates
    const decoded = await auth.verifyIdToken(token, true);
    return { valid: true, decoded };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Token cryptographic verification failed";
    return { valid: false, error: message };
  }
}
