import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const homePath = isAdmin ? "/admin" : "/dashboard";

  const normalLinks = [
    { to: "/dashboard", label: "Overview", end: true },
    { to: "/vehicles", label: "Vehicles" },
    { to: "/charging-plan", label: "Charging plan" },
    { to: "/bays", label: "Charging bays" },
    { to: "/sessions", label: "Charging sessions" },
  ];

  const adminLinks = [
    { to: "/admin", label: "Admin dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/vehicles", label: "Vehicles" },
    { to: "/admin/charging-sessions", label: "Sessions" },
    { to: "/admin/charging-bays", label: "Bays" },
    { to: "/admin/grid-slots", label: "Grid slots" },
  ];

  const visibleLinks = isAdmin ? adminLinks : normalLinks;

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
          onClick={() => navigate(homePath)}
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
        onClick={() => navigate(homePath)}
        aria-label="Smart EV overview"
      >
        <span className="app-brand-mark">E</span>
        <span>Smart EV</span>
      </button>

      <nav className="app-nav" id="app-navigation" aria-label="Main navigation">
        {!isAdmin && (
          <>
            <span className="app-nav-label">FLEET</span>
            {normalLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "app-nav-link active" : "app-nav-link")}
              >
                {link.label}
              </NavLink>
            ))}
            <span className="app-nav-label app-nav-label-spaced">ENERGY</span>
            <NavLink to="/grid" onClick={closeMenu} className={({ isActive }) => (isActive ? "app-nav-link active" : "app-nav-link")}>Grid availability</NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <span className="app-nav-label">ADMIN</span>
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) => (isActive ? "app-nav-link active" : "app-nav-link")}
              >
                {link.label}
              </NavLink>
            ))}
          </>
        )}
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