// utils/email.js
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// Recommended: Use environment variables for sensitive data
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const SENDER_EMAIL = process.env.EMAIL_FROM;

// Initialize OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Create transporter
const createTransporter = async () => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: SENDER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
  } catch (error) {
    console.error("Error creating transporter:", error);
    throw error;
  }
};

// Main sendEmail function
const sendEmail = async (emailOptions) => {
  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: `Your App Name <${SENDER_EMAIL}>`,
      ...emailOptions,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
