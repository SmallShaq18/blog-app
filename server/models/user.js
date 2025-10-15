//USER MODEL

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const DEFAULT_AVATAR = "https://res.cloudinary.com/dlu8ltbx1/image/upload/v1758373732/default_avatar_ngs4rn.jpg";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [20, "Username cannot exceed 20 characters"],
    match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, "Please provide a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"]
  },
    bio: { type: String, default: "" },
    avatar: { type: String, default: DEFAULT_AVATAR },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });

// ✅ Normalize username to lowercase before saving
userSchema.pre("save", function (next) {
  if (this.isModified("username")) {
    this.username = this.username.toLowerCase();
  }
  next();
});

// ✅ Password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);


