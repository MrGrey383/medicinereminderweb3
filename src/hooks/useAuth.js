import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Custom hook for authentication
 * @returns {object} Auth state and methods
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Signup with email and password
   */
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Update user profile
   */
  const updateUserProfile = async (updates) => {
    try {
      setError(null);
      await updateProfile(auth.currentUser, updates);
      setUser({ ...auth.currentUser });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Change password
   */
  const changePassword = async (newPassword) => {
    try {
      setError(null);
      await updatePassword(auth.currentUser, newPassword);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Send password reset email
   */
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUserProfile,
    changePassword,
    resetPassword,
    isAuthenticated: !!user
  };
};

export default useAuth;