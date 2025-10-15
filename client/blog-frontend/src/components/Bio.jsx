import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api";

function Bio() {
  const { id } = useParams(); // user id from /profile/:id
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBio = async () => {
      try {
        const res = await API.get(`/users/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch bio:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBio();
  }, [id]);

  if (loading) return <p className="text-center mt-3">🎬 Loading profile...</p>;
  if (!user) return <p className="text-center mt-3">🚫 User not found</p>;

  return (
    <div className=" p-4 mb-4 text-center">
      <div className="d-flex flex-column align-items-center">
        <img
          src={user.avatar || "/uploads/default-avatar.png"}
          alt={user.username}
          className="rounded-circle mb-3 shadow-sm"
          style={{
            width: "110px",
            height: "110px",
            objectFit: "cover",
            border: "3px solid #fd8d0dff",
          }}
        />
        <h3 className="fw-bold mb-1">@{user.username}</h3>
        <p className="text-muted">{user.bio || "No bio added yet."}</p>
      </div>
    </div>
  );
}

export default Bio;



