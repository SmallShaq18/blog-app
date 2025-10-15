import { useAuthContext } from "../AuthContext";
import API from "../api";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";

const BookmarkButton = ({ postId, isBookmarked, onToggle }) => {
  const { user } = useAuthContext();
  
   const handleClick = async () => {
    if (!user) {
      alert("🎬 Please login to save this post");
      return;
    }

    try {
      const res = await API.post(`/users/${user.id}/bookmarks/${postId}`);
      onToggle(res.data.isBookmarked);
    } catch (err) {
      alert("🍿 Failed to toggle bookmark");
    }

  };

  return (
    <button
      onClick={handleClick}
      className="btn btn-link p-0 border-0"
      style={{ fontSize: "1.4rem", color: isBookmarked ? "#ffc107" : "#6c757d" }}
    >
      {isBookmarked ? <BsBookmarkFill /> : <BsBookmark />}
    </button>
  );
};

export default BookmarkButton;

