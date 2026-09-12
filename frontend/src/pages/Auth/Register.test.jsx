import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Register from "./Register";
import { apiRequest } from "../../services/api";

const navigateMock = vi.fn();

vi.mock("../../services/api", () => ({
  apiRequest: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const renderRegister = () => render(
  <MemoryRouter>
    <Register />
  </MemoryRouter>
);

describe("Register", () => {
  test("renders the account creation form", () => {
    renderRegister();

    expect(screen.getByRole("heading", { name: /build yourcommand/i }))
      .toBeInTheDocument();
    expect(screen.getByLabelText("FULL NAME")).toBeInTheDocument();
    expect(screen.getByLabelText("EMAIL")).toBeInTheDocument();
    expect(screen.getByLabelText("PASSWORD")).toBeInTheDocument();
    expect(screen.getByLabelText("CONFIRM PASSWORD")).toBeInTheDocument();
  });

  test("rejects mismatched passwords without calling the API", async () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText("FULL NAME"), {
      target: { value: "Alex Morgan" },
    });
    fireEvent.change(screen.getByLabelText("EMAIL"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("PASSWORD"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("CONFIRM PASSWORD"), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  test("creates an account and returns to login", async () => {
    apiRequest.mockResolvedValueOnce({ message: "User created successfully" });
    renderRegister();

    fireEvent.change(screen.getByLabelText("FULL NAME"), {
      target: { value: "Alex Morgan" },
    });
    fireEvent.change(screen.getByLabelText("EMAIL"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("PASSWORD"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("CONFIRM PASSWORD"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: "Alex Morgan",
          email: "alex@example.com",
          password: "password123",
        }),
      });
      expect(navigateMock).toHaveBeenCalledWith("/login", {
        state: { message: "Account created. Sign in to enter the optimizer." },
      });
    });
  });
});
