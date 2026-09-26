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

    expect(screen.getByRole("heading", { name: /create your\s*account/i }))
      .toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
  });

  test("rejects mismatched passwords without calling the API", async () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Alex Morgan" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  test("creates an account and returns to login", async () => {
    apiRequest.mockResolvedValueOnce({ message: "User created successfully" });
    renderRegister();

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Alex Morgan" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "alex@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
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
        state: { message: "Your account is ready. Sign in to continue." },
      });
    });
  });
});
