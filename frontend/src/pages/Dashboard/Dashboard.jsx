
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const displayName =
    user?.name ||
    user?.full_name ||
    user?.email ||
    "Operator";

  return (
    <main className="dashboard-page">
      {/* Mobile menu button */}
      <button
        type="button"
        className={`dashboard-mobile-toggle ${
          mobileMenuOpen ? "active" : ""
        }`}
        onClick={() =>
          setMobileMenuOpen((current) => !current)
        }
        aria-label="Toggle navigation"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="dashboard-mobile-overlay"
          onClick={closeMenu}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${
          mobileMenuOpen ? "mobile-open" : ""
        }`}
      >
        <div className="dashboard-brand">
          <Link
            to="/dashboard"
            className="dashboard-brand-link"
            onClick={closeMenu}
          >
            <span className="dashboard-brand-mark">
              EV
            </span>

            <div>
              <strong>SMART EV</strong>
              <span>FLEET OPTIMIZER</span>
            </div>
          </Link>
        </div>

        <nav className="dashboard-nav">
          {/* Core */}
          <span className="dashboard-nav-label">
            CONTROL CENTER
          </span>

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              01
            </span>
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/vehicles"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              02
            </span>
            <span>Vehicles</span>
          </NavLink>

          <NavLink
            to="/bays"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              03
            </span>
            <span>Charging Bays</span>
          </NavLink>

          <NavLink
            to="/grid"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              04
            </span>
            <span>Grid Slots</span>
          </NavLink>

          <NavLink
            to="/sessions"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              05
            </span>
            <span>Charging Sessions</span>
          </NavLink>

          {/* Optimization */}
          <span className="dashboard-nav-label optimization-label">
            OPTIMIZATION ENGINE
          </span>

          <NavLink
            to="/assignment"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              A
            </span>
            <span>
              Bay Assignment
              <small>Greedy / Priority Queue</small>
            </span>
          </NavLink>

          <NavLink
            to="/scheduling"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              B
            </span>
            <span>
              Charge Scheduling
              <small>Greedy / Dynamic Programming</small>
            </span>
          </NavLink>

          <NavLink
            to="/power"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              C
            </span>
            <span>
              Power Allocation
              <small>Max-Heap / Round-Robin</small>
            </span>
          </NavLink>

          <NavLink
            to="/routing"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              D
            </span>
            <span>
              Fleet Routing
              <small>BFS / Dijkstra</small>
            </span>
          </NavLink>

          <NavLink
            to="/journey"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              E
            </span>
            <span>
              Multi-Stage Journey
              <small>A* / Bellman-Ford</small>
            </span>
          </NavLink>

          <NavLink
            to="/resource-allocation"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              F
            </span>
            <span>
              Resource Allocation
              <small>Max Flow / Greedy</small>
            </span>
          </NavLink>

          {/* Analysis */}
          <span className="dashboard-nav-label">
            ANALYSIS
          </span>

          <NavLink
            to="/benchmarks"
            className={({ isActive }) =>
              `dashboard-nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeMenu}
          >
            <span className="dashboard-nav-number">
              07
            </span>
            <span>
              Benchmarks
              <small>Performance Comparison</small>
            </span>
          </NavLink>
        </nav>

        {/* User section */}
        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-user">
            <div className="dashboard-user-avatar">
              {String(displayName)
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="dashboard-user-info">
              <strong>{displayName}</strong>
              <span>
                {user?.role || "Operator"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
          >
            <span>↗</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <span className="dashboard-eyebrow">
              SMART GRID / EV OPERATIONS
            </span>

            <h1>
              Control <span>center.</span>
            </h1>

            <p>
              Optimize fleet charging, grid capacity
              and route operations from one intelligent
              control layer.
            </p>
          </div>

          <div className="dashboard-status">
            <span className="status-dot" />
            SYSTEM OPERATIONAL
          </div>
        </header>

        {/* Overview metrics */}
        <section className="dashboard-metrics">
          <article className="dashboard-metric-card">
            <span>ACTIVE VEHICLES</span>
            <strong>—</strong>
            <small>Live fleet state</small>
          </article>

          <article className="dashboard-metric-card">
            <span>CHARGING BAYS</span>
            <strong>—</strong>
            <small>Current utilization</small>
          </article>

          <article className="dashboard-metric-card">
            <span>GRID CAPACITY</span>
            <strong>—</strong>
            <small>Available transformer power</small>
          </article>

          <article className="dashboard-metric-card">
            <span>OPTIMIZATION</span>
            <strong>6</strong>
            <small>Algorithm modules</small>
          </article>
        </section>

        {/* Optimization overview */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-label">
                01 — OPTIMIZATION ENGINE
              </span>

              <h2>
                Six algorithmic systems.
              </h2>

              <p>
                Each optimization problem compares
                two algorithmic approaches and exposes
                measurable execution behavior.
              </p>
            </div>

            <span className="dashboard-section-count">
              06 SYSTEMS
            </span>
          </div>

          <div className="optimization-grid">
            <Link
              to="/assignment"
              className="optimization-card"
            >
              <div className="optimization-card-top">
                <span>A</span>
                <span>01</span>
              </div>

              <h3>Bay Assignment</h3>

              <p>
                Assign EVs to compatible charging bays
                based on charging requirements and
                priority.
              </p>

              <div className="algorithm-pair">
                <span>Greedy</span>
                <span>Priority Queue</span>
              </div>

              <span className="optimization-arrow">
                ↗
              </span>
            </Link>

            <Link
              to="/scheduling"
              className="optimization-card"
            >
              <div className="optimization-card-top">
                <span>B</span>
                <span>02</span>
              </div>

              <h3>Charge Scheduling</h3>

              <p>
                Select charging sessions while respecting
                intervals, deadlines and fleet priorities.
              </p>

              <div className="algorithm-pair">
                <span>Greedy Interval</span>
                <span>Dynamic Programming</span>
              </div>

              <span className="optimization-arrow">
                ↗
              </span>
            </Link>

            <Link
              to="/power"
              className="optimization-card"
            >
              <div className="optimization-card-top">
                <span>C</span>
                <span>03</span>
              </div>

              <h3>Power Allocation</h3>

              <p>
                Resolve transformer contention by
                prioritizing critical vehicles or fairly
                distributing available power.
              </p>

              <div className="algorithm-pair">
                <span>Max-Heap</span>
                <span>Round-Robin</span>
              </div>

              <span className="optimization-arrow">
                ↗
              </span>
            </Link>

            <Link
              to="/routing"
              className="optimization-card"
            >
              <div className="optimization-card-top">
                <span>D</span>
                <span>04</span>
              </div>

              <h3>Fleet Routing</h3>

              <p>
                Find efficient paths across the physical
                charging and depot network.
              </p>

              <div className="algorithm-pair">
                <span>BFS</span>
                <span>Dijkstra</span>
              </div>

              <span className="optimization-arrow">
                ↗
              </span>
            </Link>

            <Link
              to="/journey"
              className="optimization-card"
            >
              <div className="optimization-card-top">
                <span>E</span>
                <span>05</span>
              </div>

              <h3>Multi-Stage Journey</h3>

              <p>
                Optimize journeys across multiple stages,
                destinations and weighted network conditions.
              </p>

              <div className="algorithm-pair">
                <span>A*</span>
                <span>Bellman-Ford</span>
              </div>

              <span className="optimization-arrow">
                ↗
              </span>
            </Link>

            <Link
              to="/resource-allocation"
              className="optimization-card"
            >
              <div className="optimization-card-top">
                <span>F</span>
                <span>06</span>
              </div>

              <h3>Resource Allocation</h3>

              <p>
                Allocate constrained charging resources
                across vehicles, bays and grid capacity.
              </p>

              <div className="algorithm-pair">
                <span>Ford-Fulkerson</span>
                <span>Greedy Bottleneck</span>
              </div>

              <span className="optimization-arrow">
                ↗
              </span>
            </Link>
          </div>
        </section>

        {/* Benchmark section */}
        <section className="dashboard-benchmark">
          <div>
            <span className="dashboard-section-label">
              02 — PERFORMANCE ANALYSIS
            </span>

            <h2>
              Benchmark every algorithm.
            </h2>

            <p>
              Compare execution time, operations,
              memory usage, delay or cost, and conflicts
              resolved across increasing dataset sizes.
            </p>

            <Link
              to="/benchmarks"
              className="dashboard-primary-button"
            >
              OPEN BENCHMARKS
              <span>↗</span>
            </Link>
          </div>

          <div className="benchmark-datasets">
            <div>
              <span>SMALL</span>
              <strong>20</strong>
              <small>vehicles</small>
            </div>

            <div>
              <span>MEDIUM</span>
              <strong>100</strong>
              <small>vehicles</small>
            </div>

            <div>
              <span>LARGE</span>
              <strong>500</strong>
              <small>vehicles</small>
            </div>

            <div>
              <span>VERY LARGE</span>
              <strong>1000</strong>
              <small>vehicles</small>
            </div>
          </div>
        </section>

        {/* System architecture */}
        <section className="dashboard-system">
          <div>
            <span className="dashboard-section-label">
              03 — SYSTEM ARCHITECTURE
            </span>

            <h2>
              One control layer.
              <br />
              Multiple optimization engines.
            </h2>
          </div>

          <div className="system-flow">
            <div className="system-node">
              <span>01</span>
              <strong>EV FLEET</strong>
              <small>
                Vehicles / SoC / priorities
              </small>
            </div>

            <div className="system-line">
              →
            </div>

            <div className="system-node">
              <span>02</span>
              <strong>OPTIMIZER</strong>
              <small>
                Six algorithmic systems
              </small>
            </div>

            <div className="system-line">
              →
            </div>

            <div className="system-node">
              <span>03</span>
              <strong>GRID</strong>
              <small>
                Capacity / pricing / slots
              </small>
            </div>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>
            SMART EV FLEET CHARGING & GRID OPERATIONS
            OPTIMIZER
          </span>

          <span>
            DAA PROJECT / CONTROL CENTER
          </span>
        </footer>
      </section>
    </main>
  );
}

export default Dashboard;
