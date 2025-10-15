import { useEffect, useState } from "react";
import API from "../api"; 
import { toast } from "react-toastify";
import { useNavigate, Link, useParams, Navigate } from "react-router-dom";
import { TopRated } from "../components/TopRated";
import Bio from "../components/Bio";
import { Film, Loader } from "lucide-react";
import timeAgo from "../timeAgo";
import { useAuthContext } from "../AuthContext";

function Profile() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const {user} = useAuthContext();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/users/${id}`);
        setProfile(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // 👈 scrolls to top
      } catch (err) {
        console.error(err);
      }
    };
    if (id) fetchProfile();
  }, [id]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get(`posts/users/${id}`);
        setPosts(res.data.posts || res.data);
      } catch (err) {
        toast.error("Failed to fetch user’s posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [id]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Loader className="spin text-accent" size={40} />
      </div>
    );

  // If the logged-in user tries to view their own profile, redirect
  if (user && user.id === id) {
    return <Navigate to="/myprofile" replace />;
  }

  return (
    <>

    <button 
  onClick={() => navigate(-1)} 
  className="d-lg-none btn btn-sm btn-outline-primary"
>
  🎥 Back
</button>

    <div className="container mt-4">

      <Bio />

      <div className="row">
        <div className="col-md-7 order-2 order-md-1">
          <h2 className="mb-4 d-flex align-items-center text-capitalize">
              <Film className="me-2 text-accent" /> posted by {profile?.username}
            </h2>

      {posts.length === 0 ? (
        <p className="text-muted">🎞️ No movies (posts) added to this reel yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="mb-3 shadow-sm border-0">
            <Link to="/myprofile" className="text-decoration-none text-reset">
                  <div className="d-flex my-3">
                      <div>
                        <img
                          src={profile?.avatar}
                          alt=""
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <span className="ms-2">
                          {profile?.username || "Anon"}{" "}
                          <span className="text-muted">{profile?.email}</span>
                          <span className="text-muted"> • {timeAgo(post.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
            <Link to={`/posts/${post._id}`} className="text-decoration-none text-reset" >
            <h3 className="fw-bold text-capitalize">{post.title}</h3>
            <p style={{ wordBreak: "break-word" }}>{post.content.substring(0, 150)}...</p>
            <div className="d-flex justify-content-center">
            {post.image && (
              <img
                variant="top"
                src={post.image}
                alt={post.title}
                style={{ maxHeight: "300px", maxWidth: "300px", objectFit: "cover" }}
              />
            )}
            </div>
            <small className="text-muted d-block mb-2">
                {new Date(post.createdAt).toLocaleDateString()}
            </small>
              </Link>
          </div>
        ))
      )}
      </div>

      <div className="col-md-4 order-1 order-md-2">
        <TopRated userId={id} username={profile?.username} />
      </div>
      
    </div>
    </div>
    </>
  );
}

export default Profile;