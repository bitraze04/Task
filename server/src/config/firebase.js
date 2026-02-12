/**
 * Firebase Admin SDK Configuration
 * 
 * Initializes Firebase Admin with service account credentials.
 * Exports Firestore database and Auth instances for use throughout the app.
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load service account from path specified in environment
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
const absolutePath = resolve(process.cwd(), serviceAccountPath);

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(absolutePath, 'utf8'));
} catch (error) {
  console.error('Error loading Firebase service account:', error.message);
  console.error('Make sure serviceAccountKey.json exists in the server directory');
  process.exit(1);
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
