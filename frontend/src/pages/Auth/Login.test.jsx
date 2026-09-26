import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import Login from "./Login";

const loginMock = vi.fn();
const navigateMock = vi.fn();

const renderLogin = () => render(
  <MemoryRouter>
    <Login />
  </MemoryRouter>
);

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ login: loginMock }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("Login", () => {
  test("renders the login form", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: /welcome\s*back/i }))
      .toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  test("keeps required fields from submitting empty credentials", () => {
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(loginMock).not.toHaveBeenCalled();
  });

  test("logs in successfully and navigates to the dashboard", async () => {
    loginMock.mockResolvedValueOnce({ user: { email: "user@example.com" } });
    renderLogin();

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("user@example.com", "password123");
      expect(navigateMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("shows the login error when authentication fails", async () => {
    loginMock.mockRejectedValueOnce(new Error("Invalid credentials"));
    renderLogin();

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});