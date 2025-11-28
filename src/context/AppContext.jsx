// src/context/AppContext.jsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  orderBy,
  deleteField
} from 'firebase/firestore';

// Create Context
const AppContext = createContext();
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const todayKey = () => new Date().toISOString().split('T')[0];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ FIXED: Listen for auth and properly manage loading state
  useEffect(() => {
    console.log('🔧 AppContext: Setting up auth listener');
    
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔐 Auth state changed:', currentUser?.email || 'No user');
      
      setUser(currentUser);

      if (currentUser) {
        console.log('👤 User logged in, loading data...');
        setLoading(true); // Keep loading while fetching data
        await loadUserData(currentUser.uid);
        setLoading(false); // ✅ Only set loading false AFTER data loads
      } else {
        console.log('👤 User logged out, clearing data');
        setMedicines([]);
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => {
      console.log('🔧 AppContext: Cleaning up auth listener');
      unsub();
    };
  }, []);

  // ✅ FIXED: Load medicines & notifications with better error handling
  const loadUserData = async (userId) => {
    try {
      console.log('📥 Loading data for user:', userId);

      // Load medicines
      const medsQuery = query(
        collection(db, 'medicines'),
        where('userId', '==', userId),
        orderBy('time', 'asc')
      );
      const medsSnap = await getDocs(medsQuery);
      const meds = medsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      console.log('💊 Loaded medicines:', meds.length, meds);
      setMedicines(meds);

      // Load notifications
      const notifQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const notifSnap = await getDocs(notifQuery);
      const notifs = notifSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      console.log('🔔 Loaded notifications:', notifs.length);
      setNotifications(notifs);

      console.log('✅ Data load complete');

    } catch (err) {
      console.error('❌ Error loading user data:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      setError('Failed to load data');
    }
  };

  // Add medicine
  const addMedicine = async (medicineData) => {
    if (!user) throw new Error('Not authenticated');

    try {
      console.log('➕ Adding medicine:', medicineData);

      const newMed = {
        ...medicineData,
        userId: user.uid,
        takenHistory: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        takenAt: null,
      };

      const docRef = await addDoc(collection(db, 'medicines'), newMed);

      const medicineWithId = {
        id: docRef.id,
        ...newMed,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setMedicines(prev => [...prev, medicineWithId]);
      console.log('✅ Medicine added successfully:', docRef.id);

      return docRef.id;
    } catch (err) {
      console.error('❌ Add medicine failed:', err);
      throw err;
    }
  };

  // Update a medicine
  const updateMedicine = async (medicineId, updates) => {
    try {
      console.log('📝 Updating medicine:', medicineId, updates);

      const medRef = doc(db, 'medicines', medicineId);

      await updateDoc(medRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      setMedicines(prev =>
        prev.map(m =>
          m.id === medicineId
            ? { ...m, ...updates, updatedAt: new Date() }
            : m
        )
      );

      console.log('✅ Medicine updated successfully');
    } catch (err) {
      console.error('❌ Update medicine failed:', err);
      throw err;
    }
  };

  // Delete a medicine
  const deleteMedicine = async (medicineId) => {
    try {
      console.log('🗑️ Deleting medicine:', medicineId);

      await deleteDoc(doc(db, 'medicines', medicineId));
      setMedicines(prev => prev.filter(m => m.id !== medicineId));

      console.log('✅ Medicine deleted successfully');
    } catch (err) {
      console.error('❌ Delete medicine failed:', err);
      throw err;
    }
  };

  // ✅ Toggle today's taken status
  const toggleMedicineTaken = async (medicineId) => {
    try {
      console.log('🔄 Toggling medicine taken status:', medicineId);

      const med = medicines.find(m => m.id === medicineId);
      if (!med) {
        console.error('❌ Medicine not found in state:', medicineId);
        throw new Error('Medicine not found');
      }

      const key = todayKey();
      const currentlyTaken = med.takenHistory && med.takenHistory[key];

      console.log('Current taken status:', currentlyTaken, 'for date:', key);

      const medRef = doc(db, 'medicines', medicineId);

      if (!currentlyTaken) {
        // Mark as taken
        console.log('✅ Marking as taken');
        await updateDoc(medRef, {
          [`takenHistory.${key}`]: true,
          takenAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Unmark → remove the field completely
        console.log('❌ Marking as not taken');
        await updateDoc(medRef, {
          [`takenHistory.${key}`]: deleteField(),
          takenAt: null,
          updatedAt: serverTimestamp()
        });
      }

      // Local state update
      setMedicines(prev =>
        prev.map(m => {
          if (m.id !== medicineId) return m;

          const newHistory = { ...(m.takenHistory || {}) };

          if (!currentlyTaken) {
            newHistory[key] = true;
          } else {
            delete newHistory[key];
          }

          return { 
            ...m, 
            takenHistory: newHistory,
            takenAt: !currentlyTaken ? new Date() : null
          };
        })
      );

      console.log('✅ Medicine status toggled successfully');

    } catch (err) {
      console.error('❌ Toggle taken failed:', err);
      throw err;
    }
  };

  // ✅ Refresh data from Firestore
  const refreshData = async () => {
    if (user) {
      console.log('🔄 Refreshing data...');
      await loadUserData(user.uid);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    setUser,
    medicines,
    notifications,
    loading,
    error,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    toggleMedicineTaken,
    refreshData,
    clearError,
  };

  console.log('📊 AppContext state:', {
    userEmail: user?.email,
    medicinesCount: medicines.length,
    loading
  });

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;