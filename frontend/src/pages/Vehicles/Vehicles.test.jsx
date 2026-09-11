import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import Vehicles from "./Vehicles";
import { apiRequest } from "../../services/api";

vi.mock("../../services/api", () => ({
  apiRequest: vi.fn(),
}));

const vehicle = {
  id: 1,
  vehicle_number: "EV-001",
  arrival_time: "2026-09-11T08:00",
  initial_soc: 40,
  battery_capacity_kwh: 80,
  priority: "High",
  deadline: "2026-09-11T12:00",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Vehicles", () => {
  test("shows loading and then renders the vehicle list and values", async () => {
    let resolveRequest;
    apiRequest.mockReturnValueOnce(new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    render(<Vehicles />);
    expect(screen.getByText("LOADING FLEET DATA...")).toBeInTheDocument();

    resolveRequest({ vehicles: [vehicle] });

    expect(await screen.findByText("EV-001")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("80 kWh")).toBeInTheDocument();
  });

  test("renders the empty state", async () => {
    apiRequest.mockResolvedValueOnce({ vehicles: [] });

    render(<Vehicles />);

    expect(await screen.findByText("NO VEHICLES FOUND")).toBeInTheDocument();
  });

  test("renders the API error state", async () => {
    apiRequest.mockRejectedValueOnce(new Error("Vehicle service unavailable"));

    render(<Vehicles />);

    expect(await screen.findByText("Vehicle service unavailable"))
      .toBeInTheDocument();
  });

  test("keeps the create form from submitting incomplete required fields", async () => {
    apiRequest.mockResolvedValueOnce({ vehicles: [] });
    render(<Vehicles />);
    await screen.findByText("NO VEHICLES FOUND");

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));
    fireEvent.click(screen.getByRole("button", { name: /create vehicle/i }));

    expect(apiRequest).toHaveBeenCalledTimes(1);
  });

  test("submits a valid vehicle and reloads the list", async () => {
    apiRequest
      .mockResolvedValueOnce({ vehicles: [] })
      .mockResolvedValueOnce({ vehicle })
      .mockResolvedValueOnce({ vehicles: [vehicle] });
    render(<Vehicles />);
    await screen.findByText("NO VEHICLES FOUND");

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));
    fireEvent.change(screen.getByPlaceholderText("EV-001"), {
      target: { value: "EV-001" },
    });
    fireEvent.change(document.querySelector('input[name="arrival_time"]'), {
      target: { value: "2026-09-11T08:00" },
    });
    fireEvent.change(document.querySelector('input[name="initial_soc"]'), {
      target: { value: "40" },
    });
    fireEvent.change(document.querySelector('input[name="battery_capacity_kwh"]'), {
      target: { value: "80" },
    });
    fireEvent.change(document.querySelector('input[name="deadline"]'), {
      target: { value: "2026-09-11T12:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create vehicle/i }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        "/api/vehicles/registervehicle",
        expect.objectContaining({ method: "POST" })
      );
    });
    expect(await screen.findByText("EV-001")).toBeInTheDocument();
  });

  test("shows an API failure when vehicle creation fails", async () => {
    apiRequest
      .mockResolvedValueOnce({ vehicles: [] })
      .mockRejectedValueOnce(new Error("Vehicle creation failed"));
    render(<Vehicles />);
    await screen.findByText("NO VEHICLES FOUND");

    fireEvent.click(screen.getByRole("button", { name: /add vehicle/i }));
    fireEvent.change(screen.getByPlaceholderText("EV-001"), {
      target: { value: "EV-002" },
    });
    fireEvent.change(document.querySelector('input[name="arrival_time"]'), {
      target: { value: "2026-09-11T08:00" },
    });
    fireEvent.change(document.querySelector('input[name="initial_soc"]'), {
      target: { value: "40" },
    });
    fireEvent.change(document.querySelector('input[name="battery_capacity_kwh"]'), {
      target: { value: "80" },
    });
    fireEvent.change(document.querySelector('input[name="deadline"]'), {
      target: { value: "2026-09-11T12:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create vehicle/i }));

    expect(await screen.findByText("Vehicle creation failed"))
      .toBeInTheDocument();
  });
});