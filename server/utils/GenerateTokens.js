const jwt = require("jsonwebtoken");
const TokenModel = require("../models/Token.model");
const verifyAccountTemplate = require("../templates/verifyAccountTemplate");
const sendEmail = require("./SendEmail");

// Generate access token
const generateAccessToken = (user) => {
  console.log("userid", user.id);
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

// Store refresh token in DB
const storeRefreshToken = async (userId, refreshToken) => {
  // Invalidate previous refresh tokens for this user
  await TokenModel.updateMany(
    { userId, type: "refresh-token" },
    { blacklisted: true }
  );

  // Store new refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await TokenModel.create({
    userId,
    token: refreshToken,
    type: "refresh-token",
    expiresAt,
  });
};

// Generate email verification token
const generateEmailToken = (userId) => {
  return jwt.sign({ userId }, process.env.EMAIL_TOKEN_SECRET, {
    expiresIn: process.env.EMAIL_TOKEN_EXPIRES_IN,
  });
};

// Store email verification token in DB
const storeEmailToken = async (userId, emailToken) => {
  // Remove previous email verification tokens
  await TokenModel.deleteMany({
    userId,
    type: "email-verification",
  });

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

  await TokenModel.create({
    userId,
    token: emailToken,
    type: "email-verification",
    expiresAt,
  });
};

// Send verification email
// Register -> send verify token to email -> login ->
const sendVerificationEmail = async (emailToken, email) => {
  try {
    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_BASE_URL}/verify-email/${emailToken}`;

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

// Generate reset password token
const generateResetPasswordToken = async (userId) => {
  // Generate a secure random token using jwt
  const resetToken = jwt.sign(
    { userId }, // Include userId in the payload
    process.env.RESET_PASSWORD_TOKEN_SECRET,
    {
      expiresIn: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN || "1h",
    }
  );

  // Calculate expiration date
  const expiresInMs = 60 * 60 * 1000; // 1 hour in milliseconds
  const expiresAt = new Date(Date.now() + expiresInMs);

  await TokenModel.create({
    token: resetToken,
    type: "reset-password",
    userId: userId,
    expiresAt: expiresAt,
  });

  return resetToken;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  sendVerificationEmail,
  storeRefreshToken,
  storeEmailToken,
  generateResetPasswordToken,
  generateEmailToken,
};
