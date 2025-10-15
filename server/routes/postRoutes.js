import express from "express";
import Post from "../models/post.js";
import User from "../models/user.js";
import Comment from "../models/comment.js";
import Rating from "../models/ratings.js";
//import Ratings from "../models/ratings.js";
import authMw from "../middlewares/authMw.js";
import upload from "../middlewares/uploadMw.js";
import mongoose from "mongoose";

import { postValidator } from "../validators.js";

const router = express.Router();

// Health check endpoint
router.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Helper: optional auth middleware
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) {
    return authMw(req, res, next);
  }
  next();
};

// Create post
router.post("/", authMw, upload.single("image"), async (req, res) => {
  try {
    const { error, value } = postValidator.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    
    const { title, content, tags } = value;
    const newPost = new Post({ title,
      content,
      tags,
      image: req.file ? req.file.path : null, // Cloudinary gives us a `path` (the URL)
      author: req.user.id 
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all posts (with optional search, tag, pagination)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { search, tag, page = 1, limit = 0 } = req.query;
    let filter = {};

    // Build filter object
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }
    if (tag) {
      filter.tags = tag; // exact match (or use { $in: [tag] } if array)
    }

    const skip = (page - 1) * limit;

    let query = Post.find(filter)
      .populate("author", "username email avatar bio")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username email avatar bio" }
      })
      .sort({ createdAt: -1 });

    if (limit > 0) query = query.skip(skip).limit(parseInt(limit));

    const posts = await query.exec();
    const total = limit > 0 ? await Post.countDocuments(filter) : posts.length;

    // Get user's bookmarks ONCE (outside the loop)
    let userBookmarks = [];
    if (req.user) {
      const user = await User.findById(req.user.id).select('bookmarks');
      userBookmarks = user.bookmarks?.map(b => b.toString()) || [];
    }

    res.json({
      total,
      page: limit > 0 ? page : 1,
      pages: limit > 0 ? Math.ceil(total / limit) : 1,
      posts: posts.map(post => ({
        ...post.toObject(),
        isBookmarked: userBookmarks.includes(post._id.toString()),
        avgRating: post.avgRating || 0,
        ratingCount: post.ratingCount || 0,
      }))
      
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /posts/trending
router.get("/trending", async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const trendingPosts = await Post.find({ createdAt: { $gte: sinceDate } })
      .populate("author", "username email avatar bio")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username email avatar bio" }
      })
      .sort({
        // sort by engagement: higher avgRating first, then comments count, then recency
        avgRating: -1,
        ratingCount: -1,
        createdAt: -1
      })
      .limit(parseInt(limit));

    res.json(trendingPosts.map(post => ({
      ...post.toObject(),
      avgRating: post.avgRating || 0,
      ratingCount: post.ratingCount || 0,
      commentCount: post.comments.length
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Get logged in user posts (with optional pagination)
router.get("/mine", authMw, async (req, res) => {
  try {
    // If client sends ?page=2&limit=10, use them
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0; // 0 = no limit (return all)
    const skip = (page - 1) * limit;

    // Build query
    let query = Post.find({ author: req.user.id })
      .populate("author", "username email")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username email" }
      })
      .sort({ createdAt: -1 });

    if (limit > 0) query = query.skip(skip).limit(limit);

    const posts = await query.exec();

    // Count total posts (only if using pagination)
    const total = limit > 0 ? await Post.countDocuments({ author: req.user.id }) : posts.length;

    res.json({
      total,
      page: limit > 0 ? page : 1,
      pages: limit > 0 ? Math.ceil(total / limit) : 1,
      posts: posts.map(post => ({
        ...post.toObject(),
        avgRating: post.avgRating || 0,
        ratingCount: post.ratingCount || 0,
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all posts by a user
router.get("/users/:id", optionalAuth, async (req, res) => {  // ← Added optionalAuth
  try {
    const posts = await Post.find({ author: req.params.id })
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    // Get user's bookmarks ONCE (outside the loop)
    let userBookmarks = [];
    if (req.user) {
      const user = await User.findById(req.user.id).select('bookmarks');
      userBookmarks = user?.bookmarks?.map(b => b.toString()) || [];
    }

    res.json(posts.map(post => ({
      ...post.toObject(),
      isBookmarked: userBookmarks.includes(post._id.toString()),  // ← Check each post
      avgRating: post.avgRating || 0,
      ratingCount: post.ratingCount || 0,
    })));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



// Get single post with comments and authors
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username email avatar bio") // populate post author
      .populate({
        path: "comments",
        populate: {
          path: "author", // populate each comment's author
          select: "username email avatar bio",
        },
      });

    if (!post) return res.status(404).json({ message: "Post not found" });

    // calculate avgRating
    const ratings = post.ratings || [];
    const avgRating = ratings.length
      ? (ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length).toFixed(1)
      : 0;
      const ratingCount = ratings.length;

      // Find current user's rating if logged in
    let userRating = null;
    if (req.user) {
      const found = ratings.find(r => r.user.equals(req.user.id));
      userRating = found ? found.value : null;
    }

    // Bookmark status
    let isBookmarked = false;
    if (req.user) {
      const user = await User.findById(req.user.id).select('bookmarks');
      isBookmarked = user?.bookmarks?.some(b => b.equals(post._id)) || false;
    }

    res.json({
      //...post,
      _doc: post.toObject(),
      avgRating,
      ratingCount,
      userRating,
      ratings, // 👈 send full array so frontend knows who rated
      isBookmarked,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update post
router.put("/:id", authMw, async (req, res) => {
  try {
     const { error, value } = postValidator.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updated = await Post.findOneAndUpdate(
  { _id: req.params.id, author: req.user.id },
  { $set: value },  // ✅ partial update
  { new: true }
);
    
    if (!updated) return res.status(404).json({ message: "Post not found or not allowed" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like/unlike a post
router.post("/:id/like", authMw, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.includes(req.user.id);
    if (alreadyLiked) {
      post.likes.pull(req.user.id); // unlike
    } else {
      post.likes.push(req.user.id); // like
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete post
router.delete("/:id", authMw, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Allow if author or admin
    if (
      post.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Delete associated comments and ratings
    await Promise.all([
      Comment.deleteMany({ post: req.params.id }),
      Rating.deleteMany({ postId: req.params.id }),
    ]);

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET posts by all tags
router.get("/tags/all", async (req, res) => {
  try {
    const tags = await Post.distinct("tags");
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET posts by tag/genre
router.get("/tag/:tag", async (req, res) => {
  try {
    const posts = await Post.find({
      tags: { $in: [req.params.tag] }
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /posts/:id/related
router.get("/:id/related", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Find posts with at least one matching tag/genre
    const related = await Post.find({
      _id: { $ne: post._id }, // exclude current post
      tags: { $in: post.tags }, // overlap in tags
    })
      .limit(5)
      .populate("author", "username email avatar bio");

    res.json(related);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Rate a post (1–5)
router.post("/:id/rate", authMw, async (req, res) => {
  try {
    const { value } = req.body; // rating value (1–5)
    const userId = req.user.id;

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // check if user already rated
    const existingRating = post.ratings.find(r => r.user.equals(userId));

    if (existingRating) {
      // update rating
      existingRating.value = value;
    } else {
      // add new rating
      post.ratings.push({ user: userId, value });
    }

    await post.save();

    res.json({
      message: "Rating saved",
      avgRating: post.avgRating,
      ratings: post.ratings.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
