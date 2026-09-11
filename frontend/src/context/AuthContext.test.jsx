import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { apiRequest } from "../services/api";

vi.mock("../services/api", () => ({
  apiRequest: vi.fn(),
}));

function AuthProbe() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading auth</div>;
  }

  return (
    <div>
      <span>{isAuthenticated ? "authenticated" : "unauthenticated"}</span>
      <span>{user?.email || "no-user"}</span>
    </div>
  );
}

describe("AuthContext", () => {
  test("starts unauthenticated when the auth check fails", async () => {
    apiRequest.mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    expect(screen.getByText("Loading auth")).toBeInTheDocument();
    expect(await screen.findByText("unauthenticated")).toBeInTheDocument();
    expect(screen.getByText("no-user")).toBeInTheDocument();
  });

  test("hydrates the authenticated user from /api/auth/me", async () => {
    apiRequest.mockResolvedValueOnce({
      user: { id: 4, email: "operator@example.com", role: "user" },
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    expect(await screen.findByText("authenticated")).toBeInTheDocument();
    expect(screen.getByText("operator@example.com")).toBeInTheDocument();
  });

  test("exposes the existing authentication state after a successful check", async () => {
    apiRequest.mockResolvedValueOnce({
      id: 7,
      email: "persisted@example.com",
      role: "admin",
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("persisted@example.com")).toBeInTheDocument();
    });
    expect(apiRequest).toHaveBeenCalledWith("/api/auth/me");
  });
});