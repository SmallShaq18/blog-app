import React from "react";
import { useState } from "react";
import { useAuthContext } from "../AuthContext";
import { Container } from "react-bootstrap";

const ProfileHeader = ({ profile, isOwner, onUpdate }) => {
  const { user } = useAuthContext();
  const DEFAULT_AVATAR = "https://res.cloudinary.com/dlu8ltbx1/image/upload/v1758373732/default_avatar_ngs4rn.jpg";
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarFile, setAvatarFile] = useState(null);

  if (!profile) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("bio", bio);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      onUpdate(updated); // update parent
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };



  return (
    <Container className="my-4 text-center">
      <h2 className="fw-bold">
        Welcome, {user?.username || "Guest"} 👋
      </h2>
      <p className="text-muted">
        Manage your posts and profile settings here.
      </p>

      <div className=" p-3">
      <img
        src={
          profile.avatar
            ? profile.avatar
            : DEFAULT_AVATAR
        }
        alt={profile.username}
        style={{ width: "100px", height: "100px", borderRadius: "50%", border: "3px solid #fd8d0dff", objectFit: "cover" }}
      />
      <h2 className="mt-2">{profile.username}</h2>

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-3">
          <textarea
            className="form-control mb-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write your bio..."
          />
          <input
            type="file"
            accept="image/*"
            className="form-control mb-2"
            onChange={(e) => setAvatarFile(e.target.files[0])}
          />
          <button type="submit" className="btn btn-primary me-2">
            Save
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <p className="mt-2">{profile.bio || "No bio yet."}</p>
          {isOwner && (
            <button className="btn btn-outline-primary" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
        </>
      )}
    </div>
    </Container>
  );
};

export default ProfileHeader;
