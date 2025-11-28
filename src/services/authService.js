import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Authentication Service
 * Handles all authentication-related operations
 */

/**
 * Sign in user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User object
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Create new user account
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @returns {Promise<object>} User object
 */
export const signUp = async (email, password, displayName) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName || '',
      role: 'patient',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Reset password error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Update user profile
 * @param {object} updates - Profile updates
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Update Firebase Auth profile
    await updateProfile(user, updates);

    // Update Firestore document
    await updateDoc(doc(db, 'users', user.uid), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Change password error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Change user email
 * @param {string} newEmail - New email
 * @param {string} password - Current password
 * @returns {Promise<void>}
 */
export const changeEmail = async (newEmail, password) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // Update email
    await updateEmail(user, newEmail);

    // Update Firestore
    await updateDoc(doc(db, 'users', user.uid), {
      email: newEmail,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Change email error:', error);
    throw handleAuthError(error);
  }
};

/**
 * Get user data from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<object>} User data
 */
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Get user data error:', error);
    throw error;
  }
};

/**
 * Check if user is admin
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const isAdmin = async (userId) => {
  try {
    const userData = await getUserData(userId);
    return userData?.role === 'admin';
  } catch (error) {
    console.error('Check admin error:', error);
    return false;
  }
};

/**
 * Handle authentication errors
 * @param {object} error - Firebase error
 * @returns {Error} Formatted error
 */
const handleAuthError = (error) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password is too weak',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/requires-recent-login': 'Please login again to perform this action'
  };

  const message = errorMessages[error.code] || error.message || 'An error occurred';
  return new Error(message);
};

export default {
  signIn,
  signUp,
  logout,
  resetPassword,
  updateUserProfile,
  changePassword,
  changeEmail,
  getUserData,
  isAdmin
};