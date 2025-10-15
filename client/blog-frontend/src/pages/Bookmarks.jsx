import React, { useEffect, useState } from "react";
import { useAuthContext } from "../AuthContext";
import { Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import LikeButton from "../components/LikeButton";
import BookmarkButton from "../components/BookmarkButton";
import { useBookmarkContext } from "../BookmarkContext";
import { toast } from "react-toastify";
import API from "../api";
import timeAgo from "../timeAgo";
import {Loader} from "lucide-react"

const Bookmarks = () => {
  const { user } = useAuthContext();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const { setBookmark } = useBookmarkContext();
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  const fetchBookmarks = async (query = "") => {
    if (!loading) setFetching(true);
      try {
        const params = {};
        if (query) params.search = query;

        const res = await API.get(`/users/${user.id}/bookmarks`, {params});
        setPosts(res.data);
        setLoading(false);
        setFetching(false);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // 👈 scrolls to top
      } catch (err) {
        toast.error("Failed to load bookmarks 🎬");
      }
    };
  
  useEffect(() => {
    fetchBookmarks("");
  }, [user]);

  const handleToggleBookmark = async (postId, newStatus) => {
    setBookmark(postId, newStatus);
    if (!newStatus) {
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      toast.success("Bookmark removed ❌");
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBookmarks(search);
    }, 100);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchBookmarks(search);
  };

  if (loading){
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Loader className="spin text-accent" size={40} />
      </div>
  )}

  return (
    <>
    <button 
  onClick={() => navigate(-1)} 
  className="d-lg-none btn btn-sm btn-outline-primary"
>
  🎥 Back
</button>

    <div className="container mt-5 position-relative">
      <h2 className="fw-bold mb-4 text-capitalize">
        🎥 {user.username}’s Bookmarks
      </h2>
      {/* 🔍 Search */}
          <form onSubmit={handleSearch} className="mb-5 d-flex">
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control me-2"
            />
            <Button type="submit" variant="outline-primary">
              Search
            </Button>
          </form>

          {fetching && (
            <div className="position-absolute  start-0 w-100 h-100 d-flex justify-content-center align-items-top bg-opacity-75 fetcher" style={{ zIndex: 10 }}>
              <div className="text-center">
                <Loader className="spin text-accent mb-2" size={30} />
                <p className="text-muted small mb-0">Fetching posts...</p>
              </div>
            </div>
          )}

      {posts.length === 0 ? (
        <div className="text-center mt-5">
          <p className="lead">🍿 No saved posts yet. Your cinematic shelf is empty.</p>
          <Link to="/home">
            <Button variant="outline-primary" className="mt-3">
              Browse Posts
            </Button>
          </Link>
        </div>
      ) : (
        <div className="row">
          {posts.map((post) => {
            const isBookmarked = true; // all here are already bookmarked
            return (
              <div className="col-md-6 col-sm-12 p-3 border-end border-start border-bottom" key={post._id}>
                <Link to={`/profile/${post.author?._id}`} className="text-decoration-none text-reset">
                  <div className="d-flex my-3">
                      <div>
                        <img
                          src={post.author?.avatar}
                          alt=""
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <span className="ms-2">
                          {post.author?.username || "Anon"}{" "}
                          <span className="text-muted">{post.author?.email}</span>
                          <span className="text-muted"> • {timeAgo(post.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                <Link to={`/posts/${post._id}`} className="mb-4 shadow border-0 rounded-3 h-100
                text-decoration-none text-reset">
                  {post.image && (
                    <div className="d-flex justify-content-center mb-3">
                      <img
                      variant="top"
                      src={post.image}
                      alt={post.title}
                      style={{
                        maxHeight: "170px",
                        objectFit: "cover",
                        borderRadius: "0.5rem",
                        display: "block"
                      }}
                    />
                    </div>
                  )}
                  <div>
                    <h6 className="fw-semibold">
                      🎬 {post.title}
                    </h6>
                    <p className="text-muted">
                      {post.content.length > 100
                        ? post.content.substring(0, 100) + "..."
                        : post.content}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span onClick={(e) => e.preventDefault()}>
                        <LikeButton post={post} />
                      </span>
                      <span onClick={(e) => e.preventDefault()}>
                        <BookmarkButton
                        postId={post._id}
                        isBookmarked={isBookmarked}
                        onToggle={(newStatus) =>
                          handleToggleBookmark(post._id, newStatus)
                        }
                      />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
};

export default Bookmarks;


