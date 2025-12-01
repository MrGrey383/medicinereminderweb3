// functions/src/emailFunctions.js
/**
 * Firebase Cloud Functions for automated emails via Brevo
 * These run on Firebase servers, not in the browser
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Brevo API configuration
const BREVO_API_KEY = functions.config().brevo.key;
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Helper: Send email via Brevo
 */
async function sendBrevoEmail({ to, subject, htmlContent }) {
  const fetch = (await import("node-fetch")).default;
  
  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: "MediRemind",
          email: "noreply@mediremind.app"
        },
        to: [{ email: to }],
        subject,
        htmlContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  } catch (error) {
    console.error("Brevo email error:", error);
    throw error;
  }
}

/**
 * 1. Send welcome email when new user signs up
 * Trigger: User document created
 */
exports.sendWelcomeEmail = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const userEmail = userData.email;
    const userName = userData.displayName || userData.name || "there";
    const userRole = userData.role || "patient";

    const subject = "Welcome to MediRemind! 🎉";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px;">
          <h1>💊 Welcome to MediRemind!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${userName}! 👋</h2>
          <p>Thank you for joining MediRemind as a <strong>${userRole === "patient" ? "Patient" : "Caregiver"}</strong>.</p>
          <p>We're excited to help you on your health journey!</p>
          <center>
            <a href="https://mediremind.app" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Get Started
            </a>
          </center>
        </div>
      </body>
      </html>
    `;

    try {
      await sendBrevoEmail({ to: userEmail, subject, htmlContent });
      console.log("Welcome email sent to:", userEmail);
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }
  });

/**
 * 2. Send medicine reminder 15 minutes before scheduled time
 * Trigger: Scheduled function runs every 15 minutes
 */
exports.sendMedicineReminders = functions.pubsub
  .schedule("every 15 minutes")
  .onRun(async (context) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(Math.floor(now.getMinutes() / 15) * 15).padStart(2, "0")}`;
    
    console.log("Checking for medicine reminders at:", currentTime);

    try {
      // Get all medicines scheduled for this time
      const medicinesSnapshot = await admin.firestore()
        .collection("medicines")
        .where("time", "==", currentTime)
        .get();

      const promises = medicinesSnapshot.docs.map(async (doc) => {
        const medicine = doc.data();
        const todayKey = new Date().toISOString().split("T")[0];
        
        // Check if already taken today
        if (medicine.takenHistory && medicine.takenHistory[todayKey]) {
          console.log("Medicine already taken:", medicine.name);
          return;
        }

        // Get user email
        const userDoc = await admin.firestore()
          .collection("users")
          .doc(medicine.userId)
          .get();
        
        if (!userDoc.exists) return;

        const user = userDoc.data();
        const subject = `⏰ Time for ${medicine.name}`;
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
              <h1>💊 Medication Reminder</h1>
              <p style="font-size: 18px;">It's time to take your medicine!</p>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hi ${user.displayName || user.name}!</h2>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <strong>Medicine:</strong> ${medicine.name}<br>
                <strong>Dosage:</strong> ${medicine.dosage}<br>
                <strong>Time:</strong> ${medicine.time}
              </div>
              <center>
                <a href="https://mediremind.app" style="display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px;">
                  Mark as Taken
                </a>
              </center>
            </div>
          </body>
          </html>
        `;

        await sendBrevoEmail({ to: user.email, subject, htmlContent });
        console.log("Reminder sent for:", medicine.name);
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Error sending reminders:", error);
    }
  });

/**
 * 3. Send daily adherence report at 8 PM
 * Trigger: Scheduled daily at 20:00
 */
exports.sendDailyReports = functions.pubsub
  .schedule("0 20 * * *")
  .timeZone("Africa/Nairobi")
  .onRun(async (context) => {
    console.log("Sending daily adherence reports...");

    try {
      const usersSnapshot = await admin.firestore()
        .collection("users")
        .where("role", "==", "patient")
        .get();

      const promises = usersSnapshot.docs.map(async (userDoc) => {
        const user = userDoc.data();
        const userId = userDoc.id;

        // Get today's medicines
        const medicinesSnapshot = await admin.firestore()
          .collection("medicines")
          .where("userId", "==", userId)
          .get();

        const medicines = medicinesSnapshot.docs.map(d => d.data());
        const todayKey = new Date().toISOString().split("T")[0];

        const total = medicines.length;
        const taken = medicines.filter(m => m.takenHistory && m.takenHistory[todayKey]).length;
        const missed = total - taken;
        const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

        // Send report
        const subject = `📊 Daily Report - ${adherenceRate}% Adherence`;
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
              <h1>📊 Daily Report</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hi ${user.displayName || user.name}!</h2>
              <div style="display: flex; justify-content: space-around; margin: 30px 0;">
                <div style="text-align: center;">
                  <div style="font-size: 48px; font-weight: bold; color: #667eea;">${total}</div>
                  <div>Total</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 48px; font-weight: bold; color: #10b981;">${taken}</div>
                  <div>Taken</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 48px; font-weight: bold; color: #ef4444;">${missed}</div>
                  <div>Missed</div>
                </div>
              </div>
              <div style="background: #f0f0f0; height: 30px; border-radius: 15px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); height: 100%; width: ${adherenceRate}%; display: flex; align-items: center; justify-center; color: white; font-weight: bold;">
                  ${adherenceRate}%
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendBrevoEmail({ to: user.email, subject, htmlContent });
        console.log("Daily report sent to:", user.email);
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Error sending daily reports:", error);
    }
  });

/**
 * 4. Send weekly adherence report every Sunday at 8 PM
 * Trigger: Scheduled weekly
 */
exports.sendWeeklyReports = functions.pubsub
  .schedule("0 20 * * 0")
  .timeZone("Africa/Nairobi")
  .onRun(async (context) => {
    console.log("Sending weekly adherence reports...");

    try {
      const usersSnapshot = await admin.firestore()
        .collection("users")
        .where("role", "==", "patient")
        .get();

      const promises = usersSnapshot.docs.map(async (userDoc) => {
        const user = userDoc.data();
        const userId = userDoc.id;

        // Get medicines
        const medicinesSnapshot = await admin.firestore()
          .collection("medicines")
          .where("userId", "==", userId)
          .get();

        const medicines = medicinesSnapshot.docs.map(d => d.data());

        // Calculate 7-day stats
        const dailyStats = [];
        let totalAdherence = 0;

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split("T")[0];
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

          const taken = medicines.filter(m => m.takenHistory && m.takenHistory[dateKey]).length;
          const total = medicines.length;
          const rate = total > 0 ? Math.round((taken / total) * 100) : 0;

          dailyStats.push({ dayName, rate });
          totalAdherence += rate;
        }

        const avgAdherence = Math.round(totalAdherence / 7);

        // Send report
        const subject = `📈 Weekly Report: ${avgAdherence}% Average Adherence`;
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
              <h1>📈 Weekly Report</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hi ${user.displayName || user.name}!</h2>
              <div style="text-align: center; margin: 30px 0;">
                <div style="font-size: 64px; font-weight: bold; color: #667eea;">${avgAdherence}%</div>
                <div>Average Adherence</div>
              </div>
              <h3>Daily Breakdown:</h3>
              ${dailyStats.map(day => `
                <div style="margin: 10px 0;">
                  <span style="display: inline-block; width: 60px;">${day.dayName}</span>
                  <div style="display: inline-block; width: 60%; height: 25px; background: #f0f0f0; border-radius: 4px; overflow: hidden; vertical-align: middle;">
                    <div style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); height: 100%; width: ${day.rate}%; color: white; padding: 0 10px; line-height: 25px; font-size: 12px; font-weight: bold;">
                      ${day.rate}%
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </body>
          </html>
        `;

        await sendBrevoEmail({ to: user.email, subject, htmlContent });
        console.log("Weekly report sent to:", user.email);
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Error sending weekly reports:", error);
    }
  });

/**
 * 5. Send alert to caregiver when patient misses a dose
 * Trigger: Check every hour for missed doses
 */
exports.checkMissedDoses = functions.pubsub
  .schedule("0 * * * *")
  .onRun(async (context) => {
    const now = new Date();
    const currentHour = now.getHours();
    const todayKey = now.toISOString().split("T")[0];

    console.log("Checking for missed doses...");

    try {
      // Get all medicines scheduled before current hour
      const medicinesSnapshot = await admin.firestore()
        .collection("medicines")
        .get();

      const promises = medicinesSnapshot.docs.map(async (doc) => {
        const medicine = doc.data();
        const [schedHour] = medicine.time.split(":").map(Number);

        // If scheduled time has passed and not taken
        if (schedHour < currentHour && !(medicine.takenHistory && medicine.takenHistory[todayKey])) {
          
          // Get caregiver links
          const linksSnapshot = await admin.firestore()
            .collection("caregiverLinks")
            .where("patientId", "==", medicine.userId)
            .get();

          // Send alert to each caregiver
          const caregiverPromises = linksSnapshot.docs.map(async (linkDoc) => {
            const link = linkDoc.data();
            
            const caregiverDoc = await admin.firestore()
              .collection("users")
              .doc(link.caregiverId)
              .get();

            const patientDoc = await admin.firestore()
              .collection("users")
              .doc(medicine.userId)
              .get();

            if (!caregiverDoc.exists || !patientDoc.exists) return;

            const caregiver = caregiverDoc.data();
            const patient = patientDoc.data();

            const subject = `⚠️ ${patient.displayName} missed ${medicine.name}`;
            const htmlContent = `
              <!DOCTYPE html>
              <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>⚠️ Missed Dose Alert</h2>
                <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
                  <strong>${patient.displayName || patient.name} missed ${medicine.name}</strong>
                  <p>Scheduled for: ${medicine.time}</p>
                </div>
                <center>
                  <a href="https://mediremind.app" style="display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px;">
                    View Dashboard
                  </a>
                </center>
              </body>
              </html>
            `;

            await sendBrevoEmail({ to: caregiver.email, subject, htmlContent });
            console.log("Missed dose alert sent to:", caregiver.email);
          });

          await Promise.all(caregiverPromises);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Error checking missed doses:", error);
    }
  });