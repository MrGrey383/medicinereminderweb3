/**
 * Vercel Cron Job - Send weekly medication reports
 * Schedule: 0 20 * * 0 (8 PM every Sunday)
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
    const weekDates = [];
    
    // Get last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      weekDates.push(date.toISOString().split("T")[0]);
    }

    const usersSnapshot = await db.collection("users").get();
    let sentCount = 0;

    const promises = usersSnapshot.docs.map(async (userDoc) => {
      const user = userDoc.data();
      
      const medicinesSnapshot = await db
        .collection("medicines")
        .where("userId", "==", userDoc.id)
        .get();

      if (medicinesSnapshot.empty) return;

      let totalDoses = 0;
      let takenDoses = 0;
      const dailyStats = {};

      weekDates.forEach(date => {
        dailyStats[date] = { taken: 0, missed: 0 };
      });

      medicinesSnapshot.docs.forEach((doc) => {
        const medicine = doc.data();
        
        weekDates.forEach(date => {
          totalDoses++;
          const taken = medicine.takenHistory?.[date] || false;
          if (taken) {
            takenDoses++;
            dailyStats[date].taken++;
          } else {
            dailyStats[date].missed++;
          }
        });
      });

      const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

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
          subject: `📈 Your Weekly Medication Report`,
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
                <h1>📈 Weekly Report</h1>
                <p>Last 7 Days Summary</p>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2>Hi ${user.displayName || user.name}! 👋</h2>
                <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0;">Adherence Rate</h3>
                  <div style="font-size: 48px; color: ${adherenceRate >= 80 ? '#10b981' : adherenceRate >= 50 ? '#f59e0b' : '#ef4444'};">
                    ${adherenceRate}%
                  </div>
                  <p style="color: #666;">${takenDoses} of ${totalDoses} doses taken</p>
                </div>
                <h3>Daily Breakdown:</h3>
                ${weekDates.reverse().map(date => {
                  const stats = dailyStats[date];
                  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                  return `
                    <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px;">
                      <strong>${dayName} - ${date}</strong>
                      <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <span style="color: #10b981;">✅ ${stats.taken}</span>
                        <span style="color: #ef4444;">❌ ${stats.missed}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
                <center style="margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://mediremind.app"}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
                    View Full History
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
        console.log("Weekly report sent to:", user.email);
      }
    });

    await Promise.all(promises);

    return res.status(200).json({ 
      success: true, 
      message: `Sent ${sentCount} weekly reports`
    });

  } catch (error) {
    console.error("Error sending weekly reports:", error);
    return res.status(500).json({ 
      error: "Failed to send reports", 
      details: error.message 
    });
  }
}