import { NextRequest } from "next/server";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { verifyServerFirebaseIdToken } from "@/lib/firebase/admin";

export interface AuthContextUser {
  uid: string;
  email: string;
  role: "admin" | "sdr" | "guest";
  displayName?: string;
}

export interface AuthVerificationResult {
  authorized: boolean;
  statusCode: number;
  user?: AuthContextUser;
  error?: string;
}

import { AUTHORIZED_ADMIN_EMAILS } from "@/config/auth";
export { AUTHORIZED_ADMIN_EMAILS };

function isAuthorizedAdminEmail(email?: string): boolean {
  if (!email) return false;
  const target = email.toLowerCase().trim();
  if (AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === target)) {
    return true;
  }
  const configuredAdmins = process.env.FIREBASE_ADMIN_EMAILS;
  if (configuredAdmins) {
    const list = configuredAdmins.split(",").map((e) => e.trim().toLowerCase());
    return list.includes(target);
  }
  return false;
}

function extractBearerToken(req: NextRequest | Request): { token: string | null; error?: AuthVerificationResult } {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader) {
    return {
      token: null,
      error: {
        authorized: false,
        statusCode: 401,
        error: "Unauthorized: Missing Authorization header.",
      },
    };
  }

  if (!authHeader.toLowerCase().startsWith("bearer")) {
    return {
      token: null,
      error: {
        authorized: false,
        statusCode: 401,
        error: "Unauthorized: Missing or malformed Authorization Bearer header.",
      },
    };
  }

  const token = authHeader.replace(/^Bearer\s*/i, "").trim();

  if (!token) {
    return {
      token: null,
      error: {
        authorized: false,
        statusCode: 401,
        error: "Unauthorized: Empty authentication token provided.",
      },
    };
  }

  return { token };
}

/**
 * Server-side authorization verification for administrative routes.
 * 
 * Verifies Authorization header bearer token:
 * 1. Cryptographically verifies Firebase ID tokens via Firebase Admin SDK in live mode.
 * 2. Rejects all client-supplied/unverified claims or spoofed tokens.
 * 3. Enforces that the caller has verified admin claims or is in the admin email whitelist.
 * 4. In development mock mode, permits structured mock admin tokens (strictly disabled in production).
 */
export async function verifyAdminAuthorization(
  req: NextRequest | Request
): Promise<AuthVerificationResult> {
  const { token, error } = extractBearerToken(req);
  if (error || !token) return error!;

  // Live Firebase Token Verification Branch
  if (isFirebaseConfigured()) {
    // In live mode, mock tokens are unconditionally rejected
    if (token.startsWith("mock-")) {
      return {
        authorized: false,
        statusCode: 401,
        error: "Unauthorized: Mock tokens are rejected when Live Firebase credentials are configured.",
      };
    }

    // Cryptographic verification via Firebase Admin SDK
    const verification = await verifyServerFirebaseIdToken(token);
    if (!verification.valid || !verification.decoded) {
      return {
        authorized: false,
        statusCode: 401,
        error: `Unauthorized: Invalid or unverified Firebase ID token. ${verification.error || ""}`.trim(),
      };
    }

    const decoded = verification.decoded;
    const email = (decoded.email || "").toLowerCase();
    const isAdmin = decoded.admin === true || isAuthorizedAdminEmail(email);

    if (!isAdmin) {
      return {
        authorized: false,
        statusCode: 403,
        error: `Forbidden: Account '${email || decoded.uid}' lacks administrative privileges for stage overrides.`,
      };
    }

    return {
      authorized: true,
      statusCode: 200,
      user: {
        uid: decoded.uid,
        email,
        role: "admin",
        displayName: decoded.name || email.split("@")[0] || "Firebase Administrator",
      },
    };
  }

  // Development & Mock Token Verification Branch
  if (process.env.NODE_ENV === "production") {
    return {
      authorized: false,
      statusCode: 401,
      error: "Unauthorized: Mock authentication is disabled in production.",
    };
  }

  return handleMockAdminToken(token);
}

/**
 * Server-side authorization verification for general authenticated routes (SDR or Admin).
 * Used for contributing internal notes or accessing team data.
 */
export async function verifyUserAuthorization(
  req: NextRequest | Request
): Promise<AuthVerificationResult> {
  const { token, error } = extractBearerToken(req);
  if (error || !token) return error!;

  // Live Firebase Token Verification Branch
  if (isFirebaseConfigured()) {
    if (token.startsWith("mock-")) {
      return {
        authorized: false,
        statusCode: 401,
        error: "Unauthorized: Mock tokens are rejected when Live Firebase credentials are configured.",
      };
    }

    const verification = await verifyServerFirebaseIdToken(token);
    if (!verification.valid || !verification.decoded) {
      return {
        authorized: false,
        statusCode: 401,
        error: `Unauthorized: Invalid or unverified Firebase ID token. ${verification.error || ""}`.trim(),
      };
    }

    const decoded = verification.decoded;
    const email = (decoded.email || "").toLowerCase();
    const isAdmin = decoded.admin === true || isAuthorizedAdminEmail(email);

    return {
      authorized: true,
      statusCode: 200,
      user: {
        uid: decoded.uid,
        email,
        role: isAdmin ? "admin" : "sdr",
        displayName: decoded.name || email.split("@")[0] || "Authenticated User",
      },
    };
  }

  // Development & Mock Token Verification Branch
  if (process.env.NODE_ENV === "production") {
    return {
      authorized: false,
      statusCode: 401,
      error: "Unauthorized: Mock authentication is disabled in production.",
    };
  }

  return handleMockUserToken(token);
}

function handleMockAdminToken(token: string): AuthVerificationResult {
  if (token === "mock-admin-token" || token.includes("role:admin")) {
    return {
      authorized: true,
      statusCode: 200,
      user: {
        uid: "mock-admin-001",
        email: "alex.chen@leadpilot.demo",
        role: "admin",
        displayName: "Alex Chen (Admin)",
      },
    };
  }

  if (token === "mock-sdr-token" || token.includes("role:sdr")) {
    return {
      authorized: false,
      statusCode: 403,
      error: "Forbidden: SDR role cannot execute administrative stage overrides. Admin role required.",
      user: {
        uid: "mock-sdr-002",
        email: "sdr@leadpilot.demo",
        role: "sdr",
        displayName: "SDR Representative",
      },
    };
  }

  return {
    authorized: false,
    statusCode: 401,
    error: "Unauthorized: Invalid authentication credentials.",
  };
}

function handleMockUserToken(token: string): AuthVerificationResult {
  if (token === "mock-admin-token" || token.includes("role:admin")) {
    return {
      authorized: true,
      statusCode: 200,
      user: {
        uid: "mock-admin-001",
        email: "alex.chen@leadpilot.demo",
        role: "admin",
        displayName: "Alex Chen (Admin)",
      },
    };
  }

  if (token === "mock-sdr-token" || token.includes("role:sdr")) {
    return {
      authorized: true,
      statusCode: 200,
      user: {
        uid: "mock-sdr-002",
        email: "sdr@leadpilot.demo",
        role: "sdr",
        displayName: "Jordan Taylor (SDR)",
      },
    };
  }

  return {
    authorized: false,
    statusCode: 401,
    error: "Unauthorized: Invalid authentication credentials.",
  };
}
