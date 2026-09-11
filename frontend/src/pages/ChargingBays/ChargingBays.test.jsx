import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ChargingBays from "./ChargingBays";
import { apiRequest } from "../../services/api";

vi.mock("../../services/api", () => ({
  apiRequest: vi.fn(),
}));

const bay = {
  id: 1,
  bay_number: "BAY-01",
  charger_type: "DC",
  max_power_kw: 150,
  status: "available",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ChargingBays", () => {
  test("renders loading and bay list values", async () => {
    let resolveRequest;
    apiRequest.mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    render(<ChargingBays />);

    expect(screen.getByText("LOADING BAY DATA...")).toBeInTheDocument();
    resolveRequest({ chargingBays: [bay] });

    expect(await screen.findByText("BAY-01")).toBeInTheDocument();
    expect(screen.getByText("DC Fast")).toBeInTheDocument();
    expect(screen.getByText("150 kW")).toBeInTheDocument();
  });

  test("renders empty and API error states", async () => {
    apiRequest.mockResolvedValueOnce({ chargingBays: [] });
    render(<ChargingBays />);
    expect(await screen.findByText("NO CHARGING BAYS FOUND"))
      .toBeInTheDocument();

    apiRequest.mockRejectedValueOnce(new Error("Bay service unavailable"));
    render(<ChargingBays />);
    expect(await screen.findByText("Bay service unavailable"))
      .toBeInTheDocument();
  });

  test("blocks the create form when required fields are empty", async () => {
    apiRequest.mockResolvedValueOnce({ chargingBays: [] });
    render(<ChargingBays />);
    await screen.findByText("NO CHARGING BAYS FOUND");

    fireEvent.click(screen.getByRole("button", { name: /add bay/i }));
    fireEvent.click(screen.getByRole("button", { name: /create charging bay/i }));

    expect(apiRequest).toHaveBeenCalledTimes(1);
  });

  test("creates a bay and reloads the list", async () => {
    apiRequest
      .mockResolvedValueOnce({ chargingBays: [] })
      .mockResolvedValueOnce({ chargingBay: bay })
      .mockResolvedValueOnce({ chargingBays: [bay] });
    render(<ChargingBays />);
    await screen.findByText("NO CHARGING BAYS FOUND");

    fireEvent.click(screen.getByRole("button", { name: /add bay/i }));
    fireEvent.change(screen.getByPlaceholderText("BAY-01"), {
      target: { value: "BAY-01" },
    });
    fireEvent.change(screen.getByPlaceholderText("22"), {
      target: { value: "150" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create charging bay/i }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        "/api/charging-bays",
        expect.objectContaining({ method: "POST" })
      );
    });
    expect(await screen.findByText("BAY-01")).toBeInTheDocument();
  });

  test("shows a create API failure", async () => {
    apiRequest
      .mockResolvedValueOnce({ chargingBays: [] })
      .mockRejectedValueOnce(new Error("Bay creation failed"));
    render(<ChargingBays />);
    await screen.findByText("NO CHARGING BAYS FOUND");

    fireEvent.click(screen.getByRole("button", { name: /add bay/i }));
    fireEvent.change(screen.getByPlaceholderText("BAY-01"), {
      target: { value: "BAY-02" },
    });
    fireEvent.change(screen.getByPlaceholderText("22"), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create charging bay/i }));

    expect(await screen.findByText("Bay creation failed")).toBeInTheDocument();
  });
});