import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Pill, Mail, Lock, AlertCircle, Shield, ArrowLeft } from 'lucide-react';

const LoginPage = ({ onSignupClick, onAdminClick, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Login error:', err);

      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        default:
          setError('Failed to login. Please check your credentials');
      }
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to manage your medicines</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                />
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-slideIn">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Forgot Password?
              </button>
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
                  Signing in...
                </span>
              ) : (
                'Sign In'
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

          {/* Sign Up Link */}
          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSignupClick}
              className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
            >
              Sign Up
            </button>
          </p>

          {/* Admin Access Link */}
          {onAdminClick && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={onAdminClick}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2 mx-auto transition-colors"
              >
                <Shield size={16} />
                <span>Admin Access</span>
              </button>
            </div>
          )}

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              💡 <strong>Demo Mode:</strong> This app uses Firebase Authentication. 
              Create an account to test all features!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;