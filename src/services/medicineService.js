// src/services/medicineService.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

/** Helper: today's key (YYYY-MM-DD) */
const todayKey = () => new Date().toISOString().split('T')[0];

/** Add new medicine */
export const addMedicine = async (userId, medicineData) => {
  try {
    const medicine = {
      ...medicineData,
      userId,
      // keep takenHistory object rather than single boolean
      takenHistory: {}, 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      takenAt: null
    };
    const docRef = await addDoc(collection(db, 'medicines'), medicine);
    return docRef.id;
  } catch (error) {
    console.error('Error adding medicine:', error);
    throw new Error('Failed to add medicine');
  }
};

/** Get all medicines for a user */
export const getMedicines = async (userId) => {
  try {
    const medicinesQuery = query(
      collection(db, 'medicines'),
      where('userId', '==', userId),
      orderBy('time', 'asc')
    );
    const snapshot = await getDocs(medicinesQuery);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting medicines:', error);
    throw new Error('Failed to load medicines');
  }
};

/** Update medicine */
export const updateMedicine = async (medicineId, updates) => {
  try {
    const medicineRef = doc(db, 'medicines', medicineId);
    await updateDoc(medicineRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    throw new Error('Failed to update medicine');
  }
};

/** Delete medicine */
export const deleteMedicine = async (medicineId) => {
  try {
    await deleteDoc(doc(db, 'medicines', medicineId));
  } catch (error) {
    console.error('Error deleting medicine:', error);
    throw new Error('Failed to delete medicine');
  }
};

/** Mark a medicine as taken for today */
export const markAsTaken = async (medicineId) => {
  try {
    const key = todayKey();
    const medicineRef = doc(db, 'medicines', medicineId);

    // set takenHistory.<today> = true and takenAt = serverTimestamp()
    await updateDoc(medicineRef, {
      [`takenHistory.${key}`]: true,
      takenAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking medicine as taken:', error);
    throw new Error('Failed to update medicine status');
  }
};

/** Mark a medicine as not taken for today (remove flag) */
export const markAsNotTaken = async (medicineId) => {
  try {
    const key = todayKey();
    const medicineRef = doc(db, 'medicines', medicineId);

    // set takenHistory.<today> = false (or delete)
    await updateDoc(medicineRef, {
      [`takenHistory.${key}`]: false,
      takenAt: null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking medicine as not taken:', error);
    throw new Error('Failed to update medicine status');
  }
};

/** Calculate today's adherence for user (percentage) */
export const calculateTodayAdherence = async (userId) => {
  try {
    const meds = await getMedicines(userId);
    if (meds.length === 0) return 0;
    const key = todayKey();
    const takenToday = meds.filter(m => m.takenHistory && m.takenHistory[key]).length;
    return Math.round((takenToday / meds.length) * 100);
  } catch (error) {
    console.error('Error calculating adherence:', error);
    return 0;
  }
};

/** Get today's medicines (fallback returns scheduled list; current app expects all medicines) */
export const getTodayMedicines = async (userId) => {
  return await getMedicines(userId);
};

/** Reset all medicines' taken status for a user (useful if you want daily resets) */
export const resetDailyStatus = async (userId) => {
  try {
    const meds = await getMedicines(userId);
    const updates = meds.map(m => updateDoc(doc(db, 'medicines', m.id), {
      // remove today's entry
      [`takenHistory.${todayKey()}`]: false,
      updatedAt: serverTimestamp()
    }));
    await Promise.all(updates);
  } catch (error) {
    console.error('Error resetting daily status:', error);
    throw new Error('Failed to reset medicine status');
  }
};

/** Get basic statistics for a user */
export const getMedicineStats = async (userId) => {
  try {
    const meds = await getMedicines(userId);
    const key = todayKey();
    return {
      total: meds.length,
      taken: meds.filter(m => m.takenHistory && m.takenHistory[key]).length,
      upcoming: meds.filter(m => !(m.takenHistory && m.takenHistory[key])).length,
      adherenceRate: await calculateTodayAdherence(userId)
    };
  } catch (error) {
    console.error('Error getting statistics:', error);
    return { total: 0, taken: 0, upcoming: 0, adherenceRate: 0 };
  }
};

export default {
  addMedicine,
  getMedicines,
  updateMedicine,
  deleteMedicine,
  markAsTaken,
  markAsNotTaken,
  getTodayMedicines,
  calculateTodayAdherence,
  resetDailyStatus,
  getMedicineStats
};
