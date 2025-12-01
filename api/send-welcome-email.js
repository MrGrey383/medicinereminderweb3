// api/send-welcome-email.js
/**
 * Vercel Serverless Function to send welcome emails
 * Endpoint: /api/send-welcome-email
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, name, role } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
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
        to: [{ email: email }],
        subject: "Welcome to MediRemind! 🎉",
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px;">
              <h1>💊 Welcome to MediRemind!</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for joining MediRemind as a <strong>${role === "patient" ? "Patient" : "Caregiver"}</strong>.</p>
              <p>We're excited to help you on your health journey!</p>
              <center>
                <a href="https://mediremind.app" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                  Get Started
                </a>
              </center>
            </div>
          </body>
          </html>
        `
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send email");
    }

    const data = await response.json();
    
    return res.status(200).json({ 
      success: true, 
      message: "Welcome email sent successfully",
      messageId: data.messageId 
    });

  } catch (error) {
    console.error("Error sending welcome email:", error);
    return res.status(500).json({ 
      error: "Failed to send email", 
      details: error.message 
    });
  }
}