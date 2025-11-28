// src/pages/patient/TestDashboard.jsx - SIMPLIFIED FOR TESTING
import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * Bare-bones test dashboard to isolate the loading issue
 * Use this temporarily to test if medicines load at all
 */
const TestDashboard = () => {
  const { medicines, user, loading } = useApp();

  // Test: Load medicines directly from Firestore
  useEffect(() => {
    const testDirectLoad = async () => {
      if (!user?.uid) {
        console.log('⏳ Waiting for user...');
        return;
      }

      console.log('🧪 TEST: Loading medicines directly from Firestore');
      console.log('User ID:', user.uid);

      try {
        const medsQuery = query(
          collection(db, 'medicines'),
          where('userId', '==', user.uid)
        );

        const snapshot = await getDocs(medsQuery);
        console.log('📦 Firestore query returned:', snapshot.size, 'documents');

        const directMeds = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        console.log('💊 Direct Firestore medicines:', directMeds);
        console.log('💊 AppContext medicines:', medicines);
        console.log('📊 Match?', directMeds.length === medicines.length);

        if (directMeds.length !== medicines.length) {
          console.error('❌ MISMATCH: Firestore has', directMeds.length, 'but state has', medicines.length);
        }

      } catch (error) {
        console.error('❌ Direct load test failed:', error);
      }
    };

    if (!loading) {
      testDirectLoad();
    }
  }, [user, loading]); // Only depend on user and loading, NOT medicines

  // Log state changes
  useEffect(() => {
    console.log('📊 State Update:', {
      loading,
      userEmail: user?.email,
      medicinesCount: medicines.length
    });
  }, [loading, user, medicines]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Dashboard</h1>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">User Info</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
            <p><strong>UID:</strong> {user?.uid || 'N/A'}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Medicines Count */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Medicines from AppContext</h2>
          <p className="text-4xl font-bold text-indigo-600">{medicines.length}</p>
          <p className="text-gray-500 mt-2">
            {medicines.length === 0 ? 'No medicines found' : `${medicines.length} medicine(s) loaded`}
          </p>
        </div>

        {/* Medicines List */}
        {medicines.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Medicine List</h2>
            <div className="space-y-3">
              {medicines.map(med => (
                <div key={med.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{med.name}</p>
                      <p className="text-sm text-gray-600">Time: {med.time}</p>
                      <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">ID: {med.id.slice(0, 8)}...</p>
                      <p className="text-sm text-gray-500">
                        Has takenHistory: {med.takenHistory ? 'Yes' : 'No'}
                      </p>
                      {med.taken !== undefined && (
                        <p className="text-sm text-orange-600">⚠️ Has old 'taken' field</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open browser console (F12)</li>
            <li>Look for "🧪 TEST:" messages</li>
            <li>Check if "Direct Firestore medicines" shows your medicines</li>
            <li>Compare with "AppContext medicines"</li>
            <li>If Firestore has medicines but AppContext doesn't, the problem is in AppContext loading</li>
            <li>Logout and login again, watch console logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;