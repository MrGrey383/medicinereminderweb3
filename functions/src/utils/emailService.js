// src/services/emailService.js
/**
 * Brevo Email Service
 * Handles all email communications via Brevo API
 */

const BREVO_API_KEY = process.env.REACT_APP_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send email via Brevo API
 */
const sendEmail = async ({ to, subject, htmlContent, templateId = null, params = {} }) => {
  try {
    const payload = {
      sender: {
        name: 'MediRemind',
        email: 'noreply@mediremind.app' // Change to your verified domain
      },
      to: [{ email: to }],
      subject,
      htmlContent
    };

    // If using Brevo template
    if (templateId) {
      payload.templateId = templateId;
      payload.params = params;
      delete payload.htmlContent;
      delete payload.subject;
    }

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    const data = await response.json();
    console.log('✅ Email sent successfully:', data);
    return data;

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

/**
 * 1. Send Welcome/Onboarding Email
 */
export const sendWelcomeEmail = async (userEmail, userName, userRole) => {
  const subject = 'Welcome to MediRemind! 🎉';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature-item { margin: 15px 0; padding-left: 25px; position: relative; }
        .feature-item:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💊 Welcome to MediRemind!</h1>
          <p>Your health journey starts here</p>
        </div>
        
        <div class="content">
          <h2>Hi ${userName}! 👋</h2>
          
          <p>Thank you for joining MediRemind as a <strong>${userRole === 'patient' ? 'Patient' : 'Caregiver'}</strong>. We're excited to help you ${userRole === 'patient' ? 'manage your medications' : 'support your loved ones'}!</p>
          
          <div class="features">
            <h3>🚀 Get Started:</h3>
            
            ${userRole === 'patient' ? `
              <div class="feature-item">Add your first medicine and set reminder times</div>
              <div class="feature-item">Enable push notifications to never miss a dose</div>
              <div class="feature-item">Generate a linking code to connect with caregivers</div>
              <div class="feature-item">Track your daily adherence and view progress</div>
            ` : `
              <div class="feature-item">Get a 6-digit code from your patient</div>
              <div class="feature-item">Link to monitor their medication adherence</div>
              <div class="feature-item">Receive alerts when doses are missed</div>
              <div class="feature-item">View daily and weekly adherence reports</div>
            `}
          </div>
          
          <center>
            <a href="https://mediremind.app" class="button">Open MediRemind</a>
          </center>
          
          <p><strong>Need help?</strong> Reply to this email or check our Help Center.</p>
          
          <p>Stay healthy! 💚<br>The MediRemind Team</p>
        </div>
        
        <div class="footer">
          <p>MediRemind - Never Miss a Dose Again</p>
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: userEmail, subject, htmlContent });
};

/**
 * 2. Send Medicine Reminder Email
 */
export const sendMedicineReminderEmail = async (userEmail, userName, medicine) => {
  const subject = `⏰ Time for ${medicine.name}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .reminder-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0; }
        .medicine-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="reminder-box">
          <h1>💊 Medication Reminder</h1>
          <p style="font-size: 18px; margin: 10px 0;">It's time to take your medicine!</p>
        </div>
        
        <h2>Hi ${userName},</h2>
        
        <p>This is a friendly reminder to take your medication:</p>
        
        <div class="medicine-details">
          <div class="detail-row">
            <strong>Medicine:</strong>
            <span>${medicine.name}</span>
          </div>
          <div class="detail-row">
            <strong>Dosage:</strong>
            <span>${medicine.dosage}</span>
          </div>
          <div class="detail-row">
            <strong>Time:</strong>
            <span>${medicine.time}</span>
          </div>
          ${medicine.instructions ? `
          <div class="detail-row">
            <strong>Instructions:</strong>
            <span>${medicine.instructions}</span>
          </div>
          ` : ''}
        </div>
        
        <center>
          <a href="https://mediremind.app" class="button">Mark as Taken</a>
        </center>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          <strong>💡 Tip:</strong> Enable push notifications in the app for instant reminders!
        </p>
        
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>MediRemind - Your Health Companion</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: userEmail, subject, htmlContent });
};

/**
 * 3. Send Daily Adherence Report
 */
export const sendDailyAdherenceReport = async (userEmail, userName, stats, medicines) => {
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const subject = `📊 Your Daily Report - ${stats.adherenceRate}% Adherence`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #f0f0f0; }
        .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
        .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
        .progress-bar { background: #f0f0f0; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
        .progress-fill { background: linear-gradient(90deg, #10b981 0%, #059669 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .medicine-list { background: #f9f9f9; padding: 20px; border-radius: 8px; }
        .medicine-item { padding: 12px; margin: 8px 0; background: white; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .taken { border-left: 4px solid #10b981; }
        .missed { border-left: 4px solid #ef4444; }
        .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .badge-taken { background: #d1fae5; color: #065f46; }
        .badge-missed { background: #fee2e2; color: #991b1b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Daily Adherence Report</h1>
          <p>${date}</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2>Hi ${userName}! 👋</h2>
          
          <p>Here's your medication adherence summary for today:</p>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${stats.total}</div>
              <div class="stat-label">Total Medicines</div>
            </div>
            <div class="stat-card">
              <div class="stat-number" style="color: #10b981;">${stats.taken}</div>
              <div class="stat-label">Taken</div>
            </div>
            <div class="stat-card">
              <div class="stat-number" style="color: #ef4444;">${stats.missed}</div>
              <div class="stat-label">Missed</div>
            </div>
          </div>
          
          <h3>Adherence Rate</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${stats.adherenceRate}%;">
              ${stats.adherenceRate}%
            </div>
          </div>
          
          <h3>Today's Medicines</h3>
          <div class="medicine-list">
            ${medicines.map(med => {
              const todayKey = new Date().toISOString().split('T')[0];
              const taken = med.takenHistory && med.takenHistory[todayKey];
              
              return `
                <div class="medicine-item ${taken ? 'taken' : 'missed'}">
                  <div>
                    <strong>${med.name}</strong>
                    <div style="font-size: 12px; color: #666;">${med.time} • ${med.dosage}</div>
                  </div>
                  <span class="badge ${taken ? 'badge-taken' : 'badge-missed'}">
                    ${taken ? '✓ Taken' : '✗ Missed'}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
          
          ${stats.adherenceRate >= 80 ? `
            <div style="background: #d1fae5; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <strong style="color: #065f46;">🎉 Great job!</strong>
              <p style="color: #065f46; margin: 5px 0 0 0;">You're maintaining excellent adherence. Keep up the good work!</p>
            </div>
          ` : `
            <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <strong style="color: #92400e;">💪 You can do better!</strong>
              <p style="color: #92400e; margin: 5px 0 0 0;">Try setting more reminders or asking a caregiver for support.</p>
            </div>
          `}
          
          <center style="margin-top: 30px;">
            <a href="https://mediremind.app" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
              View Full Report
            </a>
          </center>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>MediRemind - Stay on Track, Stay Healthy</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: userEmail, subject, htmlContent });
};

/**
 * 4. Send Weekly Adherence Report
 */
export const sendWeeklyAdherenceReport = async (userEmail, userName, weeklyStats, dailyBreakdown) => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekEnd = new Date();
  
  const subject = `📈 Weekly Report: ${weeklyStats.averageAdherence}% Average Adherence`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .stats-row { display: flex; justify-content: space-around; margin: 30px 0; }
        .stat-box { text-align: center; }
        .stat-big { font-size: 48px; font-weight: bold; color: #667eea; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .day-bar { margin: 10px 0; }
        .day-label { display: inline-block; width: 80px; font-size: 14px; }
        .bar { display: inline-block; height: 25px; background: linear-gradient(90deg, #10b981 0%, #059669 100%); border-radius: 4px; color: white; padding: 0 10px; line-height: 25px; font-size: 12px; font-weight: bold; }
        .insights { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📈 Weekly Adherence Report</h1>
          <p>${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2>Hi ${userName}! 👋</h2>
          
          <p>Here's your medication adherence for the past 7 days:</p>
          
          <div class="stats-row">
            <div class="stat-box">
              <div class="stat-big">${weeklyStats.averageAdherence}%</div>
              <div>Average Adherence</div>
            </div>
            <div class="stat-box">
              <div class="stat-big" style="color: #10b981;">${weeklyStats.totalTaken}</div>
              <div>Doses Taken</div>
            </div>
            <div class="stat-box">
              <div class="stat-big" style="color: #ef4444;">${weeklyStats.totalMissed}</div>
              <div>Doses Missed</div>
            </div>
          </div>
          
          <h3>Daily Breakdown</h3>
          <div class="chart-container">
            ${dailyBreakdown.map(day => `
              <div class="day-bar">
                <span class="day-label">${day.dayName}</span>
                <div class="bar" style="width: ${day.adherenceRate}%;">
                  ${day.adherenceRate}%
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="insights">
            <strong>💡 Insights:</strong>
            <ul>
              ${weeklyStats.averageAdherence >= 90 ? 
                '<li>Excellent! You maintained over 90% adherence this week.</li>' :
                weeklyStats.averageAdherence >= 70 ?
                '<li>Good progress! Try to improve consistency in the coming week.</li>' :
                '<li>Your adherence needs attention. Consider setting more reminders.</li>'
              }
              ${weeklyStats.bestDay ? 
                `<li>Best day: ${weeklyStats.bestDay.name} with ${weeklyStats.bestDay.rate}% adherence.</li>` : ''
              }
              ${weeklyStats.worstDay ? 
                `<li>Focus on: ${weeklyStats.worstDay.name} - only ${weeklyStats.worstDay.rate}% adherence.</li>` : ''
              }
            </ul>
          </div>
          
          <center style="margin-top: 30px;">
            <a href="https://mediremind.app" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
              View Detailed Analytics
            </a>
          </center>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>MediRemind - Track Progress, Improve Health</p>
          <p>This report is sent every Sunday. You can change frequency in settings.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: userEmail, subject, htmlContent });
};

/**
 * 5. Send Missed Dose Alert to Caregiver
 */
export const sendCaregiverMissedDoseAlert = async (caregiverEmail, caregiverName, patientName, medicine) => {
  const subject = `⚠️ ${patientName} missed ${medicine.name}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .medicine-details { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>⚠️ Missed Dose Alert</h2>
        
        <p>Hi ${caregiverName},</p>
        
        <div class="alert-box">
          <strong style="color: #991b1b;">Missed Medication Alert</strong>
          <p style="margin: 10px 0 0 0; color: #991b1b;">
            ${patientName} has not taken their scheduled medication.
          </p>
        </div>
        
        <div class="medicine-details">
          <div style="margin: 8px 0;"><strong>Medicine:</strong> ${medicine.name}</div>
          <div style="margin: 8px 0;"><strong>Dosage:</strong> ${medicine.dosage}</div>
          <div style="margin: 8px 0;"><strong>Scheduled Time:</strong> ${medicine.time}</div>
          <div style="margin: 8px 0;"><strong>Missed Time:</strong> ${new Date().toLocaleTimeString()}</div>
        </div>
        
        <p><strong>Recommended Actions:</strong></p>
        <ul>
          <li>Contact ${patientName} to remind them</li>
          <li>Check if they need assistance</li>
          <li>Verify if the dose was taken but not logged</li>
        </ul>
        
        <center>
          <a href="https://mediremind.app" class="button">View Patient Dashboard</a>
        </center>
        
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #0369a1; font-size: 14px;">
            <strong>💡 Tip:</strong> Encourage ${patientName} to enable push notifications for better compliance.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>MediRemind Caregiver Alerts</p>
          <p>You're receiving this because you're a caregiver for ${patientName}.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: caregiverEmail, subject, htmlContent });
};

/**
 * 6. Send Caregiver Daily Summary
 */
export const sendCaregiverDailySummary = async (caregiverEmail, caregiverName, patientName, stats) => {
  const subject = `📋 ${patientName}'s Daily Summary - ${stats.adherenceRate}% Adherence`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; padding: 15px; }
        .stat-num { font-size: 36px; font-weight: bold; }
        .status-good { background: #d1fae5; border: 2px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .status-warning { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .status-alert { background: #fee2e2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👨‍⚕️ Caregiver Daily Summary</h1>
          <p>Monitoring ${patientName}</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2>Hi ${caregiverName}! 👋</h2>
          
          <p>Here's ${patientName}'s medication adherence for today:</p>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-num">${stats.total}</div>
              <div>Total</div>
            </div>
            <div class="stat">
              <div class="stat-num" style="color: #10b981;">${stats.taken}</div>
              <div>Taken</div>
            </div>
            <div class="stat">
              <div class="stat-num" style="color: #ef4444;">${stats.missed}</div>
              <div>Missed</div>
            </div>
            <div class="stat">
              <div class="stat-num" style="color: #8b5cf6;">${stats.adherenceRate}%</div>
              <div>Adherence</div>
            </div>
          </div>
          
          ${stats.adherenceRate >= 80 ? `
            <div class="status-good">
              <strong style="color: #065f46;">✅ Excellent Adherence</strong>
              <p style="color: #065f46; margin: 5px 0 0 0;">${patientName} is doing great! No action needed.</p>
            </div>
          ` : stats.adherenceRate >= 60 ? `
            <div class="status-warning">
              <strong style="color: #92400e;">⚠️ Needs Attention</strong>
              <p style="color: #92400e; margin: 5px 0 0 0;">${patientName} missed some doses. Consider checking in.</p>
            </div>
          ` : `
            <div class="status-alert">
              <strong style="color: #991b1b;">🚨 Action Required</strong>
              <p style="color: #991b1b; margin: 5px 0 0 0;">${patientName} has low adherence. Please contact them immediately.</p>
            </div>
          `}
          
          <center style="margin-top: 30px;">
            <a href="https://mediremind.app" style="display: inline-block; padding: 12px 30px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 5px;">
              View Full Dashboard
            </a>
          </center>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
          <p>MediRemind Caregiver Portal</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: caregiverEmail, subject, htmlContent });
};

export default {
  sendWelcomeEmail,
  sendMedicineReminderEmail,
  sendDailyAdherenceReport,
  sendWeeklyAdherenceReport,
  sendCaregiverMissedDoseAlert,
  sendCaregiverDailySummary
};