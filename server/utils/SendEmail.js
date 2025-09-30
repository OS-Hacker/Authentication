// utils/email.js
const nodemailer = require("nodemailer");

// Create transporter (moved outside functions to reuse it)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "os363612@gmail.com",
    pass: "aolu hklo ckso nupn",
  },
});

const sendEmail = async (emailOptions) => {
  try {
    // Validate email options
    if (!emailOptions.to) {
      throw new Error("No recipient specified");
    }

    // Send mail
    await transporter.sendMail({
      from: `Alpha Tech <${process.env.EMAIL_FROM || "os363612@gmail.com"}>`,
      to: emailOptions.to,
      subject: emailOptions.subject,
      html: emailOptions.html || emailOptions.text || emailOptions.message,
    });

    console.log("Email sent successfully to:", emailOptions.to);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error; // Re-throw the error for the calling function to handle
  }
};

module.exports = sendEmail;
