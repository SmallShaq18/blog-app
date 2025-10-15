import React from "react";
import Trending from "../components/Trending";
import { useNavigate } from "react-router-dom";

export default function TrendingPage() {

  const navigate = useNavigate();

  return (

    <div>
      <button 
        onClick={() => navigate(-1)} 
        className="d-lg-none btn btn-sm btn-outline-primary"
      >
        🎥 Back
      </button>
      <h1>Trending Posts</h1>
      <Trending />
    </div>

  );
}
