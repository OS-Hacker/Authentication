const forgotPasswordTemplate = (resetUrl) => {
  return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You recently requested to reset your password. Click the button below to reset it:</p>
            <a href="${resetUrl}"
              style="display: inline-block; padding: 10px 20px; background-color: #4CAF50;
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Reset Password
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p style="font-size: 12px; color: #999;">
              This link will expire in 15 minutes.
            </p>
          </div>
        `;
};

module.exports = forgotPasswordTemplate;
