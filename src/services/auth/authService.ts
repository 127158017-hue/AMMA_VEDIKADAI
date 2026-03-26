/**
 * Authentication Service
 * Handles user authentication with Firebase
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { formatErrorMessage } from '@/utils/firebaseErrorHandler';

export class AuthService {
  /**
   * Sign up with email and password
   */
  static async signup(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with user name
      await updateProfile(firebaseUser, {
        displayName: name,
      });

      // Create user document in Firestore
      const userDoc: User = {
        id: firebaseUser.uid,
        email,
        name,
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);

      return userDoc;
    } catch (error: any) {
      throw new Error(formatErrorMessage(error));
    }
  }

  /**
   * Sign in with email and password
   */
  static async login(email: string, password: string): Promise<User> {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Fetch user data from Firestore
      const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userSnap.exists()) {
        throw new Error('Your account setup is incomplete. Please contact support.');
      }

      return userSnap.data() as User;
    } catch (error: any) {
      throw new Error(formatErrorMessage(error));
    }
  }

  /**
   * Sign out the current user
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
      useAuthStore.getState().logout();
    } catch (error: any) {
      throw new Error(formatErrorMessage(error));
    }
  }

  /**
   * Sign in with Google
   */
  static async loginWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);

      // Check if user exists in Firestore
      const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userSnap.exists()) {
        return userSnap.data() as User;
      }

      // Create new user document for first-time Google sign-in
      const userDoc: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'User',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);

      return userDoc;
    } catch (error: any) {
      throw new Error(formatErrorMessage(error));
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        unsubscribe();

        if (!firebaseUser) {
          resolve(null);
          return;
        }

        try {
          const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          resolve(userSnap.exists() ? (userSnap.data() as User) : null);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Get auth token
   */
  static async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    return user ? await user.getIdToken() : null;
  }
}
