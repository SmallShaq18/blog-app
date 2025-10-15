// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Film, ArrowLeftCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="container text-center mt-5 d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <Film size={48} className="text-muted mb-3" />
      <p className="lead mb-4">🎬 Scene missing! The page you’re looking for doesn’t exist.</p>
      <Link to="/home" className="btn btn-outline-primary d-flex align-items-center gap-2">
        <ArrowLeftCircle size={18} /> Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;

