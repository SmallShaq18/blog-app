import { useState, useEffect } from "react";
import API from "../api";

export default function StarRating({ postId, user, userRating, onRated, avgRating: avgRatingProp, ratingCount: ratingCountProp }) {
  const [rating, setRating] = useState(userRating || 0);
  const [hover, setHover] = useState(0);
  const [avgRating, setAvgRating] = useState(avgRatingProp || 0);
  const [ratingCount, setRatingCount] = useState(ratingCountProp || 0);

  // Keep rating in sync with prop
  useEffect(() => {
    setRating(userRating || 0);
  }, [userRating]);

  // Keep avg/count in sync with props
  useEffect(() => {
    if (avgRatingProp !== undefined) setAvgRating(avgRatingProp);
    if (ratingCountProp !== undefined) setRatingCount(ratingCountProp);
  }, [avgRatingProp, ratingCountProp]);

  const handleRate = async (value) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await API.post(
        `/posts/${postId}/rate`,
        { value },
        { headers }
      );
      setRating(value);
      setAvgRating(res.data.avgRating);
      setRatingCount(res.data.ratings);
      if (onRated) onRated(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", cursor: user ? "pointer" : "not-allowed" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => user && handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              fontSize: "24px",
              color: (hover || rating) >= star ? "#FFD700" : "#ccc"
            }}
          >
            ★
          </span>
        ))}
        <p className="ms-2" style={{ marginTop: "8px", fontSize: "14px" }}>
        Average Rating: {avgRating} ⭐ ({ratingCount} ratings)
      </p>
      </div>
      
    </div>
  );
}
