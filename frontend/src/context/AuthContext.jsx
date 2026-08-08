import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  googleProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import axios from 'axios';

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMockConfig = !import.meta.env.VITE_FIREBASE_API_KEY || 
                        import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key' ||
                        import.meta.env.VITE_FIREBASE_API_KEY.includes('your_');

  // Helper to fetch user details from Firestore
  async function fetchFirestoreProfile(firebaseUser) {
    const defaultRole = firebaseUser.email?.includes('instructor') || firebaseUser.email?.includes('teacher') ? 'instructor' : firebaseUser.email?.includes('admin') ? 'admin' : 'student';
    const fallbackProfile = {
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: defaultRole,
      display_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      photo_url: firebaseUser.photoURL || '',
      student_code: defaultRole === 'student' ? 'STU-' + firebaseUser.uid.substring(0, 6).toUpperCase() : ''
    };

    if (isMockConfig || firebaseUser.email.endsWith('@skeinlms.com')) {
      setDbUser({
        ...fallbackProfile,
        id: 9999
      });
      return;
    }
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot && userSnapshot.exists()) {
        setDbUser(userSnapshot.data());
      } else {
        console.warn('User profile document not found in Firestore. Using active session profile.');
        setDbUser(fallbackProfile);
      }
    } catch (error) {
      console.warn('Firestore profile load warning (permission/network):', error.message);
      setDbUser(fallbackProfile);
    }
  }

  // Register user
  async function register(email, password, displayName, role) {
    if (!isMockConfig && !email.endsWith('@skeinlms.com')) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('authToken', token);

        const code = role === 'student' ? `STU-${Math.floor(100000 + Math.random() * 900000)}` : '';
        const userProfile = {
          firebase_uid: firebaseUser.uid,
          email,
          role: role || 'student',
          display_name: displayName || email.split('@')[0],
          photo_url: '',
          student_code: code,
          created_at: new Date().toISOString()
        };

        // Attempt write to Cloud Firestore (non-blocking if Firestore rules/permissions restrict write)
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
          if (role === 'student') {
            await setDoc(doc(db, 'students', firebaseUser.uid), {
              user_id: firebaseUser.uid,
              display_name: displayName,
              student_code: code
            });
          } else if (role === 'instructor') {
            await setDoc(doc(db, 'instructors', firebaseUser.uid), {
              user_id: firebaseUser.uid,
              display_name: displayName
            });
          }
        } catch (fsErr) {
          console.warn('Cloud Firestore client write restricted:', fsErr.message);
        }

        // Sync user profile to Express backend database
        try {
          await axios.post(`${API_BASE}/auth/sync`, {
            displayName,
            role,
            studentCode: code
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (syncErr) {
          console.warn('Backend profile sync warning:', syncErr.message);
        }

        setCurrentUser(firebaseUser);
        setDbUser(userProfile);
        return userCredential;
      } catch (fbErr) {
        console.error('Firebase Registration Notice:', fbErr);
        if (fbErr.code === 'auth/invalid-api-key' || fbErr.code === 'auth/api-key-not-valid' || fbErr.message?.includes('api-key')) {
          throw new Error('Firebase API Key in frontend/.env is a placeholder. Please paste your actual Firebase Web API Key.');
        }
        if (fbErr.code === 'auth/email-already-in-use') {
          // Auto sign-in if account was created during previous step
          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            const token = await firebaseUser.getIdToken();
            localStorage.setItem('authToken', token);

            const code = role === 'student' ? `STU-${Math.floor(100000 + Math.random() * 900000)}` : '';
            const userProfile = {
              firebase_uid: firebaseUser.uid,
              email,
              role: role || 'student',
              display_name: displayName || email.split('@')[0],
              photo_url: '',
              student_code: code,
              created_at: new Date().toISOString()
            };

            setCurrentUser(firebaseUser);
            setDbUser(userProfile);
            return userCredential;
          } catch (loginErr) {
            throw new Error('This email address is already registered. Please sign in with your password.');
          }
        }
        throw new Error(fbErr.message || 'Registration failed.');
      }
    }

    // Backend database registration
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        email,
        password,
        displayName,
        role
      });

      const token = response.data.token;
      const userObj = response.data.user;

      const mockUser = {
        uid: userObj.firebase_uid || `mock-uid-${userObj.id}`,
        email: userObj.email,
        displayName: userObj.display_name,
        getIdToken: async () => token
      };

      localStorage.setItem('authToken', token);
      setCurrentUser(mockUser);
      setDbUser(userObj);
      return { user: mockUser };
    } catch (backendErr) {
      console.error('Backend registration error:', backendErr);
      throw new Error(backendErr.response?.data?.error || 'Registration failed.');
    }
  }

  // Login
  async function login(email, password) {
    if (!isMockConfig && !email.endsWith('@skeinlms.com')) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('authToken', token);

        setCurrentUser(firebaseUser);
        await fetchFirestoreProfile(firebaseUser);
        return userCredential;
      } catch (fbErr) {
        console.error('Firebase Login Error:', fbErr);
        if (fbErr.code === 'auth/invalid-api-key' || fbErr.code === 'auth/api-key-not-valid' || fbErr.message?.includes('api-key')) {
          throw new Error('Firebase API Key in frontend/.env is a placeholder. Please paste your actual Firebase Web API Key.');
        }
        throw new Error(fbErr.message || 'Firebase Login failed.');
      }
    }

    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const token = response.data.token;
      const userObj = response.data.user;

      const mockUser = {
        uid: userObj.firebase_uid || `mock-uid-${userObj.id}`,
        email: userObj.email,
        displayName: userObj.display_name,
        getIdToken: async () => token
      };

      localStorage.setItem('authToken', token);
      setCurrentUser(mockUser);
      setDbUser(userObj);
      return { user: mockUser };
    } catch (loginErr) {
      throw new Error(loginErr.response?.data?.error || 'Invalid email or password');
    }
  }

  // Google Login
  async function loginWithGoogle(role = 'student') {
    if (isMockConfig) {
      return login(`${role}@skeinlms.com`, 'password123');
    }
    
    const userCredential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = userCredential.user;
    const token = await firebaseUser.getIdToken();
    localStorage.setItem('authToken', token);

    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userSnapshot = await getDoc(userDocRef);
    let userProfile = userSnapshot.data();

    if (!userSnapshot.exists()) {
      const code = role === 'student' ? `STU-${Math.floor(100000 + Math.random() * 900000)}` : '';
      userProfile = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: role || 'student',
        display_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        photo_url: firebaseUser.photoURL || '',
        student_code: code,
        created_at: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
      
      if (role === 'student') {
        await setDoc(doc(db, 'students', firebaseUser.uid), {
          user_id: firebaseUser.uid,
          display_name: firebaseUser.displayName,
          student_code: code
        });
      }
    }

    // Sync profile to Express backend
    try {
      await axios.post(`${API_BASE}/auth/sync`, {
        displayName: firebaseUser.displayName,
        photoUrl: firebaseUser.photoURL,
        role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('Backend sync failed:', err.message);
    }

    setCurrentUser(firebaseUser);
    setDbUser(userProfile);
    return userCredential;
  }

  // Logout
  async function logout() {
    localStorage.removeItem('authToken');
    setDbUser(null);
    setCurrentUser(null);
    if (!isMockConfig) {
      await signOut(auth);
    }
  }

  // Reset Password
  async function resetPassword(email) {
    if (isMockConfig) {
      console.log(`[MOCK AUTH] Password reset triggered for: ${email}`);
      return;
    }
    return sendPasswordResetEmail(auth, email);
  }

  // Listen to Auth State Changes
  useEffect(() => {
    if (isMockConfig) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('authToken', token);
        await fetchFirestoreProfile(user);
      } else {
        localStorage.removeItem('authToken');
        setDbUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isMockConfig]);

  const value = {
    currentUser,
    dbUser,
    loading,
    role: dbUser?.role || null,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshProfile: () => currentUser && fetchFirestoreProfile(currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
