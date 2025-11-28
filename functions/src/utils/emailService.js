/**
 * SendGrid Email Service
 * Handles sending email notifications for medicine reminders
 */

const sgMail = require('@sendgrid/mail');
const functions = require('firebase-functions');

// Initialize SendGrid with API key from environment
const SENDGRID_API_KEY = functions.config().sendgrid?.api_key || process.env.SENDGRID_API_KEY;

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('⚠️ SendGrid API key not configured');
}

// Your verified sender email (must be verified in SendGrid)
const FROM_EMAIL = 'reminders@yourdomain.com'; // Change this to your verified email

/**
 * Send a single medicine reminder email
 * @param {string} toEmail - Recipient email
 * @param {object} medicine - Medicine data
 * @returns {Promise<boolean>}
 */
exports.sendMedicineReminderEmail = async (toEmail, medicine) => {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid not configured, skipping email');
    return false;
  }

  try {
    const msg = {
      to: toEmail,
      from: FROM_EMAIL,
      subject: `💊 Reminder: Time to take ${medicine.name}`,
      text: `
Hello!

This is a reminder to take your medicine:

Medicine: ${medicine.name}
Dosage: ${medicine.dosage}
Time: ${medicine.time}
${medicine.notes ? `Notes: ${medicine.notes}` : ''}

Please take your medicine as prescribed.

Stay healthy! 🌟
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px; }
    .medicine-card { background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${medicine.color || '#667eea'}; }
    .medicine-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #333; }
    .detail { margin: 10px 0; font-size: 16px; }
    .label { font-weight: bold; color: #555; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💊 Medicine Reminder</h1>
    </div>
    <div class="content">
      <p>Hello!</p>
      <p>This is a friendly reminder to take your medicine:</p>
      
      <div class="medicine-card">
        <div class="medicine-name">${medicine.name}</div>
        <div class="detail"><span class="label">Dosage:</span> ${medicine.dosage}</div>
        <div class="detail"><span class="label">Time:</span> ${medicine.time}</div>
        <div class="detail"><span class="label">Frequency:</span> ${medicine.frequency}</div>
        ${medicine.notes ? `<div class="detail"><span class="label">Notes:</span> ${medicine.notes}</div>` : ''}
      </div>
      
      <p>Please take your medicine as prescribed and mark it as taken in the app.</p>
      
      <a href="https://yourdomain.com" class="button">Open Medicine Reminder App</a>
      
      <div class="footer">
        <p>Stay healthy! 🌟</p>
        <p style="font-size: 12px; color: #999;">You're receiving this because you have email reminders enabled.</p>
      </div>
    </div>
  </div>
</body>
</html>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${toEmail} for ${medicine.name}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.response?.body || error.message);
    return false;
  }
};

/**
 * Send daily medicine summary email
 * @param {string} toEmail - Recipient email
 * @param {string} userName - User's name
 * @param {Array} medicines - Array of medicines for the day
 * @returns {Promise<boolean>}
 */
exports.sendDailySummaryEmail = async (toEmail, userName, medicines) => {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid not configured, skipping email');
    return false;
  }

  try {
    const totalMedicines = medicines.length;
    const takenCount = medicines.filter(m => m.taken).length;
    const pendingCount = totalMedicines - takenCount;

    const medicinesList = medicines.map(m => `
      <div style="background: ${m.taken ? '#e8f5e9' : '#fff3e0'}; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid ${m.color || '#667eea'};">
        <div style="font-weight: bold; font-size: 18px;">${m.taken ? '✅' : '⏰'} ${m.name}</div>
        <div style="margin-top: 5px; color: #666;">
          <strong>Dosage:</strong> ${m.dosage} | <strong>Time:</strong> ${m.time}
          ${m.taken ? ` | <span style="color: green;">Taken at ${m.takenAt ? new Date(m.takenAt.toDate()).toLocaleTimeString() : 'today'}</span>` : ''}
        </div>
      </div>
    `).join('');

    const msg = {
      to: toEmail,
      from: FROM_EMAIL,
      subject: `📊 Your Daily Medicine Summary - ${new Date().toLocaleDateString()}`,
      text: `
Hello ${userName}!

Here's your medicine summary for today:

Total Medicines: ${totalMedicines}
Taken: ${takenCount}
Pending: ${pendingCount}

${medicines.map(m => `${m.taken ? '✅' : '⏰'} ${m.name} - ${m.dosage} at ${m.time}`).join('\n')}

Keep up the good work!
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat-card { background: #f5f7fa; padding: 20px; border-radius: 8px; text-align: center; flex: 1; margin: 0 10px; }
    .stat-number { font-size: 36px; font-weight: bold; color: #667eea; }
    .stat-label { color: #666; margin-top: 5px; }
    .footer { text-align: center; margin-top: 20px; padding: 20px; background: #f5f7fa; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Daily Medicine Summary</h1>
      <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="content">
      <h2>Hello ${userName}! 👋</h2>
      <p>Here's your medicine summary for today:</p>
      
      <div class="stats">
        <div class="stat-card">
          <div class="stat-number">${totalMedicines}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color: #4caf50;">${takenCount}</div>
          <div class="stat-label">Taken</div>
        </div>
        <div class="stat-card">
          <div class="stat-number" style="color: #ff9800;">${pendingCount}</div>
          <div class="stat-label">Pending</div>
        </div>
      </div>
      
      <h3>Today's Medicines:</h3>
      ${medicinesList}
      
      ${pendingCount > 0 ? '<p style="color: #ff9800; font-weight: bold;">⚠️ You have medicines pending. Please take them as scheduled!</p>' : '<p style="color: #4caf50; font-weight: bold;">🌟 Great job! All medicines taken today!</p>'}
    </div>
    <div class="footer">
      <p>Keep up the great work! 💪</p>
      <p style="font-size: 12px; color: #999;">Daily summary sent from Medicine Reminder App</p>
    </div>
  </div>
</body>
</html>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Daily summary sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending daily summary:', error.response?.body || error.message);
    return false;
  }
};

/**
 * Send weekly adherence report email
 * @param {string} toEmail - Recipient email
 * @param {string} userName - User's name
 * @param {object} stats - Weekly statistics
 * @returns {Promise<boolean>}
 */
exports.sendWeeklyReportEmail = async (toEmail, userName, stats) => {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid not configured, skipping email');
    return false;
  }

  try {
    const { adherenceRate, totalMedicines, takenMedicines, weekStart, weekEnd } = stats;
    
    let emoji = '📊';
    let message = '';
    let color = '#667eea';

    if (adherenceRate >= 90) {
      emoji = '🌟';
      message = 'Excellent work!';
      color = '#4caf50';
    } else if (adherenceRate >= 70) {
      emoji = '👍';
      message = 'Good job!';
      color = '#2196f3';
    } else {
      emoji = '📈';
      message = "Let's do better next week!";
      color = '#ff9800';
    }

    const msg = {
      to: toEmail,
      from: FROM_EMAIL,
      subject: `${emoji} Weekly Health Report - ${adherenceRate}% Adherence`,
      text: `
Hello ${userName}!

Here's your weekly health report:

${message}
Adherence Rate: ${adherenceRate}%
Total Medicines: ${totalMedicines}
Taken: ${takenMedicines}
Missed: ${totalMedicines - takenMedicines}

Week: ${weekStart} - ${weekEnd}

Keep up the great work!
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
    .big-number { font-size: 72px; font-weight: bold; text-align: center; color: ${color}; margin: 30px 0; }
    .stats { background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .stat-row:last-child { border-bottom: none; }
    .footer { text-align: center; margin-top: 20px; padding: 20px; background: #f5f7fa; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${emoji} Weekly Health Report</h1>
      <p>${weekStart} - ${weekEnd}</p>
    </div>
    <div class="content">
      <h2>Hello ${userName}! 👋</h2>
      <p style="font-size: 18px;">${message}</p>
      
      <div class="big-number">${adherenceRate}%</div>
      <p style="text-align: center; color: #666; margin-top: -20px;">Adherence Rate</p>
      
      <div class="stats">
        <div class="stat-row">
          <span><strong>Total Medicines:</strong></span>
          <span>${totalMedicines}</span>
        </div>
        <div class="stat-row">
          <span><strong>✅ Taken:</strong></span>
          <span style="color: #4caf50; font-weight: bold;">${takenMedicines}</span>
        </div>
        <div class="stat-row">
          <span><strong>❌ Missed:</strong></span>
          <span style="color: #f44336; font-weight: bold;">${totalMedicines - takenMedicines}</span>
        </div>
      </div>
      
      ${adherenceRate >= 90 ? 
        '<p style="background: #e8f5e9; padding: 15px; border-radius: 8px; color: #2e7d32;">🎉 Amazing! You\'re doing an excellent job staying on track with your medications!</p>' :
        adherenceRate >= 70 ?
        '<p style="background: #e3f2fd; padding: 15px; border-radius: 8px; color: #1565c0;">👏 Good work! Keep it up and try to improve even more next week!</p>' :
        '<p style="background: #fff3e0; padding: 15px; border-radius: 8px; color: #e65100;">💪 Don\'t give up! Set reminders and stay consistent. Your health is important!</p>'
      }
    </div>
    <div class="footer">
      <p>Keep building healthy habits! 🌟</p>
      <p style="font-size: 12px; color: #999;">Weekly report from Medicine Reminder App</p>
    </div>
  </div>
</body>
</html>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Weekly report sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending weekly report:', error.response?.body || error.message);
    return false;
  }
};

module.exports = {
  sendMedicineReminderEmail: exports.sendMedicineReminderEmail,
  sendDailySummaryEmail: exports.sendDailySummaryEmail,
  sendWeeklyReportEmail: exports.sendWeeklyReportEmail
};