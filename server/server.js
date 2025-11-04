import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();



// Middlewares

const allowedOrigins = [
  "http://localhost:5173",
  "https://blog-app-bl6x.onrender.com" // your backend itself (optional)
];

// Allow any Vercel deployment of your blog app
const dynamicOrigin = (origin, callback) => {
  if (
    !origin || // allow tools like Postman
    allowedOrigins.includes(origin) ||
    /https:\/\/blog-app.*\.vercel\.app$/.test(origin) // any subdomain of blog-app on Vercel
  ) {
    callback(null, true);
  } else {
    callback(new Error("CORS not allowed for this origin: " + origin));
  }
};

app.use(cors({
  origin: dynamicOrigin,
  credentials: true,
}));

//app.use(cors());
app.use(express.json({ limit: "10mb" }));

// allow larger JSON payloads (e.g., base64 images)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.get("/ping", (req, res) => {
  res.send("pong");
});


// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
