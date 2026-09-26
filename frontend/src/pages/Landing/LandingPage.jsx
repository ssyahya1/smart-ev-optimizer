import { Link } from "react-router-dom";
import { useState } from "react";
import heroImage from "../../assets/hero.png";
import "./LandingPage.css";

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="site-page">
      <header className="site-header">
        <Link className="site-brand" to="/" aria-label="Smart EV home">
          <span className="site-brand-mark">E</span>
          <span>Smart EV</span>
        </Link>
        <button
          type="button"
          className="site-menu-toggle"
          aria-label={menuOpen ? "Close site navigation" : "Open site navigation"}
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav
          className={`site-links${menuOpen ? " is-open" : ""}`}
          id="site-navigation"
          aria-label="Site navigation"
        >
          <a href="#overview" onClick={() => setMenuOpen(false)}>Overview</a>
          <a href="#tools" onClick={() => setMenuOpen(false)}>What you can manage</a>
        </nav>
        <Link className="site-sign-in" to="/login" onClick={() => setMenuOpen(false)}>Sign in <span aria-hidden="true">→</span></Link>
      </header>
      {menuOpen && (
        <button
          className="site-nav-backdrop"
          type="button"
          aria-label="Close site navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <section className="site-hero">
        <img className="site-hero-image" src={heroImage} alt="Electric car connected to a charging station" />
        <div className="site-hero-shade" aria-hidden="true" />
        <div className="site-hero-content">
          <span className="site-kicker"><span className="site-live-dot" /> CHARGING, MADE CLEAR</span>
          <h1>Smart EV<br />Charging</h1>
          <p>One calm workspace for your vehicles, charging bays, and energy use.</p>
          <div className="site-hero-actions">
            <Link className="site-primary-action" to="/login">Open your workspace <span aria-hidden="true">→</span></Link>
            <a className="site-secondary-action" href="#overview">Explore the platform</a>
          </div>
        </div>
        <div className="site-hero-caption"><span>01</span><span>FLEET CHARGING OVERVIEW</span></div>
      </section>

      <section className="site-overview" id="overview">
        <div className="site-section-heading">
          <span className="site-kicker">BUILT FOR DAILY OPERATIONS</span>
          <h2>Know what’s happening.<br /><span>Make the next move.</span></h2>
        </div>
        <p className="site-overview-copy">See charging activity and availability at a glance, then move straight into the task that needs your attention.</p>
      </section>

      <section className="site-tools" id="tools" aria-label="Workspace sections">
        <Link to="/vehicles" className="site-tool-item">
          <span className="site-tool-number">01</span>
          <span><strong>Vehicles</strong><small>Battery levels and fleet details</small></span>
          <span className="site-tool-arrow" aria-hidden="true">→</span>
        </Link>
        <Link to="/bays" className="site-tool-item">
          <span className="site-tool-number">02</span>
          <span><strong>Charging bays</strong><small>Availability and charger capacity</small></span>
          <span className="site-tool-arrow" aria-hidden="true">→</span>
        </Link>
        <Link to="/sessions" className="site-tool-item">
          <span className="site-tool-number">03</span>
          <span><strong>Charging sessions</strong><small>Active and completed charging</small></span>
          <span className="site-tool-arrow" aria-hidden="true">→</span>
        </Link>
      </section>

      <footer className="site-footer">
        <Link className="site-brand" to="/">
          <span className="site-brand-mark">E</span>
          <span>Smart EV</span>
        </Link>
        <span>Fleet charging, clearly managed.</span>
        <Link to="/login">Sign in <span aria-hidden="true">→</span></Link>
      </footer>
    </main>
  );
}

export default LandingPage;
