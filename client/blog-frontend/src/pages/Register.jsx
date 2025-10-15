// src/pages/RegisterPage.jsx
import { useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import { UserPlus, Film } from "lucide-react"; // icons

const RegisterPage = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!username || !email || !password) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const res = await API.post("/auth/register", {
        username,
        email,
        password,
      });

      login(res.data.token, res.data.user); // auto login after register
      toast.success("Your account is live 🎬✨");
      setTimeout(() => navigate("/home"), 100);
    } catch (err) {
      console.error("Registration error:", err.response?.data);

    // Extract message safely for Hapi-style + custom backend messages
    const backendMsg =
    err.response?.data?.message ||  // Hapi validation
    err.response?.data?.error ||    // custom backend
    err.message;                    // fallback

    toast.error(backendMsg || "Registration failed. Please try again.");
      }
      finally {
        setLoading(false);
      }
    };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 dark:bg-dark text-dark dark:text-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="text-center mb-4">
          <Film size={40} className="text-success" />
          <h2 className="fw-bold mt-2">Register</h2>
          <p className="text-muted">Join the movieverse 🍿</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-success w-100 d-flex align-items-center justify-content-center" disabled={loading}>
            <UserPlus className="me-2" size={18} /> {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-3 text-center">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;