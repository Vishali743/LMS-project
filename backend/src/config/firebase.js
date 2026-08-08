const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let firebaseInitialized = false;

function initFirebase() {
  try {
    // 1. Check if stringified JSON env variable is present
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseInitialized = true;
      console.log('Firebase Admin SDK initialized using environment JSON credential.');
      return;
    }

    // 2. Check if a local service account file exists
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseInitialized = true;
      console.log('Firebase Admin SDK initialized using local firebase-service-account.json.');
      return;
    }

    // 3. Fallback: Initialize with Google Application Default Credentials or local warning
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      firebaseInitialized = true;
      console.log('Firebase Admin SDK initialized via GOOGLE_APPLICATION_CREDENTIALS.');
      return;
    }

    // If none are present, log instructions but do not crash the app yet
    // This allows the dev server to start up and instructs the user how to configure it
    console.warn('\n================================================================');
    console.warn('WARNING: Firebase Admin credentials not found.');
    console.warn('Backend requests requiring token verification will fail.');
    console.warn('Please do one of the following to configure authentication:');
    console.warn('1. Download your service account key JSON from Firebase Console.');
    console.warn('2. Place it in "backend/src/config/firebase-service-account.json".');
    console.warn('3. Or set FIREBASE_SERVICE_ACCOUNT_JSON in backend/.env.');
    console.warn('================================================================\n');
    
    // Initialize mock or dummy config for startup, to avoid crash on require
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'mock-lms-project'
    });
    firebaseInitialized = false;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
  }
}

module.exports = {
  initFirebase,
  getAdmin: () => admin,
  isInitialized: () => firebaseInitialized,
  getFirestoreDb: () => admin.firestore()
};
