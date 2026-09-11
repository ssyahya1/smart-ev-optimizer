import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import LandingPage from "./LandingPage";

describe("LandingPage", () => {
  test("renders the product heading and login link", () => {
    render(<LandingPage />);

    expect(screen.getByText("SMART EV")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /enter optimizer/i }))
      .toHaveAttribute("href", "/login");
  });
});