import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";
import { useAuthContext } from "../AuthContext";
import LikeButton from "../components/LikeButton";
import Genre from "../components/Genre";
import Trending from "../components/Trending";
import { FaRegComment } from "react-icons/fa";
import BookmarkButton from "../components/BookmarkButton";
import { useBookmarkContext } from "../BookmarkContext";
import ShareButton from "../components/ShareButton";
import { Loader } from "lucide-react";
import timeAgo from "../timeAgo";
import useServerStatus from "../serverStatus";

const HomePage = () => {
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState("all");
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const { user } = useAuthContext();
  const { bookmarkedPosts, setBookmark } = useBookmarkContext();

  // Fetch posts
  const fetchPosts = async (query = "", tag = "all") => {
    if (!loading) setFetching(true);
    try {
      const params = {};
      if (query) params.search = query;
      if (tag && tag !== "all") params.tag = tag;

      const res = await API.get("/posts", { params });
      
      setPosts(res.data.posts || []);
      setSelected(tag);

       // Optional: Sync backend bookmark status with context
      res.data.posts.forEach(post => {
        if (post.isBookmarked !== undefined) {
          setBookmark(post._id, post.isBookmarked);
        }
      });

      } catch (err) {
        toast.error("Failed to fetch posts");
      } finally {
        setLoading(false);
        setFetching(false);
      }
    };

  useEffect(() => {
    fetchPosts("", "all");
  }, []);

  // Save scroll position before navigating away or refresh
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem("scrollPos", window.scrollY);
    };
    window.addEventListener("beforeunload", saveScroll);
    window.addEventListener("scroll", saveScroll);
    return () => {
      window.removeEventListener("beforeunload", saveScroll);
      window.removeEventListener("scroll", saveScroll);
    };
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPosts(search, selected);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchPosts(search, selected);
  };

  const handleTagSelect = (tag) => {
    fetchPosts(search, tag);
  };

  const handleToggleBookmark = (postId, newStatus) => {
  setPosts((prevPosts) =>
    prevPosts.map((p) =>
      p._id === postId ? { ...p, isBookmarked: newStatus } : p
    )
  );
  toast(newStatus ? "Post bookmarked" : "Bookmark removed");
};

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Loader className="spin text-accent" size={40} />
      </div>
    );

  return (
    <div className="container py-4">
      <div className="row">
        {/* --- Main Feed --- */}
        <div className="col-lg-7 position-relative">
          {/* 👋 Welcome */}
          <div className="mb-4 border-bottom pb-2">
            <h5>Welcome back, {user?.username}</h5>
          </div>

          {/* 🔍 Search */}
          <form onSubmit={handleSearch} className="mb-3 d-flex">
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control me-2"
            />
            <Button type="submit" variant="outline-primary">
              {loading? "Searching..." : "Search"}
            </Button>
          </form>

          {/* 🎭 Tags */}
          <Genre onSelect={handleTagSelect} selected={selected} />

          <h6 className="mt-4 fw-bold">
            {selected && selected !== "all"
              ? `Showing ${selected} posts`
              : "Showing All Posts"}
          </h6>

          {fetching && (
            <div className="position-absolute  start-0 w-100 h-100 d-flex justify-content-center align-items-top bg-opacity-75 fetcher" style={{ zIndex: 10 }}>
              <div className="text-center">
                <Loader className="spin text-accent mb-2" size={30} />
                <p className="text-muted small mb-0">Fetching posts...</p>
              </div>
            </div>
          )}


          {/* 📰 Feed-style posts */}
          <div className="feed">
            {posts.length === 0 ? (
              <div className="text-center my-5">
                <p>No posts yet. Be the first to create one!</p>
                <Link to="/create">
                  <Button variant="primary">Create Post</Button>
                </Link>
              </div>
            ) : (
              posts.map((post) => {
                //const isBookmarked = bookmarkedPosts[post._id] || false;
                //const isBookmarked = post.isBookmarked ?? bookmarkedPosts[post._id] ?? false;

                return (
                  <div key={post._id} className="mb-4 border-x">
                  <Link to={`/profile/${post.author?._id}`} className="text-decoration-none text-reset">
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
                          {post.author?.username || "Anon"}{" "}
                          <span className="text-muted">{post.author?.email}</span>
                          <span className="text-muted"> • {timeAgo(post.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Post Card */}
                  <Link
                    to={`/posts/${post._id}`}
                    key={post._id}
                    className="text-decoration-none text-reset"
                    style={{ display: "block" }}
                  >
                    
                    <div className="p-3 border-bottom post-card-hover">

                      {/* Title + Tag */}
                      <div className="d-flex justify-content-between">
                        <h5 className="fw-bold">{post.title}</h5>
                      </div>

                      {/* Content preview */}
                      <p className="mt-2" style={{ wordBreak: "break-word" }}>
                        {post.content.length > 160
                          ? post.content.substring(0, 160) + "..."
                          : post.content}
                      </p>

                      {/* Image */}
                      {post.image && (
                        <div className="d-flex justify-content-center mb-3">
                          <img
                            src={post.image}
                            alt={post.title}
                            style={{
                              height: "250px",
                              objectFit: "cover",
                              borderRadius: "0.5rem",
                              maxWidth: "100%",
                              display: "block",
                            }}
                          />
                        </div>
                      )}

                      {/* Actions: comments / like / bookmark */}
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <span>
                          <FaRegComment className="me-1" />{" "}
                          {post.comments?.length || 0}
                        </span>
                        <span onClick={(e) => e.preventDefault()}>
                          <LikeButton post={post} />
                        </span>
                        
                       <span onClick={(e) => e.preventDefault()}>
                         {user && (
                          <BookmarkButton
                        postId={post._id}
                        isBookmarked={post.isBookmarked}
                        onToggle={(newStatus) =>
                          handleToggleBookmark(post._id, newStatus)
                        }
                      />
                        )}
        
                       </span>
                        <span>
                          <ShareButton post={post} />
                        </span>
                      </div>
                    </div>
                  </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="col-lg-1 d-none d-lg-block"></div>

        {/* --- Sidebar Trending (desktop only) --- */}
        <div className="col-lg-4 d-none d-lg-block">
          <div style={{ position: "sticky", top: "1rem" }}>
            <Trending />
          </div>
        </div>
      </div>
    </div>
  );
};


const Home = () => {

  const serverUp = useServerStatus();

  return (
    <div className="container-fluid app-body">
      {!serverUp && (
      <div className="alert alert-danger server-unreachable">
        ⚠️ Server issues. Some features may not work properly.
      </div>
    )}
      <HomePage />
      {/*<ToastContainer position="top-right" autoClose={2000} hideProgressBar />*/}
    </div>
  );
}

export default Home;


