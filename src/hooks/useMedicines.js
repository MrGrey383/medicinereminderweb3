// src/hooks/useMedicines.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  orderBy,
  deleteField
} from 'firebase/firestore';
import { db } from '../config/firebase';

const todayKey = () => new Date().toISOString().split('T')[0];

/**
 * Custom hook for medicine management
 * ✅ FIXED: Uses takenHistory object instead of single taken boolean
 */
export const useMedicines = (userId) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load medicines on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadMedicines();
    } else {
      setMedicines([]);
      setLoading(false);
    }
  }, [userId]);

  /**
   * Load all medicines for user
   */
  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError(null);

      const medicinesQuery = query(
        collection(db, 'medicines'),
        where('userId', '==', userId),
        orderBy('time', 'asc')
      );

      const snapshot = await getDocs(medicinesQuery);
      const medicinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMedicines(medicinesData);
    } catch (err) {
      console.error('Error loading medicines:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add new medicine
   */
  const addMedicine = async (medicineData) => {
    try {
      setError(null);

      const newMedicine = {
        ...medicineData,
        userId,
        takenHistory: {}, // ✅ FIXED: Use takenHistory object
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        takenAt: null
      };

      const docRef = await addDoc(collection(db, 'medicines'), newMedicine);
      
      const medicineWithId = {
        id: docRef.id,
        ...newMedicine,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setMedicines([...medicines, medicineWithId]);
      return docRef.id;
    } catch (err) {
      console.error('Error adding medicine:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Update medicine
   */
  const updateMedicine = async (medicineId, updates) => {
    try {
      setError(null);

      const medicineRef = doc(db, 'medicines', medicineId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(medicineRef, updateData);

      setMedicines(medicines.map(med =>
        med.id === medicineId
          ? { ...med, ...updates, updatedAt: new Date().toISOString() }
          : med
      ));
    } catch (err) {
      console.error('Error updating medicine:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Delete medicine
   */
  const deleteMedicine = async (medicineId) => {
    try {
      setError(null);

      await deleteDoc(doc(db, 'medicines', medicineId));
      setMedicines(medicines.filter(med => med.id !== medicineId));
    } catch (err) {
      console.error('Error deleting medicine:', err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Toggle medicine taken status for TODAY
   * ✅ FIXED: Uses takenHistory with date keys
   */
  const toggleMedicineTaken = async (medicineId) => {
    try {
      const medicine = medicines.find(med => med.id === medicineId);
      if (!medicine) return;

      const key = todayKey();
      const currentlyTaken = medicine.takenHistory && medicine.takenHistory[key];

      const medicineRef = doc(db, 'medicines', medicineId);

      if (!currentlyTaken) {
        // Mark as taken
        await updateDoc(medicineRef, {
          [`takenHistory.${key}`]: true,
          takenAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Unmark - remove the field
        await updateDoc(medicineRef, {
          [`takenHistory.${key}`]: deleteField(),
          takenAt: null,
          updatedAt: serverTimestamp()
        });
      }

      // Update local state
      setMedicines(medicines.map(med => {
        if (med.id !== medicineId) return med;

        const newHistory = { ...(med.takenHistory || {}) };
        if (!currentlyTaken) {
          newHistory[key] = true;
        } else {
          delete newHistory[key];
        }

        return {
          ...med,
          takenHistory: newHistory,
          takenAt: !currentlyTaken ? new Date().toISOString() : null
        };
      }));
    } catch (err) {
      console.error('Error toggling medicine status:', err);
      throw err;
    }
  };

  /**
   * Get medicines for today
   */
  const getTodayMedicines = () => {
    return medicines;
  };

  /**
   * Get upcoming medicines (not taken today)
   */
  const getUpcomingMedicines = () => {
    const key = todayKey();
    return medicines.filter(med => !(med.takenHistory && med.takenHistory[key]));
  };

  /**
   * Get taken medicines (taken today)
   */
  const getTakenMedicines = () => {
    const key = todayKey();
    return medicines.filter(med => med.takenHistory && med.takenHistory[key]);
  };

  /**
   * Get medicine by ID
   */
  const getMedicineById = (medicineId) => {
    return medicines.find(med => med.id === medicineId);
  };

  /**
   * Calculate adherence rate for TODAY
   */
  const calculateAdherence = () => {
    if (medicines.length === 0) return 0;
    const taken = getTakenMedicines().length;
    return Math.round((taken / medicines.length) * 100);
  };

  return {
    medicines,
    loading,
    error,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    toggleMedicineTaken,
    refreshMedicines: loadMedicines,
    getTodayMedicines,
    getUpcomingMedicines,
    getTakenMedicines,
    getMedicineById,
    adherenceRate: calculateAdherence(),
    totalMedicines: medicines.length,
    takenCount: getTakenMedicines().length,
    upcomingCount: getUpcomingMedicines().length
  };
};

export default useMedicines;