/**
 * Admin Analytics Functions
 * Aggregates system-wide data for admin dashboard
 * NO access to individual patient data
 */

const admin = require("firebase-admin");

/**
 * Calculate and update system analytics
 * Runs daily at midnight
 */
exports.updateSystemAnalytics = async (context) => {
  try {
    console.log("📊 Updating system analytics...");

    const db = admin.firestore();

    // Get counts (no personal data)
    const [usersSnapshot, medicinesSnapshot, linksSnapshot] = await Promise.all([
      db.collection("users").get(),
      db.collection("medicines").get(),
      db.collection("caregiver_links").get()
    ]);

    const users = usersSnapshot.docs.map(doc => doc.data());
    const medicines = medicinesSnapshot.docs.map(doc => doc.data());

    // Count by role
    const patientCount = users.filter(u => u.role === "patient").length;
    const caregiverCount = users.filter(u => u.role === "caregiver").length;

    // Calculate average adherence (aggregated only)
    const medicinesByUser = {};
    medicines.forEach(med => {
      if (!medicinesByUser[med.userId]) {
        medicinesByUser[med.userId] = { total: 0, taken: 0 };
      }
      medicinesByUser[med.userId].total++;
      if (med.taken) medicinesByUser[med.userId].taken++;
    });

    const adherenceRates = Object.values(medicinesByUser).map(
      data => data.total > 0 ? (data.taken / data.total) * 100 : 0
    );

    const avgAdherence = adherenceRates.length > 0
      ? adherenceRates.reduce((sum, rate) => sum + rate, 0) / adherenceRates.length
      : 0;

    // Count active users (logged in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsersToday = users.filter(u => {
      if (!u.lastLoginAt) return false;
      const lastLogin = u.lastLoginAt.toDate();
      return lastLogin > sevenDaysAgo;
    }).length;

    // Store aggregated analytics
    const analytics = {
      totalUsers: users.length,
      patientCount,
      caregiverCount,
      totalMedicines: medicines.length,
      totalLinks: linksSnapshot.size,
      avgAdherence: Math.round(avgAdherence),
      activeUsersToday,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("admin_analytics").doc("system_stats").set(analytics);

    console.log("✅ System analytics updated:", analytics);
    return null;
  } catch (error) {
    console.error("❌ Error updating system analytics:", error);
    return null;
  }
};

/**
 * Calculate adherence distribution
 * Runs daily
 */
exports.updateAdherenceDistribution = async (context) => {
  try {
    console.log("📊 Updating adherence distribution...");

    const db = admin.firestore();

    // Get all medicines
    const medicinesSnapshot = await db.collection("medicines").get();
    const medicines = medicinesSnapshot.docs.map(doc => doc.data());

    // Group by user
    const medicinesByUser = {};
    medicines.forEach(med => {
      if (!medicinesByUser[med.userId]) {
        medicinesByUser[med.userId] = { total: 0, taken: 0 };
      }
      medicinesByUser[med.userId].total++;
      if (med.taken) medicinesByUser[med.userId].taken++;
    });

    // Calculate adherence rates
    const adherenceRates = Object.values(medicinesByUser).map(
      data => data.total > 0 ? (data.taken / data.total) * 100 : 0
    );

    // Categorize
    const distribution = {
      excellent: 0, // 80-100%
      good: 0,      // 60-79%
      fair: 0,      // 40-59%
      poor: 0       // 0-39%
    };

    adherenceRates.forEach(rate => {
      if (rate >= 80) distribution.excellent++;
      else if (rate >= 60) distribution.good++;
      else if (rate >= 40) distribution.fair++;
      else distribution.poor++;
    });

    // Convert to percentages
    const total = adherenceRates.length || 1;
    const distributionPercent = {
      excellent: Math.round((distribution.excellent / total) * 100),
      good: Math.round((distribution.good / total) * 100),
      fair: Math.round((distribution.fair / total) * 100),
      poor: Math.round((distribution.poor / total) * 100),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("admin_analytics").doc("adherence_distribution").set(distributionPercent);

    console.log("✅ Adherence distribution updated:", distributionPercent);
    return null;
  } catch (error) {
    console.error("❌ Error updating adherence distribution:", error);
    return null;
  }
};

/**
 * Track user growth over time
 * Runs daily
 */
exports.trackUserGrowth = async (context) => {
  try {
    console.log("📈 Tracking user growth...");

    const db = admin.firestore();
    const today = new Date().toISOString().split("T")[0];

    // Get user counts by role
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map(doc => doc.data());

    const patientCount = users.filter(u => u.role === "patient").length;
    const caregiverCount = users.filter(u => u.role === "caregiver").length;

    // Get existing growth data
    const growthDoc = await db.collection("admin_analytics").doc("user_growth").get();
    let growthData = growthDoc.exists ? growthDoc.data().data || [] : [];

    // Add today's data
    growthData.push({
      date: today,
      patients: patientCount,
      caregivers: caregiverCount,
      total: patientCount + caregiverCount
    });

    // Keep only last 90 days
    if (growthData.length > 90) {
      growthData = growthData.slice(-90);
    }

    await db.collection("admin_analytics").doc("user_growth").set({
      data: growthData,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ User growth tracked for ${today}`);
    return null;
  } catch (error) {
    console.error("❌ Error tracking user growth:", error);
    return null;
  }
};

/**
 * Calculate medicine statistics
 * Runs daily
 */
exports.updateMedicineStatistics = async (context) => {
  try {
    console.log("💊 Updating medicine statistics...");

    const db = admin.firestore();

    // Get all medicines
    const medicinesSnapshot = await db.collection("medicines").get();
    const medicines = medicinesSnapshot.docs.map(doc => doc.data());

    // Count by frequency
    const byFrequency = {};
    medicines.forEach(med => {
      const freq = med.frequency || "Unknown";
      byFrequency[freq] = (byFrequency[freq] || 0) + 1;
    });

    // Count by time slot
    const byTimeSlot = {
      morning: 0,   // 6:00 - 11:59
      afternoon: 0, // 12:00 - 16:59
      evening: 0,   // 17:00 - 20:59
      night: 0      // 21:00 - 5:59
    };

    medicines.forEach(med => {
      const hour = parseInt(med.time?.split(":")[0] || 0);
      if (hour >= 6 && hour < 12) byTimeSlot.morning++;
      else if (hour >= 12 && hour < 17) byTimeSlot.afternoon++;
      else if (hour >= 17 && hour < 21) byTimeSlot.evening++;
      else byTimeSlot.night++;
    });

    // Calculate average per user
    const uniqueUsers = new Set(medicines.map(m => m.userId));
    const avgPerUser = uniqueUsers.size > 0
      ? (medicines.length / uniqueUsers.size).toFixed(1)
      : 0;

    const stats = {
      totalMedicines: medicines.length,
      byFrequency,
      byTimeSlot,
      avgPerUser: parseFloat(avgPerUser),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("admin_analytics").doc("medicine_stats").set(stats);

    console.log("✅ Medicine statistics updated:", stats);
    return null;
  } catch (error) {
    console.error("❌ Error updating medicine statistics:", error);
    return null;
  }
};

/**
 * Log system events for admin monitoring
 * Called by other functions or triggers
 */
exports.logSystemEvent = async (eventType, details) => {
  try {
    const db = admin.firestore();

    await db.collection("system_logs").add({
      action: eventType,
      details: details || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Error logging system event:", error);
    return false;
  }
};

/**
 * Cleanup old logs (keep last 30 days)
 * Runs weekly
 */
exports.cleanupOldLogs = async (context) => {
  try {
    console.log("🧹 Cleaning up old logs...");

    const db = admin.firestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldLogsQuery = db.collection("system_logs")
      .where("timestamp", "<", admin.firestore.Timestamp.fromDate(thirtyDaysAgo));

    const oldLogs = await oldLogsQuery.get();

    if (oldLogs.empty) {
      console.log("No old logs to clean up");
      return null;
    }

    // Delete in batches of 500
    const batch = db.batch();
    let count = 0;

    oldLogs.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });

    await batch.commit();
    console.log(`✅ Cleaned up ${count} old logs`);

    return null;
  } catch (error) {
    console.error("❌ Error cleaning up logs:", error);
    return null;
  }
};