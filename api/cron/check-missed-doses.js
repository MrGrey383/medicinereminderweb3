/**
 * Vercel Cron Job - Check for missed doses and send alerts
 * Schedule: 0 * * * * (every hour)
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    })
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const now = new Date();
    const todayKey = now.toISOString().split("T")[0];
    const currentHour = now.getHours();
    
    // Get all medicines
    const medicinesSnapshot = await db.collection("medicines").get();
    let alertsSent = 0;

    const promises = medicinesSnapshot.docs.map(async (doc) => {
      const medicine = doc.data();
      
      // Skip if already taken today
      if (medicine.takenHistory?.[todayKey]) return;

      // Parse scheduled time
      const [schedHour, schedMin] = medicine.time.split(":").map(Number);
      
      // Check if medicine time has passed (with 1 hour buffer)
      const scheduledTime = new Date(now);
      scheduledTime.setHours(schedHour, schedMin, 0, 0);
      const hoursSinceDue = (now - scheduledTime) / (1000 * 60 * 60);
      
      // Only alert if 1-3 hours past due (avoid spam)
      if (hoursSinceDue < 1 || hoursSinceDue > 3) return;

      // Get user
      const userDoc = await db.collection("users").doc(medicine.userId).get();
      if (!userDoc.exists) return;

      const user = userDoc.data();

      // Send missed dose alert
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          sender: {
            name: "MediRemind",
            email: "noreply@mediremind.app"
          },
          to: [{ email: user.email }],
          subject: `⚠️ Missed Dose Alert: ${medicine.name}`,
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
                <h1>⚠️ Missed Dose Alert</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2>Hi ${user.displayName || user.name},</h2>
                <p>We noticed you haven't taken your medication yet:</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                  <strong>Medicine:</strong> ${medicine.name}<br>
                  <strong>Dosage:</strong> ${medicine.dosage}<br>
                  <strong>Scheduled Time:</strong> ${medicine.time}<br>
                  <strong>Time Overdue:</strong> ~${Math.floor(hoursSinceDue)} hour(s)
                </div>
                <p>If you've already taken it, please mark it as taken in the app.</p>
                <center>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://mediremind.app"}" style="display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px;">
                    Mark as Taken
                  </a>
                </center>
              </div>
            </body>
            </html>
          `
        })
      });

      if (response.ok) {
        alertsSent++;
        console.log("Missed dose alert sent for:", medicine.name);
      }
    });

    await Promise.all(promises);

    return res.status(200).json({ 
      success: true, 
      message: `Sent ${alertsSent} missed dose alerts`,
      checkedAt: now.toISOString()
    });

  } catch (error) {
    console.error("Error checking missed doses:", error);
    return res.status(500).json({ 
      error: "Failed to check missed doses", 
      details: error.message 
    });
  }
}