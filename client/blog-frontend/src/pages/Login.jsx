// src/pages/LoginPage.jsx
import { useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useAuthContext } from "../AuthContext";
import { Film, LogIn } from "lucide-react"; // icons

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { identifier, password });
      login(res.data.token, res.data.user); // save to context + localStorage
      toast.success("Welcome back to the show 🎬");
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err.response?.data);

    // Extract message safely for Hapi-style + custom backend messages
    const backendMsg =
    err.response?.data?.message ||  // Hapi validation
    err.response?.data?.error ||    // custom backend
    err.message;                    // fallback

    toast.error(backendMsg || "Login failed. Please try again.");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 dark:bg-dark text-dark dark:text-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="text-center mb-4">
          <Film size={40} className="text-primary" />
          <h2 className="fw-bold mt-2">Login</h2>
          <p className="text-muted">Step into the movieverse 🍿</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              className="form-control"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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

          <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center" disabled={loading}>
            <LogIn className="me-2" size={18} /> {loading? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-3 text-center">
          Don’t have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
