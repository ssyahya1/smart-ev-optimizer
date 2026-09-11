import { describe, expect, test } from "vitest";
import { greedyAssignment } from "./greedyAssignment.js";
import { priorityQueueAssignment } from "./priorityQueueAssignment.js";

const assignmentAlgorithms = [
    ["greedy assignment", greedyAssignment],
    ["priority queue assignment", priorityQueueAssignment]
];

const expectValidAssignmentResult = (
    result,
    vehicles,
    chargingBays
) => {
    const vehicleIds = vehicles.map((vehicle) => vehicle.id);
    const availableBays = chargingBays.filter(
        (bay) => bay.status === "available"
    );
    const bayById = new Map(
        chargingBays.map((bay) => [bay.id, bay])
    );

    expect(result).toEqual(
        expect.objectContaining({
            assignments: expect.any(Array),
            unassignedVehicles: expect.any(Array),
            operations: expect.any(Number)
        })
    );
    expect(new Set(result.assignments.map(
        (assignment) => assignment.vehicleId
    )).size).toBe(result.assignments.length);
    expect(new Set(result.assignments.map(
        (assignment) => assignment.bayId
    )).size).toBe(result.assignments.length);

    for (const assignment of result.assignments) {
        const vehicle = vehicles.find(
            (candidate) => candidate.id === assignment.vehicleId
        );
        const bay = bayById.get(assignment.bayId);

        expect(vehicle).toBeDefined();
        expect(availableBays).toContainEqual(bay);
        expect(Number(bay.max_power_kw)).toBeGreaterThanOrEqual(
            Number(vehicle.required_power_kw)
        );
    }

    expect(new Set([
        ...result.assignments.map(
            (assignment) => assignment.vehicleId
        ),
        ...result.unassignedVehicles
    ])).toEqual(new Set(vehicleIds));
};

describe.each(assignmentAlgorithms)(
    "%s",
    (name, assignVehicles) => {
        test("creates valid assignments for eligible vehicles", () => {
            const vehicles = [
                { id: 1, priority: "Emergency", required_power_kw: 90 },
                { id: 2, priority: "High", required_power_kw: 40 }
            ];
            const chargingBays = [
                { id: 10, status: "available", max_power_kw: 100 },
                { id: 11, status: "available", max_power_kw: 50 },
                { id: 12, status: "occupied", max_power_kw: 200 }
            ];

            const result = assignVehicles(vehicles, chargingBays);

            expect(result.assignments).toEqual([
                { vehicleId: 1, bayId: 10 },
                { vehicleId: 2, bayId: 11 }
            ]);
            expect(result.unassignedVehicles).toEqual([]);
            expectValidAssignmentResult(result, vehicles, chargingBays);
        });

        test("returns an empty result for empty input", () => {
            expect(assignVehicles([], [])).toEqual({
                assignments: [],
                unassignedVehicles: [],
                operations: 0
            });
        });

        test("leaves vehicles unassigned when bays are unavailable or insufficient", () => {
            const vehicles = [
                { id: 1, priority: "Emergency", required_power_kw: 60 },
                { id: 2, priority: "Low", required_power_kw: 200 }
            ];
            const chargingBays = [
                { id: 10, status: "occupied", max_power_kw: 500 },
                { id: 11, status: "available", max_power_kw: 50 }
            ];

            const result = assignVehicles(vehicles, chargingBays);

            expect(result.assignments).toEqual([]);
            expect(result.unassignedVehicles).toEqual([1, 2]);
            expectValidAssignmentResult(result, vehicles, chargingBays);
        });

        test("never assigns a bay below the vehicle power requirement", () => {
            const vehicles = [
                { id: 1, priority: "Medium", required_power_kw: 60 }
            ];
            const chargingBays = [
                { id: 10, status: "available", max_power_kw: 50 },
                { id: 11, status: "available", max_power_kw: 60 },
                { id: 12, status: "available", max_power_kw: 100 }
            ];

            const result = assignVehicles(vehicles, chargingBays);

            expect(result.assignments).toEqual([
                { vehicleId: 1, bayId: 11 }
            ]);
            expectValidAssignmentResult(result, vehicles, chargingBays);
        });

        test("processes vehicles in priority order", () => {
            const vehicles = [
                { id: 1, priority: "Low", required_power_kw: 10 },
                { id: 2, priority: "Emergency", required_power_kw: 10 },
                { id: 3, priority: "Medium", required_power_kw: 10 },
                { id: 4, priority: "High", required_power_kw: 10 }
            ];
            const chargingBays = [
                { id: 10, status: "available", max_power_kw: 10 },
                { id: 11, status: "available", max_power_kw: 10 },
                { id: 12, status: "available", max_power_kw: 10 },
                { id: 13, status: "available", max_power_kw: 10 }
            ];

            const result = assignVehicles(vehicles, chargingBays);

            expect(result.assignments.map(
                (assignment) => assignment.vehicleId
            )).toEqual([2, 4, 3, 1]);
            expectValidAssignmentResult(result, vehicles, chargingBays);
        });

        test("assigns each vehicle and bay at most once", () => {
            const vehicles = [
                { id: 1, priority: "Emergency", required_power_kw: 10 },
                { id: 2, priority: "High", required_power_kw: 10 },
                { id: 3, priority: "Low", required_power_kw: 10 }
            ];
            const chargingBays = [
                { id: 10, status: "available", max_power_kw: 10 },
                { id: 11, status: "available", max_power_kw: 10 }
            ];

            const result = assignVehicles(vehicles, chargingBays);

            expect(result.assignments).toHaveLength(2);
            expect(result.unassignedVehicles).toEqual([3]);
            expectValidAssignmentResult(result, vehicles, chargingBays);
        });
    }
);