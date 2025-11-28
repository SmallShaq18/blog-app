import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import {Loader } from "lucide-react";
import timeAgo from "../timeAgo";
import { Button } from "react-bootstrap";

export default function Trending() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await API.get("/posts/trending?days=7&limit=5");
        setPosts(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // 👈 scrolls to top
      } catch (err) {
        console.error("Failed to fetch trending:", err);
      }
      finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

   if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Loader className="spin text-accent" size={40} />
      </div>
    );

  return (
    <div className="mt-5">
      {/* Section header with icon */}
      <h3 className="fw-bold mb-4">
        🎬 Trending This Week
      </h3>

      <div className="">
        
        {posts.length === 0 ? (
              <div className="text-center my-5">
                <p>No posts this week. Be the first to create one!</p>
                <Link to="/create">
                  <Button variant="primary">Create Post</Button>
                </Link>
              </div>
            ) : (
              posts.map((post) => (
          <div className="border-bottom" key={post._id}>
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
            <Link to={`/posts/${post._id}`} className="text-decoration-none text-reset">
            <div className="mt-2 mb-5 border-0 h-100">
              <h5 className="fw-bold text-truncate">
                  {post.title}
                </h5>
                
                {/* Content preview */}
                      <p className="text-muted small" style={{ minHeight: "60px" }}>
                        {post.content.length > 160
                          ? post.content.substring(0, 160) + "..."
                          : post.content}
                      </p>

              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  style={{
                    margin: "0 auto",
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "80%",
                    height: "180px",
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
  );
}
