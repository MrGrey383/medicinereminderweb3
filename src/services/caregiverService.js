// src/services/caregiverService.js
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const todayKey = () => new Date().toISOString().split('T')[0];

/**
 * Generate a 6-digit linking code for patient
 */
export const generateCaregiverLinkCode = async (patientId) => {
  try {
    console.log('🔐 Generating link code for patient:', patientId);

    // Delete any existing unused codes for this patient
    const existingCodesQuery = query(
      collection(db, 'caregiverLinkCodes'),
      where('patientId', '==', patientId),
      where('used', '==', false)
    );
    const existingCodes = await getDocs(existingCodesQuery);
    await Promise.all(existingCodes.docs.map(d => deleteDoc(doc(db, 'caregiverLinkCodes', d.id))));

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes

    const docRef = await addDoc(collection(db, 'caregiverLinkCodes'), {
      code,
      patientId,
      createdAt: serverTimestamp(),
      expiresAt,
      used: false
    });

    console.log('✅ Link code generated:', code);

    return {
      id: docRef.id,
      code,
      expiresAt: expiresAt.toDate(),
      createdAt: new Date()
    };
  } catch (error) {
    console.error('❌ Error generating code:', error);
    throw error;
  }
};

/**
 * Link caregiver to patient using code
 */
export const linkCaregiverWithCode = async (caregiverId, code) => {
  try {
    console.log('🔗 Linking caregiver with code:', code);

    // Find the code
    const codeQuery = query(
      collection(db, 'caregiverLinkCodes'),
      where('code', '==', code),
      where('used', '==', false)
    );
    const codeSnapshot = await getDocs(codeQuery);

    if (codeSnapshot.empty) {
      throw new Error('Invalid or expired code');
    }

    const codeDoc = codeSnapshot.docs[0];
    const codeData = codeDoc.data();

    // Check if expired
    if (codeData.expiresAt.toDate() < new Date()) {
      throw new Error('This code has expired');
    }

    // Check if already linked
    const existingLinkQuery = query(
      collection(db, 'caregiverLinks'),
      where('patientId', '==', codeData.patientId),
      where('caregiverId', '==', caregiverId)
    );
    const existingLinks = await getDocs(existingLinkQuery);

    if (!existingLinks.empty) {
      throw new Error('You are already linked to this patient');
    }

    // Get patient info
    const { getUserData } = await import('./authService');
    const patientData = await getUserData(codeData.patientId);

    // Create the link
    const linkRef = await addDoc(collection(db, 'caregiverLinks'), {
      patientId: codeData.patientId,
      caregiverId,
      linkedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    // Mark code as used
    await updateDoc(doc(db, 'caregiverLinkCodes', codeDoc.id), {
      used: true,
      usedBy: caregiverId,
      usedAt: serverTimestamp()
    });

    console.log('✅ Caregiver linked successfully');

    return {
      linkId: linkRef.id,
      patientName: patientData?.displayName || patientData?.email,
      patientEmail: patientData?.email
    };
  } catch (error) {
    console.error('❌ Error linking caregiver:', error);
    throw error;
  }
};

/**
 * Get all patients linked to a caregiver
 */
export const getLinkedPatients = async (caregiverId) => {
  try {
    console.log('👥 Loading linked patients for caregiver:', caregiverId);

    const linksQuery = query(
      collection(db, 'caregiverLinks'),
      where('caregiverId', '==', caregiverId)
    );

    const snapshot = await getDocs(linksQuery);
    
    const patients = await Promise.all(
      snapshot.docs.map(async (linkDoc) => {
        const linkData = linkDoc.data();
        
        // Get patient data
        const { getUserData } = await import('./authService');
        const patientData = await getUserData(linkData.patientId);

        return {
          id: linkData.patientId,
          linkId: linkDoc.id,
          email: patientData?.email || 'Unknown',
          displayName: patientData?.displayName || null,
          linkedAt: linkData.linkedAt
        };
      })
    );

    console.log('✅ Found', patients.length, 'linked patients');
    return patients;

  } catch (error) {
    console.error('❌ Error loading linked patients:', error);
    throw error;
  }
};

/**
 * Get all caregivers linked to a patient
 */
export const getLinkedCaregivers = async (patientId) => {
  try {
    console.log('👥 Loading linked caregivers for patient:', patientId);

    const linksQuery = query(
      collection(db, 'caregiverLinks'),
      where('patientId', '==', patientId)
    );

    const snapshot = await getDocs(linksQuery);
    
    const caregivers = await Promise.all(
      snapshot.docs.map(async (linkDoc) => {
        const linkData = linkDoc.data();
        
        // Get caregiver data
        const { getUserData } = await import('./authService');
        const caregiverData = await getUserData(linkData.caregiverId);

        return {
          id: linkData.caregiverId,
          linkId: linkDoc.id,
          email: caregiverData?.email || 'Unknown',
          displayName: caregiverData?.displayName || null,
          linkedAt: linkData.linkedAt
        };
      })
    );

    console.log('✅ Found', caregivers.length, 'linked caregivers');
    return caregivers;

  } catch (error) {
    console.error('❌ Error loading linked caregivers:', error);
    throw error;
  }
};

/**
 * Remove caregiver link
 */
export const removeCaregiverLink = async (linkId) => {
  try {
    console.log('🗑️ Removing caregiver link:', linkId);
    await deleteDoc(doc(db, 'caregiverLinks', linkId));
    console.log('✅ Link removed successfully');
  } catch (error) {
    console.error('❌ Error removing link:', error);
    throw error;
  }
};

/**
 * Get patient adherence data (for caregiver dashboard)
 * ✅ THIS IS THE KEY FUNCTION THAT WAS MISSING/BROKEN
 */
export const getPatientAdherenceData = async (patientId) => {
  try {
    console.log('📊 Loading adherence data for patient:', patientId);

    const key = todayKey();

    // Load patient's medicines
    const medicinesQuery = query(
      collection(db, 'medicines'),
      where('userId', '==', patientId)
    );

    const medicinesSnapshot = await getDocs(medicinesQuery);
    const medicines = medicinesSnapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    // Sort by time
    medicines.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    // Calculate today's stats
    const totalMedicines = medicines.length;
    const takenToday = medicines.filter(m => 
      m.takenHistory && m.takenHistory[key]
    ).length;
    const missedToday = totalMedicines - takenToday;
    const adherenceRate = totalMedicines > 0 
      ? Math.round((takenToday / totalMedicines) * 100)
      : 0;

    // Calculate 7-day adherence history
    const adherenceHistory = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      const taken = medicines.filter(m => 
        m.takenHistory && m.takenHistory[dateKey]
      ).length;

      adherenceHistory.push({
        date: dateKey,
        dateFormatted: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        adherenceRate: totalMedicines > 0 
          ? Math.round((taken / totalMedicines) * 100)
          : 0,
        taken,
        total: totalMedicines
      });
    }

    const result = {
      stats: {
        totalMedicines,
        takenToday,
        missedToday,
        adherenceRate
      },
      medicines,
      adherenceHistory
    };

    console.log('✅ Adherence data loaded:', result.stats);
    return result;

  } catch (error) {
    console.error('❌ Error loading patient adherence data:', error);
    throw error;
  }
};

/**
 * Send message/reminder to patient
 */
export const sendCaregiverMessage = async (caregiverId, patientId, message, type = 'reminder') => {
  try {
    console.log('💬 Sending message to patient:', patientId);

    await addDoc(collection(db, 'caregiverMessages'), {
      caregiverId,
      patientId,
      message,
      type,
      read: false,
      createdAt: serverTimestamp()
    });

    console.log('✅ Message sent successfully');
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

export default {
  generateCaregiverLinkCode,
  linkCaregiverWithCode,
  getLinkedPatients,
  getLinkedCaregivers,
  removeCaregiverLink,
  getPatientAdherenceData,
  sendCaregiverMessage
};