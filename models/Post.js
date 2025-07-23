import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: mongoose.Types.ObjectId,
    username: String,
    text: String,
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    userId: mongoose.Types.ObjectId,
    username: String,
    exercise: String,
    sets: [
      {
        weight: Number,
        reps: Number,
      },
    ],
    imageUrl: String,
    likedBy: [mongoose.Types.ObjectId],
    comments: [commentSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
