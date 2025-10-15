import { useState } from "react";
import API from "../api";
import { useAuthContext } from "../AuthContext";

function LikeButton({ post }) {
  const { user } = useAuthContext();
  const [likes, setLikes] = useState(post.likes.length);
  const [liked, setLiked] = useState(post.likes.includes(user?.id));
  const [animating, setAnimating] = useState(false);

  const handleLike = async () => {
    try {
      const res = await API.post(`/posts/${post._id}/like`);
      setLikes(res.data.likes);
      setLiked(res.data.liked);

      // trigger animation
      if (!animating) {
        setAnimating(true);
        setTimeout(() => setAnimating(false), 500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      className={`btn p-0 border-0 ${
        liked ? "text-danger" : "text-secondary"
      } ${animating ? "heart-anim" : ""}`}
      onClick={handleLike}
      disabled={!user}
      style={{ fontSize: "1.5rem" }}
    >
      <i className={`fa${liked ? "s" : "r"} fa-heart`}></i> {likes}
    </button>
  );
}

export default LikeButton;

