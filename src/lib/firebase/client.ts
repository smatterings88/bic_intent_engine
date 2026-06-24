import {
  type FirebaseApp,
  type FirebaseOptions,
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";
import { type FirebaseStorage, getStorage } from "firebase/storage";
import { getPublicFirebaseConfig } from "@/lib/env";

export type FirebaseClientInstances = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
};

let cache: FirebaseClientInstances | null = null;

/**
 * Initialize (once) and return the Firebase web SDK instances.
 * Must run in the browser. Validates public env on first call only.
 */
export function ensureFirebaseClient(): FirebaseClientInstances {
  if (typeof window === "undefined") {
    throw new Error("ensureFirebaseClient() must be called in the browser.");
  }
  if (cache) {
    return cache;
  }
  const c = getPublicFirebaseConfig();
  const options: FirebaseOptions = {
    apiKey: c.apiKey,
    authDomain: c.authDomain,
    projectId: c.projectId,
    storageBucket: c.storageBucket,
    messagingSenderId: c.messagingSenderId,
    appId: c.appId,
  };
  const firebaseApp = getApps().length === 0 ? initializeApp(options) : getApp();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);
  cache = { firebaseApp, auth, db, storage };
  return cache;
}

/** Namespace with lazy getters (same instances as {@link ensureFirebaseClient}). */
export const firebase = {
  get firebaseApp() {
    return ensureFirebaseClient().firebaseApp;
  },
  get auth() {
    return ensureFirebaseClient().auth;
  },
  get db() {
    return ensureFirebaseClient().db;
  },
  get storage() {
    return ensureFirebaseClient().storage;
  },
};
