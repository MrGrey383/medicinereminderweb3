/**
 * Vercel Cron Job - Send daily medication reports
 * Schedule: 0 20 * * * (8 PM daily)
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
    const todayKey = new Date().toISOString().split("T")[0];
    const usersSnapshot = await db.collection("users").get();
    let sentCount = 0;

    const promises = usersSnapshot.docs.map(async (userDoc) => {
      const user = userDoc.data();
      
      // Get user's medicines
      const medicinesSnapshot = await db
        .collection("medicines")
        .where("userId", "==", userDoc.id)
        .get();

      if (medicinesSnapshot.empty) return;

      let takenCount = 0;
      let missedCount = 0;
      const medicines = [];

      medicinesSnapshot.docs.forEach((doc) => {
        const medicine = doc.data();
        const taken = medicine.takenHistory?.[todayKey] || false;
        
        medicines.push({
          name: medicine.name,
          time: medicine.time,
          taken: taken
        });

        if (taken) takenCount++;
        else missedCount++;
      });

      // Only send if there are medicines scheduled
      if (medicines.length === 0) return;

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
          subject: `📊 Your Daily Medication Report - ${todayKey}`,
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
                <h1>📊 Daily Report</h1>
                <p>${todayKey}</p>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2>Hi ${user.displayName || user.name}! 👋</h2>
                <div style="display: flex; gap: 20px; margin: 20px 0;">
                  <div style="flex: 1; background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3 style="margin: 0;">✅ Taken</h3>
                    <p style="font-size: 32px; margin: 10px 0;">${takenCount}</p>
                  </div>
                  <div style="flex: 1; background: #ef4444; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3 style="margin: 0;">❌ Missed</h3>
                    <p style="font-size: 32px; margin: 10px 0;">${missedCount}</p>
                  </div>
                </div>
                <h3>Today's Medications:</h3>
                ${medicines.map(med => `
                  <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid ${med.taken ? '#10b981' : '#ef4444'};">
                    <strong>${med.name}</strong> - ${med.time}
                    <span style="float: right;">${med.taken ? '✅' : '❌'}</span>
                  </div>
                `).join('')}
                <center style="margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://mediremind.app"}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                    View Dashboard
                  </a>
                </center>
              </div>
            </body>
            </html>
          `
        })
      });

      if (response.ok) {
        sentCount++;
        console.log("Daily report sent to:", user.email);
      }
    });

    await Promise.all(promises);

    return res.status(200).json({ 
      success: true, 
      message: `Sent ${sentCount} daily reports`
    });

  } catch (error) {
    console.error("Error sending daily reports:", error);
    return res.status(500).json({ 
      error: "Failed to send reports", 
      details: error.message 
    });
  }
}