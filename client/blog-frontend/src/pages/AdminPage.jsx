import { useEffect, useState } from "react";
import API from "../api";
import { useAuthContext } from "../AuthContext";
import { Table, Button, Form, InputGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { FaUser, FaEnvelope, FaCrown, FaCalendarAlt, FaTrashAlt, FaSearch } from "react-icons/fa";

const AdminPage = () => {
  const { user } = useAuthContext();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async (query = "") => {
    if (!loading) setFetching(true);
    try {
      const res = await API.get("/admin/users", {
        params: { search: query },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔍 Dynamic Search with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(search);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await API.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success("User deleted");
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
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
    <div className="p-4">

      {user?.role !== "admin" ? (
        <h2 className="text-center text-danger">🚫 Access Denied</h2>
      ) : (
        <div>
          <h2 className="fw-bold mb-4">🎞️ All Users</h2>

          {/* 🔍 Search */}
          <InputGroup className="mb-3">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          {fetching && (
            <div className="position-absolute  start-0 w-100 h-100 d-flex justify-content-center align-items-top bg-opacity-75 fetcher" style={{ zIndex: 10 }}>
              <div className="text-center">
                <Loader className="spin text-accent mb-2" size={30} />
                <p className="text-muted small mb-0">Fetching users...</p>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="table-responsive rounded shadow-sm">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th><FaUser className="me-1" /> Username</th>
                  <th><FaEnvelope className="me-1" /> Email</th>
                  <th><FaCrown className="me-1" /> Role</th>
                  <th><FaCalendarAlt className="me-1" /> Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">No users found</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => deleteUser(u._id)}
                        >
                          <FaTrashAlt className="me-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default AdminPage;
