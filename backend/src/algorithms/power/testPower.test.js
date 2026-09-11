import { describe, expect, test } from "vitest";
import { maxHeapPower } from "./maxHeapPower.js";
import { roundRobinPower } from "./roundRobinPower.js";

const allocationAlgorithms = [
    ["max-heap power", maxHeapPower],
    ["round-robin power", roundRobinPower]
];

const totalAllocatedPower = (result) =>
    result.allocations.reduce(
        (total, allocation) => total + allocation.allocatedPowerKw,
        0
    );

const allocationTotalsByVehicle = (result) =>
    result.allocations.reduce((totals, allocation) => {
        totals.set(
            allocation.vehicleId,
            (totals.get(allocation.vehicleId) || 0) +
                allocation.allocatedPowerKw
        );
        return totals;
    }, new Map());

const expectPowerInvariants = (
    result,
    vehicles,
    availablePower
) => {
    const totalsByVehicle = allocationTotalsByVehicle(result);

    expect(result.remainingPowerKw).toBeGreaterThanOrEqual(0);
    expect(totalAllocatedPower(result)).toBeLessThanOrEqual(
        availablePower
    );
    expect(totalAllocatedPower(result) + result.remainingPowerKw).toBeCloseTo(
        availablePower,
        1
    );

    for (const vehicle of vehicles) {
        expect(totalsByVehicle.get(vehicle.id) || 0)
            .toBeLessThanOrEqual(Number(vehicle.requested_power_kw));
    }
};

describe.each(allocationAlgorithms)(
    "%s",
    (_name, allocatePower) => {
        test("performs normal allocation for multiple demands", () => {
            const vehicles = [
                { id: 1, priorityValue: 100, requested_power_kw: 60 },
                { id: 2, priorityValue: 80, requested_power_kw: 40 },
                { id: 3, priorityValue: 60, requested_power_kw: 20 }
            ];

            const result = allocatePower(vehicles, 100);

            expect(totalAllocatedPower(result)).toBeCloseTo(100, 1);
            expectPowerInvariants(result, vehicles, 100);
        });

        test("returns no allocations for empty input", () => {
            const result = allocatePower([], 100);

            expect(result.allocations).toEqual([]);
            expect(result.remainingPowerKw).toBe(100);
            expect(result.operations).toBe(0);
        });

        test("returns no allocations when available power is zero", () => {
            const vehicles = [
                { id: 1, priorityValue: 100, requested_power_kw: 50 }
            ];

            const result = allocatePower(vehicles, 0);

            expect(result.allocations).toEqual([]);
            expect(result.remainingPowerKw).toBe(0);
            expect(result.operations).toBe(0);
        });

        test("does not allocate more than available power", () => {
            const vehicles = [
                { id: 1, priorityValue: 100, requested_power_kw: 100 }
            ];

            const result = allocatePower(vehicles, 30);

            expect(totalAllocatedPower(result)).toBeCloseTo(30, 1);
            expect(result.remainingPowerKw).toBe(0);
            expectPowerInvariants(result, vehicles, 30);
        });

        test("conserves available power and respects each vehicle demand", () => {
            const vehicles = [
                { id: 1, priorityValue: 100, requested_power_kw: 25 },
                { id: 2, priorityValue: 80, requested_power_kw: 55 },
                { id: 3, priorityValue: 60, requested_power_kw: 35 }
            ];

            const result = allocatePower(vehicles, 80);

            expectPowerInvariants(result, vehicles, 80);
        });

        test("allocates exactly the available power at the boundary", () => {
            const vehicles = [
                { id: 1, priorityValue: 100, requested_power_kw: 30 },
                { id: 2, priorityValue: 80, requested_power_kw: 20 }
            ];

            const result = allocatePower(vehicles, 50);

            expect(totalAllocatedPower(result)).toBeCloseTo(50, 2);
            expect(result.remainingPowerKw).toBe(0);
            expectPowerInvariants(result, vehicles, 50);
        });

        test("handles vehicles with different demands without duplicate over-allocation", () => {
            const vehicles = [
                { id: 1, priorityValue: 90, requested_power_kw: 5 },
                { id: 2, priorityValue: 80, requested_power_kw: 45 },
                { id: 3, priorityValue: 70, requested_power_kw: 15 }
            ];

            const result = allocatePower(vehicles, 65);
            const totalsByVehicle = allocationTotalsByVehicle(result);

            expect(result.allocations.every(
                (allocation) => allocation.allocatedPowerKw >= 0
            )).toBe(true);
            expect(totalsByVehicle.get(1) || 0).toBeLessThanOrEqual(5);
            expect(totalsByVehicle.get(2) || 0).toBeLessThanOrEqual(45);
            expect(totalsByVehicle.get(3) || 0).toBeLessThanOrEqual(15);
            expectPowerInvariants(result, vehicles, 65);
        });
    }
);

test("max-heap processes vehicles by descending priority", () => {
    const vehicles = [
        { id: 1, priorityValue: 50, requested_power_kw: 10 },
        { id: 2, priorityValue: 100, requested_power_kw: 10 },
        { id: 3, priorityValue: 75, requested_power_kw: 10 }
    ];

    const result = maxHeapPower(vehicles, 30);

    expect(result.allocations.map(
        (allocation) => allocation.vehicleId
    )).toEqual([2, 3, 1]);
    expectPowerInvariants(result, vehicles, 30);
});

test("round-robin gives equal first-round shares to equal demands", () => {
    const vehicles = [
        { id: 1, requested_power_kw: 100 },
        { id: 2, requested_power_kw: 100 },
        { id: 3, requested_power_kw: 100 }
    ];

    const result = roundRobinPower(vehicles, 90);

    expect(result.allocations.slice(0, 3).map(
        (allocation) => allocation.vehicleId
    )).toEqual([1, 2, 3]);
    expect(result.allocations.slice(0, 3).every(
        (allocation) => allocation.allocatedPowerKw > 0
    )).toBe(true);
    expectPowerInvariants(result, vehicles, 90);
});

test("max-heap preserves current negative and NaN demand behavior", () => {
    const negativeResult = maxHeapPower(
        [{ id: 1, priorityValue: 100, requested_power_kw: -10 }],
        100
    );
    const nanResult = maxHeapPower(
        [{ id: 2, priorityValue: 100, requested_power_kw: NaN }],
        100
    );

    expect(negativeResult.allocations[0].allocatedPowerKw).toBe(-10);
    expect(negativeResult.remainingPowerKw).toBe(110);
    expect(Number.isNaN(nanResult.allocations[0].allocatedPowerKw)).toBe(true);
    expect(Number.isNaN(nanResult.remainingPowerKw)).toBe(true);
});

test("round-robin skips negative demand and propagates NaN demand", () => {
    const negativeResult = roundRobinPower(
        [{ id: 1, requested_power_kw: -10 }],
        100
    );
    const nanResult = roundRobinPower(
        [{ id: 2, requested_power_kw: NaN }],
        100
    );

    expect(negativeResult.allocations).toEqual([]);
    expect(negativeResult.remainingPowerKw).toBe(100);
    expect(Number.isNaN(nanResult.allocations[0].allocatedPowerKw)).toBe(true);
    expect(Number.isNaN(nanResult.remainingPowerKw)).toBe(true);
});