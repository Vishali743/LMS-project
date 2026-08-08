const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const firebaseConfig = require('./firebase');

async function testFirebaseStrict() {
  console.log('====================================================');
  console.log('    STRICT LIVE FIREBASE CONNECTION VERIFICATION    ');
  console.log('====================================================\n');

  let firebaseConnected = 'No';
  let authStatus = 'Failed';
  let firestoreStatus = 'Failed';
  let storageStatus = 'Failed';
  let errors = [];

  // Initialize
  try {
    firebaseConfig.initFirebase();
    if (firebaseConfig.isInitialized()) {
      firebaseConnected = 'Yes';
    } else {
      errors.push('Firebase Admin credentials not found. Project is currently falling back to mock mode.');
    }
  } catch (err) {
    errors.push(`Firebase SDK initialization error: ${err.message}`);
  }

  // 1. Live Firestore test
  console.log('1. Verifying Live Firestore Database...');
  try {
    const db = firebaseConfig.getFirestoreDb();
    if (db && firebaseConfig.isInitialized()) {
      const testRef = db.collection('test_connection').doc('verify_strict_test');
      await testRef.set({
        status: 'verifying',
        timestamp: new Date().toISOString()
      });
      const snap = await testRef.get();
      if (snap.exists && snap.data().status === 'verifying') {
        console.log('- Live Firestore write/read: SUCCESS');
        await testRef.delete();
        firestoreStatus = 'Working';
      } else {
        throw new Error('Read document data mismatch.');
      }
    } else {
      throw new Error('Firebase Admin SDK is not initialized with live credentials.');
    }
  } catch (err) {
    console.warn('- Live Firestore failed:', err.message);
    errors.push(`Firestore Error: ${err.message}`);
  }
  console.log('');

  // 2. Live Auth test
  console.log('2. Verifying Live Authentication...');
  try {
    if (firebaseConfig.isInitialized()) {
      const auth = admin.auth();
      const testUid = `strict_verify_uid_${Date.now()}`;
      const testEmail = `strict_verify_${Date.now()}@example.com`;
      
      const userRecord = await auth.createUser({
        uid: testUid,
        email: testEmail,
        password: 'password123',
        displayName: 'Verification User'
      });
      
      console.log('- Live User creation: SUCCESS');
      
      const retrieved = await auth.getUser(testUid);
      if (retrieved && retrieved.email === testEmail) {
        console.log('- Live User verification: SUCCESS');
        await auth.deleteUser(testUid);
        console.log('- Live User cleanup: SUCCESS');
        authStatus = 'Working';
      } else {
        throw new Error('Retrieved user record mismatch.');
      }
    } else {
      throw new Error('Firebase Admin SDK is not initialized with live credentials.');
    }
  } catch (err) {
    console.warn('- Live Authentication failed:', err.message);
    errors.push(`Auth Error: ${err.message}`);
  }
  console.log('');

  // 3. Live Storage test
  console.log('3. Verifying Live Storage Bucket...');
  try {
    if (firebaseConfig.isInitialized()) {
      const storageBucket = admin.storage().bucket();
      if (storageBucket) {
        const file = storageBucket.file('strict_verification.txt');
        await file.save('Firebase live connection test.', {
          metadata: { contentType: 'text/plain' }
        });
        console.log('- Live Storage upload: SUCCESS');
        const [exists] = await file.exists();
        if (exists) {
          console.log('- Live Storage verification: SUCCESS');
          await file.delete();
          console.log('- Live Storage document cleanup: SUCCESS');
          storageStatus = 'Working';
        } else {
          throw new Error('File does not exist in bucket after upload.');
        }
      } else {
        throw new Error('Storage bucket is not defined.');
      }
    } else {
      throw new Error('Firebase Admin SDK is not initialized with live credentials.');
    }
  } catch (err) {
    console.warn('- Live Storage failed:', err.message);
    errors.push(`Storage Error: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log('                STATUS REPORT SUMMARY               ');
  console.log('====================================================');
  console.log(`Firebase Connected:          ${firebaseConnected}`);
  console.log(`Authentication:              ${authStatus}`);
  console.log(`Firestore:                   ${firestoreStatus}`);
  console.log(`Storage:                     ${storageStatus}`);
  console.log('====================================================\n');
  
  if (errors.length > 0) {
    console.log('Errors / Configuration Required:');
    errors.forEach((e, idx) => console.log(`${idx + 1}. ${e}`));
  }
}

testFirebaseStrict();
