const cloud_name = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const upload_preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; // unsigned preset name

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import API from "../api"; // axios instance

function EditPost() {
  const { id } = useParams(); // get post id from URL
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(""); // existing image URL
  const [newImage, setNewImage] = useState(null); // file to upload
  const [loading, setLoading] = useState(true);
  const [savingChanges, setSavingChanges] = useState(false);

  // fetch existing post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await API.get(`/posts/${id}`);
        const post = res.data._doc;

        setTitle(post.title);
        setContent(post.content);
        setTags(Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "");
        //setTags(post.tags?.join(", ") || "");
        setImage(post.image || "");
      } catch (err) {
        toast.error("Failed to load post");
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setImage(URL.createObjectURL(file)); // preview
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", upload_preset); // Cloudinary preset
  

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${errorText}`);
  }
    const data = await res.json();
    return data.secure_url; // Cloudinary URL
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSavingChanges(true);

    try {
      let imageUrl = image;

      // if a new file was chosen, upload it to Cloudinary
      if (newImage) {
        imageUrl = await uploadImage(newImage);
      }

      await API.put(`/posts/${id}`, {
        title,
        content,
        image: imageUrl,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((t) => t !== ""),
      });

      toast.success("Post updated!");
      navigate(-1); // go back to profile after editing
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="container mt-4">
      <h2>Edit Post</h2>
      <Form onSubmit={handleUpdate}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tags (comma separated)</Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. action, drama, thriller"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {image && (
            <img
              src={image}
              alt="Preview"
              className="mt-3"
              style={{ maxWidth: "200px", borderRadius: "8px" }}
            />
          )}
        </Form.Group>

        <Button type="submit" variant="primary" disabled={savingChanges}>
          {savingChanges ? "Saving Changes..." : "Save Changes"}
        </Button>
        <Button
          variant="secondary"
          className="ms-2"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </Form>
    </div>
  );
}

export default EditPost;
