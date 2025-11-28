/**
 * Script to initialize admin analytics collections
 * Run once: node scripts/initAdminData.js
 */

const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeAdminData() {
  try {
    console.log("🔧 Initializing admin analytics data...");

    // Initialize system stats
    await db.collection("admin_analytics").doc("system_stats").set({
      totalUsers: 0,
      patientCount: 0,
      caregiverCount: 0,
      totalMedicines: 0,
      totalLinks: 0,
      avgAdherence: 0,
      activeUsersToday: 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log("✅ System stats initialized");

    // Initialize adherence distribution
    await db.collection("admin_analytics").doc("adherence_distribution").set({
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log("✅ Adherence distribution initialized");

    // Initialize user growth
    await db.collection("admin_analytics").doc("user_growth").set({
      data: [],
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log("✅ User growth initialized");

    // Initialize medicine stats
    await db.collection("admin_analytics").doc("medicine_stats").set({
      totalMedicines: 0,
      byFrequency: {},
      byTimeSlot: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      },
      avgPerUser: 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log("✅ Medicine stats initialized");

    // Create a test admin user
    await db.collection("admin_users").doc("admin-test").set({
      email: "admin@medicinereminder.com",
      password: "Admin@123", // Change this immediately!
      name: "System Administrator",
      role: "admin",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log("✅ Test admin user created");
    console.log("   Email: admin@medicinereminder.com");
    console.log("   Password: Admin@123");
    console.log("   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!");

    console.log("\n🎉 Admin analytics initialization complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing admin data:", error);
    process.exit(1);
  }
}

initializeAdminData();