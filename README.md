# MovieX - A Simple MERN Blog Platform

A clean, full-stack blog app built with **React**, **Node.js**, **Express**, and **MongoDB**.
Users can **create**, **edit**, **delete**, **like**, and **comment** on posts — all with authentication.

---

## 🚀 Features

### 🧠 Core

* Create, read, update, and delete posts
* Like and comment on posts
* Responsive design with smooth UI
* Auth system (login, signup, logout) with protected routes

### 🧑‍🎨 Posts

* Form validation (title, content, tags)
* Upload post images using **Cloudinary**
* Auto-preview of uploaded image before publishing
* Tag system — write tags like `tech, react, life`
* Individual post pages with dynamic routing

### 💬 Comments & Likes

* Add and delete comments
* Like/unlike system with instant feedback
* When a post is deleted, all its comments and ratings are also deleted

### 👤 Profiles

* View other users’ profiles
* Navigate to `/myProfile` if it’s your own
* Profile picture upload with Cloudinary integration
* Bio editing and update functionality

### ⚡ Experience

* Toast notifications for feedback (success/error)
* Loading states and error handling
* Smart scroll behavior when navigating posts
* Persistent state across refreshes where possible

---

## 🛠️ Tech Stack

**Frontend:**

* React (Hooks, Context API)
* React Router
* Axios
* Toastify

**Backend:**

* Node.js
* Express.js
* MongoDB (Mongoose)
* Cloudinary for image uploads

---

## 🧩 How It Works

1. **Authentication:**
   Users sign up or log in — credentials are validated on the backend.

2. **Creating Posts:**
   Posts are made using `FormData`, which allows text + image uploads.

3. **Image Uploads:**
   Images are sent to Cloudinary via their API, returning a secure URL stored in the database.

4. **Comments & Likes:**
   Everything updates in real-time (no manual refresh needed).

5. **Smooth Navigation:**
   Clicking a post opens the single post view, and going back preserves your scroll position (if cached).

---

## ⚙️ Setup

1. Clone the repo

   ```bash
   git clone https://github.com/yourusername/blogify.git
   cd blogify
   ```

2. Install dependencies

   ```bash
   npm install
   cd client && npm install
   ```

3. Add a `.env` file for backend:

   ```
   MONGO_URI=your_mongo_connection
   JWT_SECRET=your_secret
   CLOUDINARY_NAME=your_cloud_name
   CLOUDINARY_PRESET=your_upload_preset
   ```

4. Add a `.env` file for frontend:

   ```
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   ```

5. Run both servers

   ```bash
   npm run dev
   ```

---

## 🧠 Notes

* Smooth scrolling sometimes resets on navigation depending on how React Router handles state.
* If you go back from a post, it refetches data — that’s expected unless caching is added.
* All deleted posts automatically remove their associated comments and ratings.

---

## 💬 Closing Thought

This app started simple — just posts and comments — but evolved into a full-featured blogging platform with image uploads, profiles, and a cleaner UX. It’s built to show practical MERN skills without unnecessary complexity.

---

Want to fork or improve it? Go for it.
🖋️ *Made with React, Express, and too much coffee.* ☕
