import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { auth } from '../../config/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { requestNotificationPermission } from '../../config/firebase';

import EmailNotificationSettings from './EmailNotificationSettings';

import {
  User,
  Bell,
  Lock,
  Info,
  LogOut,
  Mail,
  Edit2,
  Save,
  X,
  CheckCircle,
  Shield,
  Smartphone,
  Globe
} from 'lucide-react';

const SettingsPage = () => {
  const { user } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.displayName || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const handleNotificationToggle = async () => {
    if (notificationsEnabled) {
      setMessage({
        type: 'info',
        text: 'To disable notifications, update your browser settings.'
      });
      return;
    }

    try {
      const token = await requestNotificationPermission();
      if (token) {
        setNotificationsEnabled(true);
        setMessage({ type: 'success', text: 'Notifications enabled!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to enable notifications' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to enable notifications' });
    }

    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (profileData.name !== user?.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.name,
        });
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditingProfile(false);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut(auth);
        window.location.reload();
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Failed to logout' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-24">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-indigo-100">Manage your preferences</p>
      </div>

      <div className="p-6 space-y-4">
        
        {/* Messages */}
        {message.text && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl animate-slideIn ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : message.type === 'error'
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <CheckCircle
              className={
                message.type === 'success'
                  ? 'text-green-600'
                  : message.type === 'error'
                  ? 'text-red-600'
                  : 'text-blue-600'
              }
              size={20}
            />
            <p
              className={`text-sm ${
                message.type === 'success'
                  ? 'text-green-700'
                  : message.type === 'error'
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Profile Information</h3>
            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
              </button>
            )}
          </div>

          {editingProfile ? (
            <div className="space-y-4">

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Save size={18} />
                      Save Changes
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setEditingProfile(false);
                    setProfileData({
                      name: user?.displayName || '',
                      email: user?.email || '',
                    });
                  }}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {(user?.displayName || user?.email)?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-gray-600 text-sm">{user?.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4">Notifications</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Bell className="text-indigo-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800">Push Notifications</p>
                <p className="text-sm text-gray-600">
                  Get reminders for your medicines
                </p>
              </div>
            </div>

            <button
              onClick={handleNotificationToggle}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                notificationsEnabled ? 'bg-indigo-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Email Notification Settings */}
        <EmailNotificationSettings />

        {/* Privacy & Security */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4">Privacy & Security</h3>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="text-gray-600" size={20} />
                <span className="font-medium text-gray-800">Change Password</span>
              </div>
              <Edit2 className="text-gray-400" size={18} />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Lock className="text-gray-600" size={20} />
                <span className="font-medium text-gray-800">Privacy Policy</span>
              </div>
              <Edit2 className="text-gray-400" size={18} />
            </button>
          </div>
        </div>

        {/* About App */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4">About App</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Version</span>
              <span className="font-medium text-gray-800">1.0.0</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Build</span>
              <span className="font-medium text-gray-800">2025.01.21</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Platform</span>
              <span className="font-medium text-gray-800">Progressive Web App</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Features:</strong>
            </p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} /> Offline support
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} /> Push notifications
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} /> Cloud sync
              </li>

              <li className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} /> Add to Home Screen
              </li>
            </ul>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-md"
        >
          <LogOut size={20} />
          Logout
        </button>

        {/* Install App */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-md p-6 text-white">
          <div className="flex items-start gap-3">
            <Smartphone size={24} />
            <div>
              <h3 className="font-bold text-lg mb-2">Install App</h3>
              <p className="text-sm text-indigo-100 mb-3">
                Add this app to your home screen for quick access and offline use.
              </p>
              <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
                Install Now
              </button>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="text-blue-600" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-3">
                Contact our support team or check out the FAQ section.
              </p>

              <a
                href="mailto:support@medicinereminder.com"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                support@medicinereminder.com
              </a>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
