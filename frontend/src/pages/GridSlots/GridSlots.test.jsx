import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import GridSlots from "./GridSlots";
import { apiRequest } from "../../services/api";

vi.mock("../../services/api", () => ({
  apiRequest: vi.fn(),
}));

const slot = {
  id: 1,
  slot_time: "2026-09-11T10:00",
  max_capacity_kw: 200,
  current_load_kw: 50,
  electricity_price: 0.25,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GridSlots", () => {
  test("renders loading and grid-slot data", async () => {
    let resolveRequest;
    apiRequest.mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    render(<GridSlots />);

    expect(screen.getByText("Loading grid slots...")).toBeInTheDocument();
    resolveRequest({ gridSlots: [slot] });

    expect(await screen.findByText("2026-09-11T10:00")).toBeInTheDocument();
    expect(screen.getByText("200 kW")).toBeInTheDocument();
    expect(screen.getAllByText("0.25").length).toBeGreaterThan(0);
  });

  test("renders empty and API error states", async () => {
    apiRequest.mockResolvedValueOnce({ gridSlots: [] });
    render(<GridSlots />);
    expect(await screen.findByText("No grid slots found.")).toBeInTheDocument();

    apiRequest.mockRejectedValueOnce(new Error("Grid service unavailable"));
    render(<GridSlots />);
    expect(await screen.findByText("Grid service unavailable"))
      .toBeInTheDocument();
  });

  test("blocks submission when required slot fields are empty", async () => {
    apiRequest.mockResolvedValueOnce({ gridSlots: [] });
    render(<GridSlots />);
    await screen.findByText("No grid slots found.");

    fireEvent.click(screen.getByRole("button", { name: /add grid slot/i }));
    fireEvent.click(screen.getByRole("button", { name: /create slot/i }));

    expect(apiRequest).toHaveBeenCalledTimes(1);
  });

  test("submits a grid slot and reloads data", async () => {
    apiRequest
      .mockResolvedValueOnce({ gridSlots: [] })
      .mockResolvedValueOnce({ gridSlot: slot })
      .mockResolvedValueOnce({ gridSlots: [slot] });
    render(<GridSlots />);
    await screen.findByText("No grid slots found.");

    fireEvent.click(screen.getByRole("button", { name: /add grid slot/i }));
    fireEvent.change(screen.getByLabelText("SLOT TIME"), {
      target: { value: "2026-09-11T10:00" },
    });
    fireEvent.change(screen.getByLabelText("MAX POWER (KW)"), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText("CURRENT LOAD (KW)"), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByLabelText("PRICE / KWH"), {
      target: { value: "0.25" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create slot/i }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        "/api/grid-slots",
        expect.objectContaining({ method: "POST" })
      );
    });
    expect(await screen.findByText("2026-09-11T10:00")).toBeInTheDocument();
  });

  test("shows a submission API failure", async () => {
    apiRequest
      .mockResolvedValueOnce({ gridSlots: [] })
      .mockRejectedValueOnce(new Error("Grid slot creation failed"));
    render(<GridSlots />);
    await screen.findByText("No grid slots found.");

    fireEvent.click(screen.getByRole("button", { name: /add grid slot/i }));
    fireEvent.change(screen.getByLabelText("SLOT TIME"), {
      target: { value: "2026-09-11T10:00" },
    });
    fireEvent.change(screen.getByLabelText("MAX POWER (KW)"), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText("CURRENT LOAD (KW)"), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByLabelText("PRICE / KWH"), {
      target: { value: "0.25" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create slot/i }));

    expect(await screen.findByText("Grid slot creation failed"))
      .toBeInTheDocument();
  });
});