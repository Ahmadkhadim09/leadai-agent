/**
 * LeadPilot Firebase Configuration & Validation
 * 
 * Validates whether environment variables are set with real Firebase credentials
 * rather than placeholder strings.
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const PLACEHOLDER_STRINGS = [
  "your_firebase_api_key_here",
  "your_project_id",
  "your_messaging_sender_id",
  "your_firebase_app_id",
  "your_auth_domain",
  "placeholder",
  "undefined",
  "",
];

export function isPlaceholder(val?: string | null): boolean {
  if (!val) return true;
  const trimmed = val.trim().toLowerCase();
  return (
    PLACEHOLDER_STRINGS.includes(trimmed) ||
    trimmed.startsWith("your_") ||
    trimmed.includes("placeholder")
  );
}

export function validateFirebaseConfig(env: Record<string, string | undefined>): {
  isValid: boolean;
  missingOrPlaceholderKeys: string[];
  config: FirebaseClientConfig | null;
} {
  const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
  const messagingSenderId = env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "";
  const appId = env.NEXT_PUBLIC_FIREBASE_APP_ID;

  const missingOrPlaceholderKeys: string[] = [];

  if (isPlaceholder(apiKey)) missingOrPlaceholderKeys.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (isPlaceholder(authDomain)) missingOrPlaceholderKeys.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (isPlaceholder(projectId)) missingOrPlaceholderKeys.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (isPlaceholder(appId)) missingOrPlaceholderKeys.push("NEXT_PUBLIC_FIREBASE_APP_ID");

  const isValid = missingOrPlaceholderKeys.length === 0;

  if (!isValid) {
    return {
      isValid: false,
      missingOrPlaceholderKeys,
      config: null,
    };
  }

  return {
    isValid: true,
    missingOrPlaceholderKeys: [],
    config: {
      apiKey: apiKey!,
      authDomain: authDomain!,
      projectId: projectId!,
      storageBucket,
      messagingSenderId,
      appId: appId!,
    },
  };
}

/**
 * Checks if the runtime environment has valid, live Firebase client configuration.
 */
export function isFirebaseConfigured(): boolean {
  const result = validateFirebaseConfig({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  return result.isValid;
}
