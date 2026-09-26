import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Assignment from "./Assignment";
import Scheduling from "./Scheduling";
import Power from "./Power";
import Routing from "./Routing";
import Journey from "./Journey";
import ResourceAllocation from "./ResorceAllocation";
import { apiRequest } from "../../services/api";

vi.mock("../../services/api", () => ({
  apiRequest: vi.fn(),
}));

const vehicle = {
  id: 1,
  vehicle_number: "EV-001",
  priority: "High",
  arrival_time: "2026-09-11T08:00:00",
  deadline: "2026-09-11T12:00:00",
  initial_soc: 25,
  battery_capacity_kwh: 80,
};

const bay = {
  id: 2,
  bay_number: "BAY-02",
  charger_type: "DC",
  status: "available",
  max_power_kw: 150,
};

const session = {
  id: 3,
  vehicle_id: 1,
  start_time: "2026-09-11T08:00:00",
  end_time: "2026-09-11T09:00:00",
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("Assignment", () => {
  test("shows loading, then renders input data and successful results", async () => {
    apiRequest
      .mockResolvedValueOnce({ vehicles: [vehicle] })
      .mockResolvedValueOnce({ chargingBays: [bay] });
    render(<MemoryRouter><Assignment /></MemoryRouter>);

    expect(await screen.findByText("BAY-02")).toBeInTheDocument();
    expect(screen.getByText("150 kW")).toBeInTheDocument();

    apiRequest.mockResolvedValueOnce({
      success: true,
      recommendedPlan: {
        assignments: [{ vehicleId: 1, bayId: 2 }],
        unassignedVehicles: [],
      },
      alternativePlan: {
        assignments: [{ vehicleId: 1, bayId: 2 }],
        unassignedVehicles: [],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /recommend charging bays/i }));

    expect(apiRequest).toHaveBeenCalledWith("/api/assignment", {
      method: "POST",
    });
    expect(await screen.findByText("PLAN READY")).toBeInTheDocument();
    expect(screen.getByText("EV-001")).toBeInTheDocument();
    expect(screen.getAllByText("BAY-02").length).toBeGreaterThan(0);
    expect(screen.queryByText("Alternative plan")).not.toBeInTheDocument();
  });

  test("renders the empty assignment state and prevents submission", async () => {
    apiRequest
      .mockResolvedValueOnce({ vehicles: [] })
      .mockResolvedValueOnce({ chargingBays: [] });
    render(<MemoryRouter><Assignment /></MemoryRouter>);

    expect(await screen.findByText("No charging bays are currently available."))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add your first vehicle/i }))
      .toHaveAttribute("href", "/vehicles");
  });

  test("shows assignment API errors", async () => {
    apiRequest
      .mockResolvedValueOnce({ vehicles: [vehicle] })
      .mockResolvedValueOnce({ chargingBays: [bay] })
      .mockRejectedValueOnce(new Error("Assignment unavailable"));
    render(<MemoryRouter><Assignment /></MemoryRouter>);
    await screen.findByText("BAY-02");

    fireEvent.click(screen.getByRole("button", { name: /recommend charging bays/i }));

    expect(await screen.findByText("Assignment unavailable"))
      .toBeInTheDocument();
  });

  test("does not count occupied bays as available", async () => {
    apiRequest
      .mockResolvedValueOnce({ vehicles: [vehicle] })
      .mockResolvedValueOnce({ chargingBays: [{ ...bay, status: "occupied" }] });
    render(<MemoryRouter><Assignment /></MemoryRouter>);

    expect(await screen.findByText("No charging bays are currently available."))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: /review charging bays/i }))
      .toHaveAttribute("href", "/bays");
    expect(screen.queryByText("BAY-02")).not.toBeInTheDocument();
  });
});

describe("Scheduling", () => {
  test("renders jobs and successful scheduling results", async () => {
    apiRequest
      .mockResolvedValueOnce({ vehicles: [vehicle] })
      .mockResolvedValueOnce({ chargingSessions: [session] });
    render(<Scheduling />);

    expect(await screen.findByText("Session 3")).toBeInTheDocument();
    expect(screen.getByText("Vehicle 1")).toBeInTheDocument();

    apiRequest.mockResolvedValueOnce({
      success: true,
      greedy: { scheduled: [{ id: 3 }], rejected: [], operations: 2 },
      dynamicProgramming: { scheduled: [{ id: 3 }], rejected: [], operations: 3 },
    });
    fireEvent.click(screen.getByRole("button", { name: /create charging schedule/i }));

    expect(await screen.findByText("● COMPLETE")).toBeInTheDocument();
    expect(screen.getAllByText("Session 3").length).toBeGreaterThan(0);
  });

  test("shows the no-valid-jobs state and blocks scheduling", async () => {
    apiRequest
      .mockResolvedValueOnce({ vehicles: [] })
      .mockResolvedValueOnce({ chargingSessions: [] });
    render(<Scheduling />);

    expect(await screen.findByText("No sessions are ready to schedule."))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create charging schedule/i }))
      .toBeDisabled();
  });

  test("shows scheduling load and API errors", async () => {
    apiRequest.mockImplementation(() => new Promise(() => {}));
    render(<Scheduling />);
    expect(screen.getByText("Loading vehicles and sessions..."))
      .toBeInTheDocument();

    vi.resetAllMocks();
    apiRequest
      .mockResolvedValueOnce({ vehicles: [vehicle] })
      .mockResolvedValueOnce({ chargingSessions: [session] })
      .mockRejectedValueOnce(new Error("Scheduling unavailable"));
    render(<Scheduling />);
    await screen.findByText("Session 3");
    fireEvent.click(screen.getByRole("button", { name: /create charging schedule/i }));

    expect(await screen.findByText("Scheduling unavailable"))
      .toBeInTheDocument();
  });
});

describe("Power", () => {
  test("renders power demand and successful allocation results", async () => {
    apiRequest.mockResolvedValueOnce({ vehicles: [vehicle] });
    render(<Power />);

    expect(await screen.findByText("Vehicle 1")).toBeInTheDocument();
    expect(screen.getByText(/REQUESTED/)).toBeInTheDocument();

    apiRequest.mockResolvedValueOnce({
      success: true,
      maxHeap: {
        allocations: [{ vehicleId: 1, requestedPowerKw: 15, allocatedPowerKw: 15 }],
        remainingPowerKw: 5,
        operations: 2,
      },
      roundRobin: {
        allocations: [{ vehicleId: 1, requestedPowerKw: 15, allocatedPowerKw: 15 }],
        remainingPowerKw: 5,
        operations: 2,
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /create power plan/i }));

    expect(await screen.findByText("● COMPLETE")).toBeInTheDocument();
    expect(screen.getAllByText("15.00 kW").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/5\.0/).length).toBeGreaterThan(0);
  });

  test("renders no valid requests and validates available power", async () => {
    apiRequest.mockResolvedValueOnce({ vehicles: [] });
    render(<Power />);

    expect(await screen.findByText("No valid power requests available."))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create power plan/i }))
      .toBeDisabled();
  });

  test("shows loading and API error states", async () => {
    apiRequest.mockReturnValueOnce(new Promise(() => {}));
    render(<Power />);
    expect(screen.getByText("Loading vehicles...")).toBeInTheDocument();

    vi.resetAllMocks();
    apiRequest
      .mockResolvedValueOnce({ vehicles: [vehicle] })
      .mockRejectedValueOnce(new Error("Power service unavailable"));
    render(<Power />);
    await screen.findByText("Vehicle 1");
    fireEvent.click(screen.getByRole("button", { name: /create power plan/i }));

    expect(await screen.findByText("Power service unavailable"))
      .toBeInTheDocument();
  });
});

describe.each([
  ["Routing", Routing, "Find route", "routing", { bfs: { path: ["A", "C"], distance: 1, operations: 2 }, dijkstra: { path: ["A", "C"], distance: 2, operations: 3 } }],
  ["Journey", Journey, "Find route", "journey", { aStar: { path: ["A", "C"], distance: 2, operations: 2 }, bellmanFord: { path: ["A", "C"], distance: 2, operations: 3 } }],
])("%s", (_name, Page, runLabel, endpoint, result) => {
  test("renders, submits the default graph, and displays results", async () => {
    apiRequest.mockResolvedValueOnce({ success: true, ...result });
    render(<Page />);

    expect((await screen.findAllByText("A → C")).length).toBeGreaterThan(0);
    expect(apiRequest).toHaveBeenCalledWith(
      `/api/${endpoint}`,
      expect.objectContaining({ method: "POST" })
    );
    expect(screen.getByRole("button", { name: runLabel })).toBeInTheDocument();
    expect(screen.getAllByText(/2 km/).length).toBeGreaterThan(0);
  });

  test("shows no-result and rejects identical endpoints", async () => {
    apiRequest.mockResolvedValueOnce({
      success: true,
      ...(endpoint === "routing"
        ? { bfs: { path: [], distance: null }, dijkstra: { path: [], distance: null } }
        : { aStar: { path: [], distance: null }, bellmanFord: { path: [], distance: null } }),
    });
    render(<Page />);
    expect((await screen.findAllByText("— km")).length).toBeGreaterThan(0);

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "A" } });
    expect(screen.getByText("Choose two different locations.")
    ).toBeInTheDocument();
  });

  test("shows the API error state", async () => {
    apiRequest.mockRejectedValueOnce(new Error(`${endpoint} failed`));
    render(<Page />);

    expect(await screen.findByText(`${endpoint} failed`)).toBeInTheDocument();
  });
});

describe("ResourceAllocation", () => {
  test("renders the network and successful flow results", async () => {
    apiRequest.mockResolvedValueOnce({
      success: true,
      fordFulkerson: { maxFlow: 12, operations: 4 },
      greedyBottleneck: { totalFlow: 10, operations: 5 },
    });
    render(<ResourceAllocation />);

    expect(await screen.findByText("12 kW")).toBeInTheDocument();
    expect(screen.getAllByText("10 kW").length).toBeGreaterThan(0);
    expect(apiRequest).toHaveBeenCalledWith(
      "/api/resource-allocation",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("shows the API error state and validates identical source and sink", async () => {
    apiRequest.mockRejectedValueOnce(new Error("Allocation failed"));
    render(<ResourceAllocation />);
    expect(await screen.findByText("Allocation failed")).toBeInTheDocument();

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "Source" } });
    expect(screen.getByText("Choose two different locations.")
    ).toBeInTheDocument();
  });
});