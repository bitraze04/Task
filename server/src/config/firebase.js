/**
 * Firebase Admin SDK Configuration
 * 
 * Initializes Firebase Admin with service account credentials.
 * Exports Firestore database and Auth instances for use throughout the app.
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Initialize service account
let serviceAccount;

try {
  // Option 1: Load from environment variable (Best for Vercel/Production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  // Option 2: Load from local file (Best for Development)
  else {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
    const absolutePath = resolve(process.cwd(), serviceAccountPath);
    serviceAccount = JSON.parse(readFileSync(absolutePath, 'utf8'));
  }
} catch (error) {
  console.error('Error loading Firebase service account:', error.message);
  console.error('Set FIREBASE_SERVICE_ACCOUNT_JSON env var or ensure serviceAccountKey.json exists');
  // Don't exit process in serverless environment, just log error
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Export Firestore database instance
export const db = admin.firestore();

// Export Auth instance for token verification
export const auth = admin.auth();

export default admin;
