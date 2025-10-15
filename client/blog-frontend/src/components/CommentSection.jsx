import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import API from "../api";
import { useAuthContext } from "../AuthContext";
import { Link } from "react-router-dom";

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await API.get(`/comments/${postId}`);
        setComments(res.data);
      } catch {
        toast.error("Failed to load comments");
      }
    };

    fetchComments();
  }, [postId]);

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!newComment.trim()) return;

    try {
      const res = await API.post(`/comments/${postId}`, { text: newComment });
      setComments([res.data, ...comments]);
      setNewComment("");
      toast.success("Reply added!")
    } catch {
      toast.error("Failed to add reply");
    }
    finally {
      setLoading(false);
    }
  };

  // Edit comment
  const handleEditComment = async (commentId, text) => {
    try {
      const res = await API.put(`/comments/${commentId}`, { text });
      setComments(comments.map(c => (c._id === commentId ? res.data : c)));
    } catch {
      toast.error("Failed to edit reply");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      if (user?.role === "admin") {
        toast.info("Reply deleted by admin");
      }
      toast.success("Reply deleted");
    } catch {
      toast.error("Failed to delete reply");
    }
  };

  // Like/unlike comment
  const handleLikeComment = async (commentId) => {
    try {
      const res = await API.post(`/comments/${commentId}/like`);
      setComments(
        comments.map(c =>
          c._id === commentId
          ? { ...c, likes: Array(res.data.likes).fill("placeholder") }
          : c
        )
      );
    } catch {
      toast.error("Failed to like comment");
    }
  };

  return (
    <div className="mt-4">
      <h5>Comments</h5>

      {user && (
        <Form onSubmit={handleAddComment} className="d-flex mb-3 comment">
          <Form.Control
            type="text"
            placeholder={`Post your reply, ${user.username}`}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="border-top shadow-none bg-none"
          />
          <Button type="submit" className="comment-btn border-top border-bottom">Add Comment</Button>
        </Form>
      )}
      {loading && "adding reply..."}

      {comments.map((c) => (
        <div key={c._id} className=" border-bottom p-2 mb-2">
          <Link to={`/profile/${c.author._id}`} className="fw-semibold text-decoration-none">
          <img
                          src={c.author?.avatar || user?.avatar}
                          alt=""
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
          <strong className="ms-3 text-muted">{c.author?.username || "Unknown"}</strong>{" "}
          <small className="text-muted">
            {new Date(c.createdAt).toLocaleString()}
          </small>
          </Link>
          <p className="ms-5">{c.text}</p>

          <Button
            size="sm"
            variant=""
            onClick={() => handleLikeComment(c._id)}
          >
            👍 {c.likes ? c.likes.length : 0 /*c.likes?.length || 0*/}
          </Button>

          {user?.role === "admin" && (
  <button onClick={() => handleDeleteComment(c._id)} className="btn btn-danger btn-sm">
    Delete Comment
  </button>
)}


          {user?.id === c.author?._id && (
            <>
              <Button
                size="sm"
                variant=""
                onClick={() => {
                  const newText = prompt("Edit your comment:", c.text);
                  if (newText) handleEditComment(c._id, newText);
                }}
              >
                ✏️ Edit
              </Button>
              <Button
                size="sm"
                variant=""
                onClick={() => handleDeleteComment(c._id)}
              >
                🗑️ Delete
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default CommentSection;

