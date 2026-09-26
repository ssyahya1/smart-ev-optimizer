import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate("/login");
  };

  return (
    <>
      <header className="app-mobile-header">
        <button
          className="app-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="app-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <button
          className="app-mobile-brand"
          onClick={() => navigate("/dashboard")}
          aria-label="Smart EV overview"
        >
          <span className="app-brand-mark">E</span>
          <span>Smart EV</span>
        </button>
        <span className="app-mobile-avatar" aria-label={user?.name || user?.email || "Account"}>
          {String(user?.name || user?.email || "U").charAt(0).toUpperCase()}
        </span>
      </header>

      {menuOpen && (
        <button
          className="app-nav-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
      )}

      <aside className={`app-sidebar${menuOpen ? " mobile-open" : ""}`}>
      <button
        className="app-brand"
        onClick={() => navigate("/dashboard")}
        aria-label="Smart EV overview"
      >
        <span className="app-brand-mark">E</span>
        <span>Smart EV</span>
      </button>

      <nav className="app-nav" id="app-navigation" aria-label="Main navigation">
        <span className="app-nav-label">FLEET</span>
        <NavLink to="/dashboard" end onClick={closeMenu} className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Overview</NavLink>
        <NavLink to="/vehicles" onClick={closeMenu} className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Vehicles</NavLink>
        <NavLink to="/charging-plan" onClick={closeMenu} className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Charging plan</NavLink>
        <NavLink to="/bays" onClick={closeMenu} className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Charging bays</NavLink>
        <NavLink to="/sessions" onClick={closeMenu} className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Charging sessions</NavLink>
        <span className="app-nav-label app-nav-label-spaced">ENERGY</span>
        <NavLink to="/grid" onClick={closeMenu} className={({ isActive }) => isActive ? "app-nav-link active" : "app-nav-link"}>Grid availability</NavLink>
      </nav>

      <div className="app-sidebar-footer">
        <div className="app-user">
          <span className="app-user-avatar" aria-hidden="true">
            {String(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </span>
          <span className="app-user-name">{user?.name || user?.email || "Account"}</span>
        </div>
        <button className="app-logout" onClick={handleLogout}>Sign out</button>
      </div>
      </aside>
    </>
  );
}