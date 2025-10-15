import express from "express";
import User from "../models/user.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import adminMw from "../middlewares/adminMw.js";
import authMw from "../middlewares/authMw.js";


const router = express.Router();

//Get all users (Admin only)
router.get("/users", authMw, adminMw, async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      filter = {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      };
    }
    
    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Delete user by ID (Admin only)
router.delete("/users/:id", authMw, adminMw, async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Delete all comments by this user
    await Comment.deleteMany({ author: userId });

    // 2. Delete all posts by this user
    await Post.deleteMany({ author: userId });

    // 3. Deleta all ratings by this user
    await Rating.deleteMany({ userId: userId });

    // 4. Finally delete the user
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted by admin" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Delete any post by ID (Admin only)
router.delete("/posts/:id", authMw, adminMw, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted by admin" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Delete any comment by ID (Admin only)

router.delete("/comments/:id", authMw, adminMw, async (req, res) => {
  try {
    const post = await Post.findOne({ "comments._id": req.params.id });
    if (!post) return res.status(404).json({ error: "Comment not found" });

    post.comments = post.comments.filter(
      (c) => c._id.toString() !== req.params.id
    );

    await post.save();
    res.json({ msg: "Comment deleted by admin" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
