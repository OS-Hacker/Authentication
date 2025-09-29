const verifyAccountTemplate = (email, verificationUrl) => {
  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our App!</h2>
          <p>Please verify your email address to complete your registration.</p>
          <p>Here are your login details for reference:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> The password you entered during signup</p>
          <a href="${verificationUrl}"
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50;
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Verify Email
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p style="font-size: 12px; color: #999;">
            This link will expire in 24 hours.
          </p>
        </div>
      `;
};

module.exports = verifyAccountTemplate;
