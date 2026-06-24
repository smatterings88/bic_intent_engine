import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { getServerFirebaseConfig } from "@/lib/env";

export type FirebaseAdminInstances = {
  adminApp: App;
  adminAuth: Auth;
  adminDb: Firestore;
  adminStorage: Storage;
};

let cache: FirebaseAdminInstances | null = null;

function ensureAdminApp(): App {
  const existing = getApps()[0];
  if (existing) {
    return existing;
  }
  const env = getServerFirebaseConfig();
  return initializeApp({
    credential: cert({
      projectId: env.projectId,
      clientEmail: env.clientEmail,
      privateKey: env.privateKey,
    }),
    projectId: env.projectId,
  });
}

/**
 * Initialize (once) and return Firebase Admin SDK instances.
 * Server-only. Validates server env on first call only.
 */
export function ensureFirebaseAdmin(): FirebaseAdminInstances {
  if (cache) {
    return cache;
  }
  const adminApp = ensureAdminApp();
  const adminAuth = getAuth(adminApp);
  const adminDb = getFirestore(adminApp);
  // Zenith (and other) payloads use optional TS fields → explicit `undefined`; Firestore rejects
  // those unless ignored. Must run before any Firestore operation on this instance.
  adminDb.settings({ ignoreUndefinedProperties: true });
  const adminStorage = getStorage(adminApp);
  cache = { adminApp, adminAuth, adminDb, adminStorage };
  return cache;
}

export const admin = {
  get adminApp() {
    return ensureFirebaseAdmin().adminApp;
  },
  get adminAuth() {
    return ensureFirebaseAdmin().adminAuth;
  },
  get adminDb() {
    return ensureFirebaseAdmin().adminDb;
  },
  get adminStorage() {
    return ensureFirebaseAdmin().adminStorage;
  },
};
