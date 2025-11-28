import React, { useState } from 'react';
import { verifyAdminCredentials } from '../../services/adminService';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';

const AdminLoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const adminData = await verifyAdminCredentials(email, password);
      onLoginSuccess(adminData);
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fadeIn">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl mb-4">
            <Shield className="text-white" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Portal</h1>
          <p className="text-gray-600">System Administration Access</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-gray-400" size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-700 focus:outline-none transition-colors"
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
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-700 focus:outline-none transition-colors"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-gray-700 to-gray-900 hover:shadow-lg hover:scale-105 transition-all duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              'Admin Sign In'
            )}
          </button>
        </form>

        {/* Warning */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-yellow-800 mb-1">
                Authorized Access Only
              </p>
              <p className="text-sm text-yellow-700">
                This portal is restricted to system administrators. Unauthorized access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Medicine Reminder Admin v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;