import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';

/**
 * Email Notification Settings Component
 * Add this to your SettingsPage.js
 */
const EmailNotificationSettings = () => {
  const { user } = useAuth();
  const [emailReminders, setEmailReminders] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load current email preference from user data
    if (user?.emailReminders !== undefined) {
      setEmailReminders(user.emailReminders);
    }
  }, [user]);

  const handleToggle = async (enabled) => {
    if (!user?.uid) return;

    setLoading(true);
    setMessage('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        emailReminders: enabled,
        updatedAt: new Date()
      });

      setEmailReminders(enabled);
      setMessage(enabled 
        ? '✅ Email reminders enabled! You\'ll receive daily summaries and medicine reminders.'
        : '❌ Email reminders disabled.'
      );

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating email preferences:', error);
      setMessage('❌ Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-notifications-settings">
      <h3 className="text-lg font-semibold mb-4">📧 Email Notifications</h3>
      
      <div className="bg-white rounded-lg shadow p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Email Reminders</h4>
            <p className="text-sm text-gray-500 mt-1">
              Receive medicine reminders and daily summaries via email
            </p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailReminders}
              onChange={(e) => handleToggle(e.target.checked)}
              disabled={loading}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {emailReminders && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">What you'll receive:</h5>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">💊</span>
                <span>Medicine reminders at scheduled times</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📊</span>
                <span>Daily summary at 8:00 AM with your medicine status</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📈</span>
                <span>Weekly adherence report every Sunday</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <span className="text-xl mr-3">ℹ️</span>
          <div>
            <h5 className="font-medium text-yellow-900 mb-1">Important Notes:</h5>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Emails are sent in addition to push notifications</li>
              <li>• Free tier: Up to 100 emails per day</li>
              <li>• Make sure your email is verified: <strong>{user?.email}</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotificationSettings;