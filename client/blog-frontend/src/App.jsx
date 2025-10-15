import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EditPost from "./components/EditPost";
import Home from "./pages/Home";
import SinglePost from "./pages/SinglePost";
import CreatePost from "./pages/CreatePost";
import MyProfile from "./pages/MyProfile";
import Profile from "./pages/Profile";
import TrendingPage from "./pages/TrendingPage";
import Bookmarks from "./pages/Bookmarks";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  //const [theme, setTheme] = useState("dark");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // Save theme whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <Navbar theme={theme} setTheme={setTheme} />
        <main className="flex-fill container py-3">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/home" element={
            <ProtectedRoute>
              <Home theme={theme} />
            </ProtectedRoute>
          }/>
            <Route path="/posts/:id" element={
              <ProtectedRoute>
                <SinglePost />
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } />
            <Route path="/myprofile" element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            } />
            <Route path="/trending" element={
              <ProtectedRoute>
                <TrendingPage />
              </ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/posts/edit/:id" element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            } />
            <Route path="/bookmarks" element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } />

            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}

export default App;

