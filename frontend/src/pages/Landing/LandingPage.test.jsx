import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import LandingPage from "./LandingPage";

describe("LandingPage", () => {
  test("renders the charging product and workspace links", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /smart ev\s*charging/i }))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open your workspace/i }))
      .toHaveAttribute("href", "/login");
  });
});