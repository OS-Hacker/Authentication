const jwt = require("jsonwebtoken");
const verifyAccountTemplate = require("../templates/verifyAccountTemplate");
const sendEmail = require("./SendEmail");

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

// Register -> send verify token to email -> login ->
const sendVerificationEmail = async (user, req) => {
  try {
    // Generate new verification token if not present or expired
    let { email, emailVerificationToken, emailVerificationTokenExpires } = user;

    if (!emailVerificationToken || emailVerificationTokenExpires < Date.now()) {
      emailVerificationToken = crypto.randomBytes(32).toString("hex");
      emailVerificationToken = emailVerificationToken;
      emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      await user.save();
    }

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_BASE_URL}/verify-email/${emailVerificationToken}`;

    // Send verification email
    await sendEmail({
      to: email,
      subject: "Verify Your Email/Account",
      html: verifyAccountTemplate(email, verificationUrl),
      text: `Please verify your email/Account by visiting this link: ${verificationUrl}\n\nEmail: ${email}\nPassword: The password you entered during signup\n\nThis link expires in 24 hours.`,
    });
  } catch (emailError) {
    console.log("Failed to send verification email:", emailError);
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  sendVerificationEmail,
};
