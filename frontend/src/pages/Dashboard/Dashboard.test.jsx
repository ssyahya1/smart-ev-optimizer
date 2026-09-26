import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Dashboard from "./DashboardOverview";

const logoutMock = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Operator One", role: "user" },
    logout: logoutMock,
  }),
}));

vi.mock("../../services/api", () => ({
  apiRequest: vi.fn().mockResolvedValue([]),
}));

describe("Dashboard", () => {
  test("renders the operational overview and everyday navigation", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /good day, operator/i }))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: /new charging session/i }))
      .toHaveAttribute("href", "/sessions");
    expect(screen.getByText("Charging right now")).toBeInTheDocument();
    expect(screen.getByText("Your charging site")).toBeInTheDocument();
  });
});