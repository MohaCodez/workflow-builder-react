import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider
} from '../config/firebase';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const { email } = user;
      try {
        await setDoc(userRef, {
          email,
          createdAt: serverTimestamp(),
          ...additionalData,
        });
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUser({
          ...user,
          ...userDoc.data()
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, userData) => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user) {
        throw new Error('No user data returned from Firebase');
      }

      await createUserDocument(user, {
        ...userData,
        role: 'user'
      });

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/invalid-api-key') {
        throw new Error('Authentication service is misconfigured. Please contact support.');
      }
      // Handle other specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('This email is already registered. Please try logging in.');
        case 'auth/invalid-email':
          throw new Error('Invalid email address.');
        case 'auth/operation-not-allowed':
          throw new Error('Email/password accounts are not enabled. Please contact support.');
        case 'auth/weak-password':
          throw new Error('Password is too weak. Please use a stronger password.');
        default:
          throw new Error(error.message || 'Failed to create account');
      }
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (!auth || !googleProvider) {
        throw new Error('Firebase Auth or Google provider is not initialized');
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user) {
        throw new Error('No user data returned from Google sign-in');
      }

      await createUserDocument(user, {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        role: 'user'
      });

      return user;
    } catch (error) {
      console.error('Google login error:', error);
      if (error.code === 'auth/invalid-api-key') {
        throw new Error('Authentication service is misconfigured. Please contact support.');
      }
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    signup,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 