// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuthContext();

  if (loading) return <p>Loading...</p>;
  if (!token) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
