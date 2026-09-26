import { beforeEach, describe, expect, test, vi } from "vitest";
import pool from "../config/database.js";
import { runAssignment } from "./assignmentController.js";

vi.mock("../config/database.js", () => ({
    default: { query: vi.fn() },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("runAssignment", () => {
    test("loads only the authenticated user's vehicles and returns business plans", async () => {
        pool.query
            .mockResolvedValueOnce({
                rows: [{
                    id: 12,
                    battery_capacity_kwh: "80",
                    initial_soc: "25",
                    arrival_time: "2026-09-11T08:00:00.000Z",
                    deadline: "2026-09-11T12:00:00.000Z",
                    priority: "High",
                }],
            })
            .mockResolvedValueOnce({
                rows: [{ id: 4, status: "available", max_power_kw: "60" }],
            });

        const req = {
            user: { id: 37 },
            body: {
                vehicles: [{ id: 999, priority: "Emergency" }],
                chargingBays: [{ id: 999, status: "available", max_power_kw: 100000 }],
            },
        };
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        const next = vi.fn();

        await runAssignment(req, res, next);

        expect(pool.query).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("WHERE user_id = $1"),
            [37]
        );
        expect(pool.query).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("FROM charging_bays")
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            recommendedPlan: {
                assignments: [{ vehicleId: 12, bayId: 4 }],
                unassignedVehicles: [],
            },
            alternativePlan: {
                assignments: [{ vehicleId: 12, bayId: 4 }],
                unassignedVehicles: [],
            },
        });
        expect(next).not.toHaveBeenCalled();
    });
});
