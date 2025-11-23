'use client';

import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigValid } from './firebase-config';

// Initialize Firebase only if config is valid and in browser environment
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

if (typeof window !== 'undefined' && isFirebaseConfigValid()) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// NOTE: Firestore is NOT initialized here - it causes gRPC dependency issues in Next.js builds
// Use lib/firebase.server.ts or app/api routes for Firestore operations instead
export { app, auth, storage };
