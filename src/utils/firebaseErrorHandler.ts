/**
 * Firebase Error Handler Utility
 * Converts Firebase error codes to user-friendly messages
 */

export const getFirebaseErrorMessage = (error: any): string => {
  // Handle Firebase Auth errors
  if (error.code) {
    const code = error.code;
    
    const firebaseErrorMap: Record<string, string> = {
      // Auth errors
      'auth/invalid-email': 'The email address is not valid. Please check and try again.',
      'auth/user-disabled': 'This account has been disabled. Please contact support.',
      'auth/user-not-found': 'No account found with this email. Please sign up first.',
      'auth/invalid-password': 'The password is incorrect. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/too-many-requests': 'Too many login attempts. Please try again later.',
      'auth/account-exists-with-different-credential': 'An account exists with a different login method.',
      'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups and try again.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
      'auth/cancelled-popup-request': 'Sign-in process was cancelled.',
      'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
      
      // Firestore errors
      'permission-denied': 'You do not have permission to perform this action.',
      'not-found': 'The requested item was not found.',
      'already-exists': 'This item already exists.',
      'failed-precondition': 'An error occurred. Please try again.',
      'aborted': 'The operation was cancelled. Please try again.',
      'out-of-range': 'Invalid value provided.',
      'unavailable': 'Service is temporarily unavailable. Please try again later.',
      'data-loss': 'Data loss detected. Please try again.',
      'unauthenticated': 'Please log in to perform this action.',
      'invalid-argument': 'Invalid input provided. Please check your data and try again.',
      'deadline-exceeded': 'The operation took too long. Please try again.',
    };

    return firebaseErrorMap[code] || `An error occurred: ${code}. Please try again.`;
  }

  // Handle generic error messages
  if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('firebase')) {
      return 'A service error occurred. Please try again later.';
    }
    
    if (message.includes('network')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    if (message.includes('timeout')) {
      return 'The request took too long. Please try again.';
    }
    
    // Replace technical Firebase messages with friendly ones
    if (message.includes('auth/')) {
      return 'Authentication failed. Please check your credentials and try again.';
    }
    
    if (message.includes('error')) {
      return 'An error occurred. Please try again.';
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return getFirebaseErrorMessage(error);
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return getFirebaseErrorMessage(error);
  }

  return 'An unexpected error occurred. Please try again.';
};
