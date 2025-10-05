const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // ✅ Import bcrypt

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // ✅ Add unique
      lowercase: true, // ✅ Add lowercase
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // ✅ Add minimum length
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // Last login timestamp
    lastLogin: Date,
    role: {
      type: String,
      enum: ["user", "admin", "moderator"], // Define allowed roles
      default: "user",
    },
  },
  {
    timestamps: true, // ✅ Add timestamps for createdAt, updatedAt
  }
);

// ✅ Hash password before saving - MUST be before model creation
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Compare password method - MUST be before model creation
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ Create model AFTER all schema methods are defined
const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
