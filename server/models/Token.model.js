const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["refresh-token", "email-verification", "reset-password"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: "7d" }, // Auto delete after 7 days
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ token: 1, type: 1 });

module.exports = mongoose.model("Token", tokenSchema);
