import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import Button from "react-bootstrap/Button";
import { useNavigate, Link } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader";
import { TopRated } from "../components/TopRated";
import { useAuthContext } from "../AuthContext";
import { Trash2, Edit, Film, Loader } from "lucide-react";
import timeAgo from "../timeAgo";

function MyProfile() {
  const { user } = useAuthContext();
  const id = user?.id;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/me");
        setProfile(res.data);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // 👈 scrolls to top
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await API.get("/posts/mine");
        setPosts(res.data.posts || res.data);
      } catch (err) {
        toast.error("Couldn’t fetch your posts 🎬");
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await API.delete(`/posts/${id}`);
      toast.success("Post deleted 🗑️");
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleEdit = (id) => {
    navigate(`/posts/edit/${id}`);
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Loader className="spin text-accent" size={40} />
      </div>
    );

  return (
    <>
    <button 
      onClick={() => navigate(-1)} 
      className="d-lg-none btn btn-sm btn-outline-primary"
    >
      🎥 Back
    </button>

    <div className="container mt-4">
      <ProfileHeader
        profile={profile}
        isOwner={true}
        onUpdate={(updated) => setProfile(updated)}
      />

      <div className="row">
      <div className="col-md-7 order-2 order-md-1">

      <h2 className="mb-4 d-flex align-items-center">
        <Film className="me-2 text-accent" /> My Posts
      </h2>

      {posts.length === 0 ? (
        <p className="text-muted">You haven’t written any posts yet 🎥</p>
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
            <p>
              {post.content.length > 150
                ? `${post.content.substring(0, post.content.lastIndexOf(" ", 150))}...`
                : post.content}
            </p>

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
              
              <div className="d-flex gap-2 mt-3 mb-5">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleEdit(post._id)}
                  className="d-flex align-items-center"
                >
                  <Edit size={16} className="me-1" /> Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(post._id)}
                  className="d-flex align-items-center"
                >
                  <Trash2 size={16} className="me-1" /> Delete
                </Button>
              </div>
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

export default MyProfile;