import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  username: String,
  benchMax: Number,
  deadliftMax: Number,
  squatMax: Number,
});

export default mongoose.model("User", userSchema);
