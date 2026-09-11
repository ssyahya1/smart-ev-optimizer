import { describe, expect, test } from "vitest";
import { fordFulkerson } from "./fordFulkerson.js";
import { greedyBottleneck } from "./greedyBottleneck.js";

const allocationAlgorithms = [
    ["Ford-Fulkerson", fordFulkerson, "maxFlow"],
    ["Greedy Bottleneck", greedyBottleneck, "totalFlow"]
];

const expectAllocationResult = (result, flowKey) => {
    expect(result).toEqual(
        expect.objectContaining({
            [flowKey]: expect.any(Number),
            operations: expect.any(Number)
        })
    );
    expect(result[flowKey]).toBeGreaterThanOrEqual(0);
};

const getSourceCapacity = (graph, source) =>
    (graph[source] || []).reduce(
        (total, edge) => total + Math.max(0, Number(edge.capacity)),
        0
    );

const getSinkCapacity = (graph, sink) =>
    Object.values(graph).reduce(
        (total, edges) => total + edges.reduce(
            (edgeTotal, edge) => edgeTotal + (
                edge.node === sink
                    ? Math.max(0, Number(edge.capacity))
                    : 0
            ),
            0
        ),
        0
    );

describe.each(allocationAlgorithms)(
    "%s",
    (_name, allocate, flowKey) => {
        test("returns a valid result for normal multiple-resource allocation", () => {
            const graph = {
                S: [
                    { node: "A", capacity: 10 },
                    { node: "B", capacity: 8 }
                ],
                A: [{ node: "T", capacity: 6 }],
                B: [{ node: "T", capacity: 7 }],
                T: []
            };

            const result = allocate(graph, "S", "T");

            expect(result[flowKey]).toBe(13);
            expectAllocationResult(result, flowKey);
            expect(result[flowKey]).toBeLessThanOrEqual(
                getSourceCapacity(graph, "S")
            );
            expect(result[flowKey]).toBeLessThanOrEqual(
                getSinkCapacity(graph, "T")
            );
        });

        test("returns zero flow for an empty graph", () => {
            const result = allocate({}, "S", "T");

            expect(result[flowKey]).toBe(0);
            expectAllocationResult(result, flowKey);
        });

        test("returns zero flow when all capacities are zero", () => {
            const graph = {
                S: [{ node: "A", capacity: 0 }],
                A: [{ node: "T", capacity: 0 }],
                T: []
            };

            const result = allocate(graph, "S", "T");

            expect(result[flowKey]).toBe(0);
            expectAllocationResult(result, flowKey);
        });

        test("limits flow when resources are insufficient", () => {
            const graph = {
                S: [{ node: "A", capacity: 4 }],
                A: [{ node: "T", capacity: 2 }],
                T: []
            };

            const result = allocate(graph, "S", "T");

            expect(result[flowKey]).toBe(2);
            expectAllocationResult(result, flowKey);
        });

        test("uses sufficient capacities without exceeding any cut capacity", () => {
            const graph = {
                S: [
                    { node: "A", capacity: 10 },
                    { node: "B", capacity: 10 }
                ],
                A: [{ node: "T", capacity: 10 }],
                B: [{ node: "T", capacity: 10 }],
                T: []
            };

            const result = allocate(graph, "S", "T");

            expect(result[flowKey]).toBe(20);
            expect(result[flowKey]).toBeLessThanOrEqual(
                getSourceCapacity(graph, "S")
            );
            expect(result[flowKey]).toBeLessThanOrEqual(
                getSinkCapacity(graph, "T")
            );
        });

        test("handles different resource capacities and consumer paths", () => {
            const graph = {
                S: [
                    { node: "Small", capacity: 3 },
                    { node: "Large", capacity: 12 }
                ],
                Small: [{ node: "T", capacity: 3 }],
                Large: [{ node: "T", capacity: 8 }],
                T: []
            };

            const result = allocate(graph, "S", "T");

            expect(result[flowKey]).toBe(11);
            expect(result[flowKey]).toBeLessThanOrEqual(11);
            expectAllocationResult(result, flowKey);
        });

        test("does not allocate through disconnected resources", () => {
            const graph = {
                S: [{ node: "A", capacity: 10 }],
                A: [],
                Unused: [{ node: "T", capacity: 100 }],
                T: []
            };

            const result = allocate(graph, "S", "T");

            expect(result[flowKey]).toBe(0);
            expectAllocationResult(result, flowKey);
        });

        test("ignores zero-capacity paths while using positive paths", () => {
            const graph = {
                S: [
                    { node: "Zero", capacity: 0 },
                    { node: "Positive", capacity: 5 }
                ],
                Zero: [{ node: "T", capacity: 100 }],
                Positive: [{ node: "T", capacity: 4 }],
                T: []
            };

            const result = allocate(graph, "S", "T");

            expect(result[flowKey]).toBe(4);
            expectAllocationResult(result, flowKey);
        });

        test("does not produce flow from negative capacities", () => {
            const graph = {
                S: [{ node: "A", capacity: -5 }],
                A: [{ node: "T", capacity: 10 }],
                T: []
            };

            const result = allocate(graph, "S", "T");

            expect(result[flowKey]).toBe(0);
            expectAllocationResult(result, flowKey);
        });
    }
);

test("Ford-Fulkerson uses residual capacity to find the maximum flow", () => {
    const graph = {
        S: [
            { node: "A", capacity: 10 },
            { node: "B", capacity: 10 }
        ],
        A: [
            { node: "B", capacity: 10 },
            { node: "T", capacity: 10 }
        ],
        B: [{ node: "T", capacity: 10 }],
        T: []
    };

    const result = fordFulkerson(graph, "S", "T");

    expect(result.maxFlow).toBe(20);
    expect(result.operations).toBeGreaterThan(0);
});

test("Greedy Bottleneck chooses the highest-bottleneck path deterministically", () => {
    const graph = {
        S: [
            { node: "Narrow", capacity: 4 },
            { node: "Wide", capacity: 8 }
        ],
        Narrow: [{ node: "T", capacity: 4 }],
        Wide: [{ node: "T", capacity: 6 }],
        T: []
    };

    const result = greedyBottleneck(graph, "S", "T");

    expect(result.totalFlow).toBe(10);
    expect(result.operations).toBeGreaterThan(0);
});
