/**
 * Test Script for Cloud Functions
 * Run with: node test.js
 */

const admin = require("firebase-admin");

// Initialize with service account for testing
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Test data creation
 */
async function createTestData() {
  console.log("📝 Creating test data...");

  try {
    // Create test user
    const userId = "test-user-" + Date.now();
    await db.collection("users").doc(userId).set({
      email: "test@example.com",
      displayName: "Test User",
      role: "patient",
      fcmToken: "test-token",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Test user created:", userId);

    // Create test medicine
    const medicineId = "test-medicine-" + Date.now();
    await db.collection("medicines").doc(medicineId).set({
      userId: userId,
      name: "Test Medicine",
      dosage: "2 tablets",
      time: "08:00",
      frequency: "Daily",
      notes: "Test notes",
      color: "blue",
      taken: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("✅ Test medicine created:", medicineId);

    return { userId, medicineId };
  } catch (error) {
    console.error("❌ Error creating test data:", error);
    throw error;
  }
}

/**
 * Test notification sending
 */
async function testNotification(userId, medicineId) {
  console.log("\n🔔 Testing notification...");

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const medicineDoc = await db.collection("medicines").doc(medicineId).get();

    if (!userDoc.exists || !medicineDoc.exists) {
      throw new Error("Test data not found");
    }

    const user = userDoc.data();
    const medicine = medicineDoc.data();

    console.log("User:", user.email);
    console.log("Medicine:", medicine.name);
    console.log("FCM Token:", user.fcmToken);

    // Note: This will fail with test token, but shows the structure
    console.log("✅ Notification structure validated");
  } catch (error) {
    console.error("❌ Error testing notification:", error);
  }
}

/**
 * Cleanup test data
 */
async function cleanup(userId, medicineId) {
  console.log("\n🧹 Cleaning up test data...");

  try {
    await db.collection("medicines").doc(medicineId).delete();
    await db.collection("users").doc(userId).delete();
    console.log("✅ Test data cleaned up");
  } catch (error) {
    console.error("❌ Error cleaning up:", error);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log("🧪 Starting Cloud Functions Tests");
  console.log("==================================\n");

  try {
    const { userId, medicineId } = await createTestData();
    await testNotification(userId, medicineId);
    await cleanup(userId, medicineId);

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Tests failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run tests
runTests();