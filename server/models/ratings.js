import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// prevent duplicate ratings from the same user for the same post
ratingSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);
