# 📝 Blog API

A simple blogging platform backend built with **Node.js, Express, MongoDB, and JWT authentication**.  
Users can create posts, comment on posts, and manage their content. Admins can manage all users, posts, and comments.

---

## ⚙️ Tech Stack
- **Node.js + Express**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Joi Validation**

---

## 🔑 Authentication

### Register  
**POST** `/api/auth/register`  
```json
{
  "username": "shaq",
  "email": "shaq@example.com",
  "password": "123456"
}
```
✅ Returns a JWT token + user info.  

### Login  
**POST** `/api/auth/login`  
```json
{
  "email": "shaq@example.com",
  "password": "123456"
}
```
✅ Returns a JWT token + user info.  

---

## 👤 Users
- Role: `user` or `admin` (default: `user`)  
- Optional fields: `bio`, `avatar`

---

## 📚 Posts

### Create Post  
**POST** `/api/posts` (Auth required)  
```json
{
  "title": "Shaq’s First Blog Post",
  "content": "This is my first post!",
  "tags": ["intro", "blogging"]
}
```
✅ Author is automatically set from logged-in user.  

### Get All Posts (with pagination)  
**GET** `/api/posts?page=1&limit=10` (Auth required)  
✅ Returns posts authored by logged-in user.  

### Get Single Post  
**GET** `/api/posts/:id` (Auth required)  

### Update Post  
**PUT** `/api/posts/:id` (Auth required)  
```json
{
  "title": "Updated title",
  "content": "Updated content"
}
```

### Delete Post  
**DELETE** `/api/posts/:id` (Auth required, only your own post)  

---

## 💬 Comments

### Add Comment  
**POST** `/api/comments/:postId` (Auth required)  
```json
{
  "text": "Nice post!"
}
```

### Delete Comment  
**DELETE** `/api/comments/:id` (Auth required, only your own comment)  

---

## 🔐 Admin Features
- Admin can **view all users**
- Admin can **delete any post or comment**
- Admin can **update user roles** (e.g., promote to admin)

---

## ▶️ Running Locally

1. Clone the repo  
   ```bash
   git clone <your-repo-url>
   cd blog-api
   ```

2. Install dependencies  
   ```bash
   npm install
   ```

3. Add a `.env` file with:  
   ```
   MONGO_URI=your_mongodb_connection
   JWT_SECRET=your_secret_key
   ```

4. Start the server  
   ```bash
   npm run dev
   ```

API runs at: `http://localhost:5000`
