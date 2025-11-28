// src/services/adminService.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Admin service: prefer aggregated docs in admin_analytics,
 * but fall back to live calculation using takenHistory per-day.
 */

const todayKey = () => new Date().toISOString().split('T')[0];

/** Verify admin credentials from admin_users collection */
export const verifyAdminCredentials = async (email, password) => {
  try {
    const adminsQuery = query(collection(db, 'admin_users'), where('email', '==', email));
    const snapshot = await getDocs(adminsQuery);

    if (snapshot.empty) throw new Error('Invalid admin credentials');

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();

    // NOTE: in production passwords must be hashed
    if (data.password !== password) throw new Error('Invalid admin credentials');

    return {
      id: docSnap.id,
      email: data.email,
      name: data.name,
      role: 'admin'
    };
  } catch (error) {
    console.error('Admin verification error:', error);
    throw error;
  }
};

/** Get system analytics (prefer admin_analytics doc) */
export const getSystemAnalytics = async () => {
  try {
    const analyticsRef = doc(db, 'admin_analytics', 'system_stats');
    const analyticsDoc = await getDoc(analyticsRef);

    if (analyticsDoc.exists()) {
      const data = analyticsDoc.data();
      const isPopulated = data && (
        (data.totalUsers && data.totalUsers > 0) ||
        (data.totalMedicines && data.totalMedicines > 0) ||
        (data.totalLinks && data.totalLinks > 0)
      );
      if (isPopulated) return data;
    }

    // Live fallback
    const [usersSnap, medsSnap, linksSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'medicines')),
      getDocs(collection(db, 'caregiver_links'))
    ]);

    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const meds = medsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const patientCount = users.filter(u => u.role === 'patient').length;
    const caregiverCount = users.filter(u => u.role === 'caregiver').length;

    // compute avg adherence using today's takenHistory
    const key = todayKey();
    const byUser = {};
    meds.forEach(m => {
      const uid = m.userId || 'unknown';
      if (!byUser[uid]) byUser[uid] = { total: 0, taken: 0 };
      byUser[uid].total++;
      if (m.takenHistory && m.takenHistory[key]) byUser[uid].taken++;
    });

    const rates = Object.values(byUser).map(u => u.total > 0 ? (u.taken / u.total) * 100 : 0);
    const avgAdherence = rates.length > 0 ? Math.round(rates.reduce((s, r) => s + r, 0) / rates.length) : 0;

    return {
      totalUsers: users.length,
      patientCount,
      caregiverCount,
      totalMedicines: meds.length,
      totalLinks: linksSnap.size || 0,
      avgAdherence,
      activeUsersToday: users.length,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw new Error('Failed to load analytics');
  }
};

/** Get user growth data (prefer stored doc) - FIXED */
export const getUserGrowthData = async (days = 30) => {
  try {
    const growthRef = doc(db, 'admin_analytics', 'user_growth');
    const growthDoc = await getDoc(growthRef);
    
    if (growthDoc.exists()) {
      const storedData = growthDoc.data().data;
      if (storedData && storedData.length > 0) {
        return storedData;
      }
    }

    // FIXED: Calculate actual cumulative growth based on createdAt dates
    const usersSnap = await getDocs(collection(db, 'users'));
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(23, 59, 59, 999);
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Count users created up to this date
      const patientsUpToDate = users.filter(u => {
        if (u.role !== 'patient') return false;
        
        // Handle different date formats
        let createdDate;
        if (u.createdAt?.toDate) {
          createdDate = u.createdAt.toDate();
        } else if (u.createdAt) {
          createdDate = new Date(u.createdAt);
        } else {
          return false;
        }
        
        return createdDate <= date;
      }).length;

      const caregiversUpToDate = users.filter(u => {
        if (u.role !== 'caregiver') return false;
        
        let createdDate;
        if (u.createdAt?.toDate) {
          createdDate = u.createdAt.toDate();
        } else if (u.createdAt) {
          createdDate = new Date(u.createdAt);
        } else {
          return false;
        }
        
        return createdDate <= date;
      }).length;

      data.push({
        date: dateStr,
        patients: patientsUpToDate,
        caregivers: caregiversUpToDate
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error getting growth data:', error);
    return [];
  }
};

/** Get medicine statistics (prefer stored doc) - FIXED */
export const getMedicineStatistics = async () => {
  try {
    const statsRef = doc(db, 'admin_analytics', 'medicine_stats');
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      const data = statsDoc.data();
      // Check if data is populated
      if (data && (data.totalMedicines > 0 || Object.keys(data.byFrequency || {}).length > 0)) {
        return data;
      }
    }

    // Fallback calculation
    const medsSnap = await getDocs(collection(db, 'medicines'));
    const meds = medsSnap.docs.map(d => d.data());

    if (meds.length === 0) {
      return {
        totalMedicines: 0,
        byFrequency: {},
        byTimeSlot: {},
        avgPerUser: 0
      };
    }

    // Count by frequency
    const byFrequency = {};
    meds.forEach(m => {
      const f = m.frequency || 'Unknown';
      byFrequency[f] = (byFrequency[f] || 0) + 1;
    });

    // FIXED: Use capitalized keys to match UI expectations
    const byTimeSlot = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    meds.forEach(m => {
      if (!m.time) {
        byTimeSlot.Night++;
        return;
      }
      
      // Parse time more safely
      const timeParts = (m.time || '0:00').split(':');
      const hour = parseInt(timeParts[0], 10);
      
      if (isNaN(hour)) {
        byTimeSlot.Night++;
      } else if (hour >= 5 && hour < 12) {
        byTimeSlot.Morning++;
      } else if (hour >= 12 && hour < 17) {
        byTimeSlot.Afternoon++;
      } else if (hour >= 17 && hour < 21) {
        byTimeSlot.Evening++;
      } else {
        byTimeSlot.Night++;
      }
    });

    const uniqueUsers = new Set(meds.map(m => m.userId).filter(Boolean)).size;
    const avgPerUser = uniqueUsers > 0 ? parseFloat((meds.length / uniqueUsers).toFixed(1)) : 0;

    return {
      totalMedicines: meds.length,
      byFrequency,
      byTimeSlot,
      avgPerUser
    };
  } catch (error) {
    console.error('Error getting medicine stats:', error);
    return {
      totalMedicines: 0,
      byFrequency: {},
      byTimeSlot: {},
      avgPerUser: 0
    };
  }
};

/** Get system activity logs */
export const getSystemActivity = async (limitCount = 20) => {
  try {
    const logsQuery = query(
      collection(db, 'system_logs'), 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );
    const snap = await getDocs(logsQuery);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error getting activity logs:', error);
    
    // Fallback: show recent medicine updates as activity
    try {
      const medsQuery = query(
        collection(db, 'medicines'),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
      const medsSnap = await getDocs(medsQuery);
      
      return medsSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          action: `Medicine "${data.name || 'Unnamed'}" was updated`,
          timestamp: data.updatedAt,
          type: 'medicine_update'
        };
      });
    } catch (fallbackError) {
      console.error('Fallback activity error:', fallbackError);
      return [];
    }
  }
};

/** Get adherence distribution for today (prefer doc) - FIXED */
export const getAdherenceDistribution = async () => {
  try {
    const distRef = doc(db, 'admin_analytics', 'adherence_distribution');
    const distDoc = await getDoc(distRef);
    
    if (distDoc.exists()) {
      const data = distDoc.data();
      // Check if distribution has valid data
      const hasData = data && (
        data.excellent > 0 || 
        data.good > 0 || 
        data.fair > 0 || 
        data.poor > 0
      );
      if (hasData) return data;
    }

    // Fallback: compute distribution from meds takenHistory today
    const medsSnap = await getDocs(collection(db, 'medicines'));
    const meds = medsSnap.docs.map(d => d.data());
    
    if (meds.length === 0) {
      return { excellent: 0, good: 0, fair: 0, poor: 0 };
    }
    
    const key = todayKey();

    // Group medicines by user
    const byUser = {};
    meds.forEach(m => {
      const uid = m.userId;
      if (!uid) return; // Skip medicines without userId
      
      if (!byUser[uid]) byUser[uid] = { total: 0, taken: 0 };
      byUser[uid].total++;
      if (m.takenHistory && m.takenHistory[key] === true) {
        byUser[uid].taken++;
      }
    });

    // Calculate adherence rate for each user
    const rates = Object.values(byUser)
      .filter(u => u.total > 0)
      .map(u => (u.taken / u.total) * 100);

    if (rates.length === 0) {
      return { excellent: 0, good: 0, fair: 0, poor: 0 };
    }

    // Count users in each category
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };

    rates.forEach(r => {
      if (r >= 80) distribution.excellent++;
      else if (r >= 60) distribution.good++;
      else if (r >= 40) distribution.fair++;
      else distribution.poor++;
    });

    const total = rates.length;
    
    // Return as percentages
    return {
      excellent: Math.round((distribution.excellent / total) * 100),
      good: Math.round((distribution.good / total) * 100),
      fair: Math.round((distribution.fair / total) * 100),
      poor: Math.round((distribution.poor / total) * 100)
    };
  } catch (error) {
    console.error('Error getting adherence distribution:', error);
    return { excellent: 0, good: 0, fair: 0, poor: 0 };
  }
};

export default {
  verifyAdminCredentials,
  getSystemAnalytics,
  getUserGrowthData,
  getMedicineStatistics,
  getSystemActivity,
  getAdherenceDistribution
};