import "./LandingPage.css";
function LandingPage() {
  return (
    <main className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="brand">
          <span className="brand-mark">+</span>
          <span>SMART EV</span>
        </div>

        <div className="nav-links">
          <a href="#system">System</a>
          <a href="#algorithms">Algorithms</a>
          <a href="#benchmarks">Benchmarks</a>
        </div>

        <a href="/login" className="nav-action">
          Login →
        </a>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-background">
          <div className="glow glow-one"></div>
          <div className="glow glow-two"></div>
          <div className="glow glow-three"></div>
        </div>

        <div className="hero-content">
          <div className="hero-label">
            <span className="status-dot"></span>
            INTELLIGENT EV OPERATIONS
          </div>

          <h1>
            SMART
            <br />
            EV FLEET
            <br />
            <span>OPTIMIZER</span>
          </h1>

          <p className="hero-description">
            An algorithm-driven platform for intelligent EV charging,
            fleet routing, grid operations, and resource optimization.
          </p>

          <div className="hero-actions">
            <a href="/login" className="primary-button">
              Enter Optimizer
              <span>↗</span>
            </a>

            <a href="#system" className="secondary-button">
              Explore System
            </a>
          </div>
        </div>

        {/* Floating system card */}
        <div className="hero-card">
          <div className="card-header">
            <span>LIVE SYSTEM</span>
            <span className="card-status">● ACTIVE</span>
          </div>

          <div className="card-value">01</div>

          <div className="card-title">
            Fleet Optimization
          </div>

          <div className="card-line"></div>

          <div className="card-stats">
            <div>
              <strong>500</strong>
              <span>VEHICLES</span>
            </div>

            <div>
              <strong>30</strong>
              <span>BAYS</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>CONTROL</span>
            </div>
          </div>
        </div>

        <div className="hero-index">
          <span>01</span>
          <span>/</span>
          <span>06</span>
        </div>
      </section>

      {/* Intro */}
      <section id="system" className="intro-section">
        <div className="section-label">01 — THE SYSTEM</div>

        <div className="intro-content">
          <h2>
            Turning complex EV fleet operations into
            <span> intelligent decisions.</span>
          </h2>

          <p>
            Smart EV combines algorithmic optimization with real-world
            charging constraints to help fleets make faster and more
            efficient operational decisions.
          </p>
        </div>
      </section>

      {/* Optimization systems */}
      <section id="algorithms" className="systems-section">
        <div className="section-label">02 — OPTIMIZATION ENGINE</div>

        <div className="systems-grid">
          <article className="system-card">
            <span>01</span>
            <h3>Bay Assignment</h3>
            <p>
              Assign vehicles to suitable charging bays using
              priority-aware strategies.
            </p>
          </article>

          <article className="system-card">
            <span>02</span>
            <h3>Charge Scheduling</h3>
            <p>
              Schedule charging sessions around deadlines,
              priorities, and available capacity.
            </p>
          </article>

          <article className="system-card">
            <span>03</span>
            <h3>Power Allocation</h3>
            <p>
              Resolve grid power contention while respecting
              transformer capacity.
            </p>
          </article>

          <article className="system-card">
            <span>04</span>
            <h3>Route Optimization</h3>
            <p>
              Compare shortest-path strategies for efficient
              fleet movement across the network.
            </p>
          </article>

          <article className="system-card">
            <span>05</span>
            <h3>Journey Optimization</h3>
            <p>
              Optimize multi-stage journeys using informed and
              dynamic graph algorithms.
            </p>
          </article>

          <article className="system-card">
            <span>06</span>
            <h3>Resource Allocation</h3>
            <p>
              Maximize constrained resource utilization using
              network flow optimization.
            </p>
          </article>
        </div>
      </section>

      {/* Benchmark preview */}
      <section id="benchmarks" className="benchmark-section">
        <div className="section-label">03 — PERFORMANCE</div>

        <div className="benchmark-content">
          <div>
            <h2>
              Built to
              <br />
              <span>measure.</span>
            </h2>
          </div>

          <div className="benchmark-copy">
            <p>
              Compare algorithmic approaches across increasing
              dataset sizes and evaluate execution time,
              operations, conflicts, and resource efficiency.
            </p>

            <div className="dataset-row">
              <span>20</span>
              <span>100</span>
              <span>500</span>
              <span>1000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div>
          <strong>SMART EV®</strong>
          <span>Fleet Charging & Grid Operations Optimizer</span>
        </div>

        <span>DAA PROJECT — 2026</span>
      </footer>
    </main>
  );
}

export default LandingPage;