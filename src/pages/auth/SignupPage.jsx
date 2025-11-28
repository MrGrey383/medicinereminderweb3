import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Pill, Mail, Lock, User, AlertCircle, CheckCircle, Heart, ArrowLeft } from 'lucide-react';
import { USER_ROLES } from '../../utils/constants';

const SignupPage = ({ onLoginClick, onBackToHome }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.PATIENT // Default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      // Create user document in Firestore with role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        displayName: formData.name,
        role: formData.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // User will be automatically redirected by auth state listener
    } catch (err) {
      console.error('Signup error:', err);

      // User-friendly error messages
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Use at least 6 characters');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled');
          break;
        default:
          setError('Failed to create account. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak';
    if (passwordStrength <= 50) return 'Fair';
    if (passwordStrength <= 75) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </button>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fadeIn">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-4 animate-pulse">
              <Pill className="text-white" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Start managing your medicines today</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('role', USER_ROLES.PATIENT)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === USER_ROLES.PATIENT
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <User className={`mx-auto mb-2 ${
                    formData.role === USER_ROLES.PATIENT ? 'text-indigo-600' : 'text-gray-400'
                  }`} size={32} />
                  <p className={`text-sm font-medium ${
                    formData.role === USER_ROLES.PATIENT ? 'text-indigo-600' : 'text-gray-600'
                  }`}>
                    Patient
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleChange('role', USER_ROLES.CAREGIVER)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === USER_ROLES.CAREGIVER
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Heart className={`mx-auto mb-2 ${
                    formData.role === USER_ROLES.CAREGIVER ? 'text-purple-600' : 'text-gray-400'
                  }`} size={32} />
                  <p className={`text-sm font-medium ${
                    formData.role === USER_ROLES.CAREGIVER ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                    Caregiver
                  </p>
                </button>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password Strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 25 ? 'text-red-600' :
                      passwordStrength <= 50 ? 'text-orange-600' :
                      passwordStrength <= 75 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                />
                {formData.confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    {formData.password === formData.confirmPassword ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <AlertCircle className="text-red-500" size={20} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-slideIn">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:scale-105 transition-all duration-300 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;