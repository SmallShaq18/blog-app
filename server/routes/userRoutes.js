import express from "express";
import User from "../models/user.js";
import Post from "../models/post.js";
//import Post from "../models/post.js";
import authMw from "../middlewares/authMw.js";
import uploadMw from "../middlewares/uploadMw.js";

const router = express.Router();

// ✅ Default avatar URL (uploaded to Cloudinary once)
const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dlu8ltbx1/image/upload/v1758373732/default_avatar_ngs4rn.jpg";

// Update profile (bio + avatar)
import fs from "fs";
import path from "path";

// Update profile (bio + avatar)
router.put("/me", authMw, uploadMw.single("avatar"), async (req, res) => {
  try {
    const updates = {};
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Update bio only if provided
    if (req.body.bio !== undefined && req.body.bio.trim() !== "") {
      updates.bio = req.body.bio;
    }

    // Handle avatar upload
    if (req.file && req.file.path) {
      // Delete old avatar file if it exists and is not a default/static one
      if (user.avatar && !user.avatar.includes("default")) {
        const oldAvatarPath = path.resolve(user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      updates.avatar = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get current user profile
router.get("/me", authMw, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username bio avatar role");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get another user's profile (by ID)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username bio avatar role");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users/:id/bookmarks/:postId
router.post("/:id/bookmarks/:postId", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const postId = req.params.postId;
    let isBookmarked;

    // toggle bookmark
    if (user.bookmarks.includes(postId)) {
      user.bookmarks = user.bookmarks.filter(
        (p) => p.toString() !== postId
      );
      isBookmarked = false;
    } else {
      user.bookmarks.push(postId);
      isBookmarked = true;
    }

    await user.save();
    res.json({
      message: "Updated bookmarks",
      bookmarks: user.bookmarks,
      isBookmarked, // <-- add this!
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /users/:id/bookmarks
router.get("/:id/bookmarks", async (req, res) => {
  try {
    const { search } = req.query;

    // First, get the user with bookmarks
    const user = await User.findById(req.params.id)
      .populate({
        path: "bookmarks",
        populate: {
          path: "author",
          select: "username bio avatar",
        },
      })
      .exec();

    if (!user) return res.status(404).json({ error: "User not found" });

    // If search exists, filter bookmarks manually (since populate doesn't take filters easily)
    let bookmarks = user.bookmarks;
    if (search) {
      const regex = new RegExp(search, "i");
      bookmarks = bookmarks.filter(
        (post) => regex.test(post.title) || regex.test(post.content)
      );
    }

    bookmarks = bookmarks.reverse();

    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /users/:id/top-rated
router.get("/:id/top-rated", async (req, res) => {
  try {
    const userId = req.params.id;

    // Find posts where this user has rated
    const posts = await Post.find({ "ratings.user": userId })
      .populate("author", "username email avatar role") // populate author details
      .sort({ "ratings.value": -1 }); // sort by rating value

    // Filter + map only ratings given by this user
    const userRatedPosts = posts.map(post => {
      const userRating = post.ratings.find(r => r.user.toString() === userId);
      if (userRating) {
      return {
        ...post.toObject(),
        userRating: userRating?.value || null,
        ratedAt: userRating.createdAt || post.updatedAt, // fallback if no createdAt
      };
    }
    })
    .filter(Boolean)
      .sort((a, b) => {
        // Sort by rating desc, then by latest rated date
        if (b.userRating === a.userRating) {
          return new Date(b.ratedAt) - new Date(a.ratedAt);
        }
        return b.userRating - a.userRating;
      })
      .slice(0, 5); // ✅ Limit to top 5

    res.json(userRatedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
