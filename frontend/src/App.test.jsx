import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import App from "./App";

vi.mock("./routes/ProtectedRoute", () => ({
  default: ({ children }) => children,
}));

vi.mock("./components/Layout", async () => {
  const { Outlet } = await import("react-router-dom");
  return { default: () => <Outlet /> };
});

vi.mock("./pages/Dashboard/DashboardOverview", () => ({
  default: () => <h1>Fleet overview</h1>,
}));

vi.mock("./pages/Optimization/Assignment", () => ({
  default: () => <h1>Find the best charging bay</h1>,
}));

afterEach(() => {
  cleanup();
});

describe("application routes", () => {
  test.each([
    "/scheduling",
    "/power",
    "/routing",
    "/journey",
    "/resource-allocation",
    "/benchmarks",
  ])("redirects the implementation-only route %s", async (path) => {
    window.history.replaceState({}, "", path);
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Fleet overview" }))
      .toBeInTheDocument();
    expect(window.location.pathname).toBe("/dashboard");
  });

  test("forwards the legacy assignment URL to the charging plan workflow", async () => {
    window.history.replaceState({}, "", "/assignment");
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Find the best charging bay" }))
      .toBeInTheDocument();
    expect(window.location.pathname).toBe("/charging-plan");
  });
});