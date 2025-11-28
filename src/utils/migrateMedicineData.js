// src/utils/migrateMedicineData.js
/**
 * Migration script to fix medicine data structure
 * Run this ONCE to convert old 'taken' boolean to 'takenHistory' object
 * 
 * HOW TO USE:
 * 1. Import this in your PatientDashboard or App.js
 * 2. Call migrateMedicineData(userId) on mount
 * 3. Remove after migration is complete
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const todayKey = () => new Date().toISOString().split('T')[0];

/**
 * Migrate medicine data from old structure to new
 */
export const migrateMedicineData = async (userId) => {
  try {
    console.log('🔄 Starting medicine data migration...');

    const medicinesQuery = query(
      collection(db, 'medicines'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(medicinesQuery);
    const medicines = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    console.log(`📊 Found ${medicines.length} medicines to check`);

    let migratedCount = 0;

    for (const med of medicines) {
      const needsMigration = 
        // Has old 'taken' field
        (med.hasOwnProperty('taken') && typeof med.taken === 'boolean') ||
        // Missing takenHistory
        !med.takenHistory;

      if (needsMigration) {
        const medRef = doc(db, 'medicines', med.id);
        
        const updates = {
          takenHistory: med.takenHistory || {}
        };

        // If old 'taken' was true, add today's entry
        if (med.taken === true) {
          updates.takenHistory[todayKey()] = true;
        }

        // Remove old 'taken' field by not including it
        await updateDoc(medRef, updates);
        
        migratedCount++;
        console.log(`✅ Migrated: ${med.name || 'Medicine ' + med.id}`);
      }
    }

    console.log(`✨ Migration complete! ${migratedCount} medicines updated.`);
    return { success: true, migratedCount };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error };
  }
};

/**
 * Clean up any duplicate or corrupted entries
 */
export const cleanupDuplicates = async (userId) => {
  try {
    console.log('🧹 Starting cleanup...');

    const medicinesQuery = query(
      collection(db, 'medicines'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(medicinesQuery);
    const medicines = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // Find duplicates by name + time
    const seen = new Map();
    const duplicates = [];

    medicines.forEach(med => {
      const key = `${med.name}-${med.time}`;
      if (seen.has(key)) {
        duplicates.push(med.id);
      } else {
        seen.set(key, med.id);
      }
    });

    console.log(`🔍 Found ${duplicates.length} duplicates`);

    // Note: Actual deletion requires user confirmation
    return { duplicates, count: duplicates.length };

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return { duplicates: [], count: 0, error };
  }
};

/**
 * Verify data integrity
 */
export const verifyDataIntegrity = async (userId) => {
  try {
    console.log('🔍 Verifying data integrity...');

    const medicinesQuery = query(
      collection(db, 'medicines'),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(medicinesQuery);
    const medicines = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const issues = [];

    medicines.forEach(med => {
      // Check for old structure
      if (med.hasOwnProperty('taken') && typeof med.taken === 'boolean') {
        issues.push({
          id: med.id,
          name: med.name,
          issue: 'Has old "taken" boolean field'
        });
      }

      // Check for missing takenHistory
      if (!med.takenHistory) {
        issues.push({
          id: med.id,
          name: med.name,
          issue: 'Missing takenHistory object'
        });
      }

      // Check for invalid takenHistory
      if (med.takenHistory && typeof med.takenHistory !== 'object') {
        issues.push({
          id: med.id,
          name: med.name,
          issue: 'takenHistory is not an object'
        });
      }
    });

    console.log(`📋 Integrity check complete: ${issues.length} issues found`);
    
    if (issues.length > 0) {
      console.table(issues);
    }

    return {
      totalMedicines: medicines.length,
      issuesFound: issues.length,
      issues
    };

  } catch (error) {
    console.error('❌ Verification failed:', error);
    return { totalMedicines: 0, issuesFound: 0, issues: [], error };
  }
};

// Export all utilities
export default {
  migrateMedicineData,
  cleanupDuplicates,
  verifyDataIntegrity
};