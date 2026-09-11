import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isDashboard = location.pathname === "/dashboard";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {!isDashboard && (
          <button
            className="navbar-back"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        )}

        <button
          className="navbar-brand"
          onClick={() => navigate("/dashboard")}
        >
          <span className="brand-mark">EV</span>
          <span>Smart EV</span>
        </button>
      </div>

      <div className="navbar-right">
        <span className="navbar-user">
          {user?.name || user?.email || "Admin"}
        </span>

        <button
          className="navbar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}