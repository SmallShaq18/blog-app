import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }],
    image: { type: String },
    ratings: [ {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      value: { type: Number, required: true, min: 1, max: 5, default: 0 }
    } ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: link comments
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});

// Virtual for average rating
postSchema.virtual("avgRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// ✅ Normalize tags to lowercase before saving
postSchema.pre("save", function (next) {
  if (this.isModified("tags")) {
    this.tags = this.tags.map(tag => tag.toLowerCase());
  }
  next();
});


export default mongoose.model("Post", postSchema);
