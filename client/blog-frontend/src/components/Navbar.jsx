import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthContext } from "../AuthContext";

function Navbar({ theme, setTheme }) {
  
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black border-bottom border-secondary sticky-top shadow-sm">
      <div className="container">
        {/* Brand with movie icon */}
        <Link className="navbar-brand fw-bold text-light d-flex align-items-center" to="/home">
          <i className="fa-solid fa-film me-2 text-danger"></i> MovieX
        </Link>

        <button className={`navbar-toggler ${isOpen ? "open" : ""}`} type="button" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation">
          <span className="toggler-icon"></span>
          <span className="toggler-icon"></span>
          <span className="toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navCollapse">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <Link className="nav-link" to="/home" onClick={() => setIsOpen(false)}>
                <i className="fa-solid fa-house me-1"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/create" onClick={() => setIsOpen(false)}>
                <i className="fa-solid fa-pen-to-square me-1"></i> Create
              </Link>
            </li>
            <li className="nav-item d-lg-none">
              <Link className="nav-link" to="/trending" onClick={() => setIsOpen(false)}>
                <i className="fa-solid fa-fire me-1"></i> Trending
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/bookmarks" onClick={() => setIsOpen(false)}>
                <i className="fa-solid fa-bookmark me-1"></i> Bookmarks
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/myprofile" onClick={() => setIsOpen(false)}>
                <i className="fa-solid fa-user me-1"></i> Profile
              </Link>
            </li>

            {user?.role === "admin" && (
              <li className="nav-item">
                <Link className="nav-link text-warning" to="/admin" onClick={() => setIsOpen(false)}>
                  <i className="fa-solid fa-shield-halved me-1"></i> Admin
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link text-danger" to="/login" onClick={() => setIsOpen(false)}>
                <i className="fa-solid fa-right-from-bracket me-1"></i> Logout
              </Link>
            </li>

            {/* Theme toggle */}
            <li className="nav-item">
              <button
                className="btn btn-sm btn-outline-light rounded-circle ms-2"
                onClick={() =>
                  setTheme((prev) => (prev === "light" ? "dark" : "light"))
                }
                aria-label="Toggle theme"
              >
                <i
                  className={
                    theme === "light"
                      ? "fa-solid fa-moon"
                      : "fa-solid fa-sun text-warning"
                  }
                />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
