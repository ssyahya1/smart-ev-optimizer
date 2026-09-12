import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../../services/api";
import "./Login.css";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      navigate("/login", {
        state: { message: "Account created. Sign in to enter the optimizer." },
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page register-page">
      <div className="login-background">
        <div className="login-glow login-glow-one"></div>
        <div className="login-glow login-glow-two"></div>
      </div>

      <nav className="login-navbar">
        <Link to="/" className="login-brand">
          <span className="login-brand-mark">+</span>
          <span>SMART EV</span>
        </Link>

        <Link to="/login" className="back-link">
          ← Back to Login
        </Link>
      </nav>

      <section className="login-container">
        <div className="login-intro">
          <span className="login-label">NEW OPERATOR</span>
          <h1>
            Build your
            <br />
            <span>command.</span>
          </h1>
          <p>
            Create an operator account to manage fleet charging, optimization,
            and grid operations from one system.
          </p>
        </div>

        <div className="login-card">
          <div className="card-top">
            <span>CREATE ACCOUNT</span>
            <span className="secure-indicator">● SECURE</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">FULL NAME</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Alex Morgan"
                value={formData.name}
                onChange={handleChange}
                minLength="2"
                maxLength="100"
                required
              />
            </div>

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
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="8"
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

            <div className="form-group">
              <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength="8"
                required
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              {!loading && <span>↗</span>}
            </button>
          </form>

          <div className="login-footer">
            <span>ROLE: OPERATOR</span>
            <Link to="/login" className="auth-switch-link">SIGN IN</Link>
          </div>
        </div>
      </section>

      <div className="login-index">
        <span>SMART EV</span>
        <span>01 / REGISTER</span>
      </div>
    </main>
  );
}

export default Register;
