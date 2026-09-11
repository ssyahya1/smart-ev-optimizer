import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Dashboard from "./Dashboard";

const logoutMock = vi.fn();

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Operator One", role: "user" },
    logout: logoutMock,
  }),
}));

describe("Dashboard", () => {
  test("renders the dashboard navigation and important overview values", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /control center/i }))
      .toBeInTheDocument();
    expect(screen.getByText("Operator One")).toBeInTheDocument();
    expect(screen.getByText("SYSTEM OPERATIONAL")).toBeInTheDocument();
    expect(screen.getByText("Six algorithmic systems.")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });
});