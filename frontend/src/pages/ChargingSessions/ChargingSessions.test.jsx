import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ChargingSessions from "./ChargingSessions";
import { apiRequest } from "../../services/api";

vi.mock("../../services/api", () => ({
  apiRequest: vi.fn(),
}));

const session = {
  id: 1,
  vehicle_id: 7,
  charging_bay_id: 3,
  grid_slot_id: 5,
  start_time: "2026-09-11T10:00",
  end_time: null,
  power_kw: 50,
  energy_delivered_kwh: 12,
  status: "charging",
};

const vehicles = [{ id: 7, vehicle_number: "EV-007" }];
const bays = [{ id: 3, bay_number: "BAY-03" }];
const gridSlots = [{ id: 5, slot_time: "2026-09-11T10:00" }];

const mockInitialData = (sessions = [session]) => {
  apiRequest
    .mockResolvedValueOnce({ chargingSessions: sessions })
    .mockResolvedValueOnce({ vehicles })
    .mockResolvedValueOnce({ chargingBays: bays })
    .mockResolvedValueOnce({ gridSlots });
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ChargingSessions", () => {
  test("renders session values after all related data loads", async () => {
    mockInitialData();
    render(<ChargingSessions />);

    expect(await screen.findByText("EV-007")).toBeInTheDocument();
    expect(screen.getByText("BAY-03")).toBeInTheDocument();
    expect(screen.getByText("50.0")).toBeInTheDocument();
  });

  test("shows the loading state while related data is pending", () => {
    apiRequest.mockImplementation(() => new Promise(() => {}));
    render(<ChargingSessions />);

    expect(screen.getByText("Loading charging sessions..."))
      .toBeInTheDocument();
  });

  test("renders empty and API error states", async () => {
    mockInitialData([]);
    render(<ChargingSessions />);
    expect(await screen.findByText("No charging sessions found."))
      .toBeInTheDocument();

    apiRequest.mockRejectedValueOnce(new Error("Session service unavailable"));
    render(<ChargingSessions />);
    expect(await screen.findByText("Session service unavailable"))
      .toBeInTheDocument();
  });

  test("blocks the session form when required fields are empty", async () => {
    mockInitialData([]);
    render(<ChargingSessions />);
    await screen.findByText("No charging sessions found.");

    fireEvent.click(screen.getByRole("button", { name: /new session/i }));
    fireEvent.click(screen.getByRole("button", { name: /create session/i }));

    expect(apiRequest).toHaveBeenCalledTimes(4);
  });

  test("submits a valid session and reloads data", async () => {
    mockInitialData([]);
    apiRequest.mockResolvedValueOnce({ chargingSession: session });
    mockInitialData([session]);
    render(<ChargingSessions />);
    await screen.findByText("No charging sessions found.");

    fireEvent.click(screen.getByRole("button", { name: /new session/i }));
    fireEvent.change(screen.getByLabelText("VEHICLE"), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByLabelText("CHARGING BAY"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("GRID SLOT"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("START TIME"), {
      target: { value: "2026-09-11T10:00" },
    });
    fireEvent.change(screen.getByLabelText("ENERGY (KWH)"), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByLabelText("POWER (KW)"), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create session/i }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        "/api/charging-sessions",
        expect.objectContaining({ method: "POST" })
      );
    });
    expect(await screen.findByText("EV-007")).toBeInTheDocument();
  });

  test("shows a session creation API failure", async () => {
    mockInitialData([]);
    apiRequest.mockRejectedValueOnce(new Error("Session creation failed"));
    render(<ChargingSessions />);
    await screen.findByText("No charging sessions found.");

    fireEvent.click(screen.getByRole("button", { name: /new session/i }));
    fireEvent.change(screen.getByLabelText("VEHICLE"), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByLabelText("CHARGING BAY"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("START TIME"), {
      target: { value: "2026-09-11T10:00" },
    });
    fireEvent.change(screen.getByLabelText("ENERGY (KWH)"), {
      target: { value: "12" },
    });
    fireEvent.change(screen.getByLabelText("POWER (KW)"), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create session/i }));

    expect(await screen.findByText("Session creation failed"))
      .toBeInTheDocument();
  });
});