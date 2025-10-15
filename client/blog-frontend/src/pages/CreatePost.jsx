import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";
import { useAuthContext } from "../AuthContext";

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      toast.error("🎬 Title and content are required!");
      return;
    }

    if (content.length < 30) {
      toast.error("📝 Post content must be at least 30 characters.");
      return;
    }

    const tagArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((t) => t !== "");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    tagArray.forEach((tag) => formData.append("tags[]", tag));
    formData.append("author", user?.username);
    if (image) {
      formData.append("image", image);
    }

    setLoading(true);
    try {
      const res = await API.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Post created!");
      navigate(`/posts/${res.data._id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

    <button 
      onClick={() => navigate(-1)} 
      className="d-lg-none btn btn-sm btn-outline-primary"
    >
      🎥 Back
    </button>

    <div className="container mt-5">
      <Card className="shadow border-0 rounded-3">
        <Card.Body>
          <h3 className="fw-bold mb-4">🎥 Draft a New Post</h3>
          <Form onSubmit={handleSubmit}>
            {/* Title */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your blockbuster title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>

            {/* Content */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Write your story..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Form.Group>

            {/* Tags */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Genres (comma separated. Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Action, Sci-Fi, Drama"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </Form.Group>

            {/* Image */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Poster (optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />

              {image && (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="mt-3"
                  style={{
                    maxWidth: "240px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  }}
                />
              )}
            </Form.Group>

            {/* Submit */}
            <Button variant="dark" type="submit" disabled={loading}>
              {loading ? "🎬 Rolling..." : "🚀 Publish Post"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
    </>
  );
};

export default CreatePost;


