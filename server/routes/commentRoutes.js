import express from "express";
import Comment from "../models/comment.js";
import Post from "../models/post.js";
import authMw from "../middlewares/authMw.js";

import { commentValidator } from "../validators.js";

const router = express.Router();

// Add comment
router.post("/:postId", authMw, async (req, res) => {
  try {
    const { error, value } = commentValidator.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { text } = value;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Save new comment
    let newComment = new Comment({ text, post: post._id, author: req.user.id });
    await newComment.save();

    // Re-fetch with author populated
    newComment = await newComment.populate("author", "username avatar email");

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all comments for a post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "username email avatar")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update comment
router.put("/:id", authMw, async (req, res) => {
  try {
    const { error, value } = commentValidator.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updated = await Comment.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id },
      { $set: value },
      { new: true }
    ).populate("author", "username email avatar");

    if (!updated) return res.status(404).json({ message: "Comment not found or not allowed" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like/unlike a comment
router.post("/:id/like", authMw, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

     if (!comment.likes) comment.likes = []; // safeguard

    const alreadyLiked = comment.likes.includes(req.user.id);
    if (alreadyLiked) {
      comment.likes.pull(req.user.id); // unlike
    } else {
      comment.likes.push(req.user.id); // like
    }

    await comment.save();
    res.json({ likes: comment.likes.length, liked: !alreadyLiked, likedByUser: comment.likes.includes(req.user.id)  });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete comment
router.delete("/:id", authMw, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Allow if author or admin
    if (
      comment.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
