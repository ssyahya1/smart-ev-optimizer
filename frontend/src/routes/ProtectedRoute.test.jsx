import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

const authState = {
  isAuthenticated: false,
  loading: false,
  user: null,
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => authState,
}));

const renderProtected = () => render(
  <MemoryRouter initialEntries={["/private"]}>
    <Routes>
      <Route
        path="/private"
        element={(
          <ProtectedRoute>
            <div>Private content</div>
          </ProtectedRoute>
        )}
      />
      <Route path="/login" element={<div>Login page</div>} />
    </Routes>
  </MemoryRouter>
);

describe("ProtectedRoute", () => {
  test("shows loading while authentication is being checked", () => {
    authState.loading = true;
    authState.isAuthenticated = false;

    renderProtected();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("redirects unauthenticated users to login", () => {
    authState.loading = false;
    authState.isAuthenticated = false;

    renderProtected();

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  test("renders protected content for authenticated users", () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    authState.user = { role: "user" };

    renderProtected();

    expect(screen.getByText("Private content")).toBeInTheDocument();
  });

  test("blocks an authenticated user with an incorrect role from an admin route", () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    authState.user = { role: "user" };

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={(
              <ProtectedRoute requiredRole="admin">
                <div>Admin content</div>
              </ProtectedRoute>
            )}
          />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});