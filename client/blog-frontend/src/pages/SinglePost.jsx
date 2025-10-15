import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import API from "../api";
import LikeButton from "../components/LikeButton";
import BookmarkButton from "../components/BookmarkButton";
import CommentSection from "../components/CommentSection";
import StarRating from "../components/StarRating";
import { useAuthContext } from "../AuthContext";
import { useBookmarkContext } from "../BookmarkContext";
import { FaRegComment } from "react-icons/fa";
import ShareButton from "../components/ShareButton";
import timeAgo from "../timeAgo";
import {Edit, Loader} from "lucide-react";

const SinglePost = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const { bookmarkedPosts, setBookmark } = useBookmarkContext();
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const isBookmarked = bookmarkedPosts[post?._id] || false;

  useEffect(() => {
    let cancelled = false;  // ← Cancellation flag
    
    const fetchPost = async () => {
      try {
        const res = await API.get(`/posts/${id}`);
        if (!cancelled) {  // ← Only update if not cancelled
        setPost({
          ...res.data._doc,
          avgRating: res.data.avgRating,
          ratingCount: res.data.ratingCount,
          userRating: res.data.userRating,
        });
        setBookmark(res.data._doc._id, res.data.isBookmarked);
      }
      } catch {
        if (!cancelled) {
        toast.error("Failed to load post");
      }
      } finally {
        if (!cancelled) {
        setLoading(false);
        
      }
      }
    };

    const fetchRelated = async () => {
      try {
      const res = await API.get(`/posts/${id}/related`);
      if (!cancelled) {
        setRelated(res.data);
      }
    } catch {
      if (!cancelled) {
        setRelated([]);
      }
    }
    };

    fetchPost();
    fetchRelated();

    return () => {
    cancelled = true;  // ← Cleanup: mark as cancelled
  };

  }, [id, setBookmark]);

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, []); // empty deps = run once

  

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${postId}`);
      toast.success("Post deleted");
      navigate("/home");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (id) => {
    navigate(`/posts/edit/${id}`);
  };

  const handleRate = (data) => {
    setPost((prev) => ({
      ...prev,
      avgRating: data.avgRating,
      ratingCount: data.ratings,
    }));
  };

  const handleToggleBookmark = async (newStatus) => {
    setBookmark(post._id, newStatus);
    toast(newStatus ? "Post bookmarked" : "Bookmark removed");
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Loader className="spin text-accent" size={40} />
      </div>
    );
  if (!post) return <p className="text-center mt-5">🚫 Post not found</p>;

  return (
    <>

    <button 
  onClick={() => navigate(-1)} 
  className="d-lg-none btn btn-sm btn-outline-primary"
>
  🎥 Back
</button>

    <div className="container mt-5" style={{ maxWidth: "850px" }}>
      <Link to={`/profile/${post.author._id}`} className="fw-semibold text-decoration-none text-dark">
          <div className="d-flex mt-3">
                      <div>
                        <img
                          src={post.author?.avatar}
                          alt={post.author?.username || "Anon"}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <span className="ms-2">
                          <span className="text-muted">{post.author?.username || "Anon"}{" "}</span>
                          <span className="text-muted"> • {timeAgo(post.createdAt)}</span>
                        </span>
                      </div>
                    </div>
        </Link>

        <div className="border-bottom pb-3 mb-3">
            <h1 className="fw-bold mb-3">{post.title}</h1>
            <p className="text-muted mb-4">
            </p>

            <div
              className="mb-5"
              style={{ whiteSpace: "pre-line", fontSize: "1.1rem", lineHeight: "1.7" }}
            >
              {post.content}
            </div>
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="img-fluid rounded mb-4 shadow-sm"
                style={{ maxHeight: "420px", objectFit: "cover", width: "100%" }}
                onClick={() => setSelectedImage(post.image)}
              />
            )}

            {selectedImage && (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-75 d-flex justify-content-center align-items-center"
    style={{ zIndex: 1050 }}
    onClick={() => setSelectedImage(null)}
  >
    <img
      src={selectedImage}
      alt="Full view"
      className="img-fluid rounded shadow-lg"
      style={{
        maxHeight: "90%",
        maxWidth: "90%",
        objectFit: "contain",
        cursor: "zoom-out"
      }}
    />
  </div>
)}


            {post.tags?.length > 0 && (
              <div className="mb-1">
                {post.tags.map((tag, index) => (
                  <span key={index} className="badge bg-dark me-2">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
        </div>
        

      {/* Actions: comments / like / bookmark */}
      <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">

        <span>
          <FaRegComment className="me-1" />{" "}
           {post.comments?.length || 0}
        </span>

        <LikeButton post={post} />

        {/**/}

        {user && (
          <BookmarkButton
            postId={post._id}
            isBookmarked={isBookmarked}
            onToggle={handleToggleBookmark}
          />
        )}

        <ShareButton post={post} />


      </div>

      <StarRating
              postId={post._id}
              user={user}
              userRating={post.userRating}
              onRated={handleRate}
              avgRating={post.avgRating}
              ratingCount={post.ratingCount}
            />

      <div className="d-flex align-items-center gap-3 border-bottom pb-3 mb-4">
      {user?.id === post.author?._id && (
        <Button
          size="sm"
          variant="outline-danger"
          onClick={() => handleDeletePost(post._id)}
        >
          🗑️ Delete
        </Button>
      )}

      {user?.id === post.author?._id && (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => handleEdit(post._id)}
          className="d-flex align-items-center"
                >
                  <Edit size={16} className="me-1" /> Edit
        </Button>
      )}      

      {user?.role === "admin" && (
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleDeletePost(post._id)}
        >
          Admin Delete
        </Button>
      )}
      </div>


      <CommentSection postId={post._id} />

      {/* Related Posts Section */}
      <br/>
      <h4 className="mt-5">🎥 Related Posts</h4>
      <hr />
      <div className="">
        {related.length === 0 ? (
          <p className="text-muted">No related posts.</p>
        ) : (
          related.map((r) => (
            <div className="border-bottom" key={r._id}>
            <Link to={`/profile/${r.author?._id}`} className="text-decoration-none text-reset">
                  <div className="d-flex mt-3">
                      <div>
                        <img
                          src={r.author?.avatar}
                          alt={r.author?.username || "Anon"}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <span className="ms-2">
                          {r.author?.username || "Anon"}{" "}
                          <span className="text-muted">{r.author?.email}</span>
                          <span className="text-muted"> • {timeAgo(r.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
            <Link to={`/posts/${r._id}`} className="text-decoration-none text-reset">
            <div className="mt-2 mb-2 border-0 h-100">
              <h5 className="fw-bold text-truncate">
                  {r.title}
                </h5>
                <p className="text-muted small" style={{ minHeight: "60px" }}>
                  {r.content.length > 100
                    ? r.content.substring(0, 100) + "..."
                    : r.content}
                </p>

              {r.image && (
                <img
                  src={r.image}
                  alt={r.title}
                  style={{
                    margin: "0 auto",
                    display: "block",
                    maxWidth: "50%",
                    maxHeight: "50%",
                    
                    objectFit: "cover",
                  }}
                />
              )}
              </div>
            </Link>
          </div>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default SinglePost;