
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const successMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-background">
        <div className="login-glow login-glow-one"></div>
        <div className="login-glow login-glow-two"></div>
      </div>

      <nav className="login-navbar">
        <Link to="/" className="login-brand">
          <span className="login-brand-mark">+</span>
          <span>SMART EV</span>
        </Link>

        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </nav>

      <section className="login-container">
        <div className="login-intro">
          <span className="login-label">SECURE ACCESS</span>

          <h1>
            Enter the
            <br />
            <span>optimizer.</span>
          </h1>

          <p>
            Access fleet charging operations, algorithmic
            optimization, and real-time grid management.
          </p>
        </div>

        <div className="login-card">
          <div className="card-top">
            <span>OPERATOR LOGIN</span>
            <span className="secure-indicator">● SECURE</span>
          </div>

          <form onSubmit={handleSubmit}>
            {successMessage && (
              <div className="login-success">{successMessage}</div>
            )}

            <div className="form-group">
              <label htmlFor="email">EMAIL</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="operator@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">PASSWORD</label>

              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "AUTHENTICATING..." : "ENTER SYSTEM"}
              {!loading && <span>↗</span>}
            </button>
          </form>

          <Link to="/register" className="create-account-link">
            <span>NEW TO SMART EV?</span>
            <strong>CREATE ACCOUNT <span>↗</span></strong>
          </Link>

          <div className="login-footer">
            <span>JWT AUTHENTICATION</span>
            <span>HTTPONLY COOKIE</span>
          </div>
        </div>
      </section>

      <div className="login-index">
        <span>SMART EV</span>
        <span>01 / AUTH</span>
      </div>
    </main>
  );
}

export default Login;
