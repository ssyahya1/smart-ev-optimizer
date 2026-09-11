import { spawnSync } from "node:child_process";
import { describe, expect, test } from "vitest";
import { aStar } from "./aStar.js";
import { bellmanFord } from "./bellmanFord.js";

const zeroHeuristic = () => 0;

const expectPathIsValid = (result, graph, start, target) => {
    expect(result.path[0]).toBe(start);
    expect(result.path[result.path.length - 1]).toBe(target);

    let distance = 0;

    for (let index = 0; index < result.path.length - 1; index++) {
        const edge = graph[result.path[index]].find(
            (candidate) => candidate.node === result.path[index + 1]
        );

        expect(edge).toBeDefined();
        distance += Number(edge.weight);
    }

    expect(result.distance).toBe(distance);
};

describe("aStar", () => {
    test("finds a normal reachable path", () => {
        const graph = {
            A: [{ node: "B", weight: 2 }],
            B: [{ node: "C", weight: 3 }],
            C: []
        };

        const result = aStar(graph, "A", "C", zeroHeuristic);

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(5);
        expectPathIsValid(result, graph, "A", "C");
    });

    test("returns the start when start equals destination", () => {
        const result = aStar(
            { A: [{ node: "B", weight: 2 }], B: [] },
            "A",
            "A",
            zeroHeuristic
        );

        expect(result.path).toEqual(["A"]);
        expect(result.distance).toBe(0);
    });

    test("returns no path for an unreachable destination", () => {
        const result = aStar(
            { A: [{ node: "B", weight: 2 }], B: [], C: [] },
            "A",
            "C",
            zeroHeuristic
        );

        expect(result.path).toEqual([]);
        expect(result.distance).toBeNull();
    });

    test("handles missing start and destination nodes", () => {
        const graph = { A: [{ node: "B", weight: 2 }], B: [] };

        expect(aStar(graph, "Missing", "B", zeroHeuristic)).toMatchObject({
            path: [],
            distance: null
        });
        expect(aStar(graph, "A", "Missing", zeroHeuristic)).toMatchObject({
            path: [],
            distance: null
        });
    });

    test("returns no path for an empty graph with distinct endpoints", () => {
        const result = aStar({}, "A", "B", zeroHeuristic);

        expect(result.path).toEqual([]);
        expect(result.distance).toBeNull();
    });

    test("handles cycles and validates the returned path", () => {
        const graph = {
            A: [{ node: "B", weight: 1 }],
            B: [
                { node: "A", weight: 1 },
                { node: "C", weight: 2 }
            ],
            C: []
        };

        const result = aStar(graph, "A", "C", zeroHeuristic);

        expect(result.path).toEqual(["A", "B", "C"]);
        expectPathIsValid(result, graph, "A", "C");
    });

    test("selects the lowest-cost path among multiple paths", () => {
        const graph = {
            A: [
                { node: "B", weight: 2 },
                { node: "D", weight: 1 }
            ],
            B: [{ node: "C", weight: 5 }],
            D: [{ node: "C", weight: 1 }],
            C: []
        };

        const result = aStar(graph, "A", "C", zeroHeuristic);

        expect(result.path).toEqual(["A", "D", "C"]);
        expect(result.distance).toBe(2);
        expectPathIsValid(result, graph, "A", "C");
    });

    test("supports zero-weight edges", () => {
        const graph = {
            A: [
                { node: "B", weight: 0 },
                { node: "C", weight: 4 }
            ],
            B: [{ node: "C", weight: 2 }],
            C: []
        };

        const result = aStar(graph, "A", "C", zeroHeuristic);

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(2);
        expectPathIsValid(result, graph, "A", "C");
    });

    test("processes a simple negative edge according to current behavior", () => {
        const graph = {
            A: [{ node: "B", weight: -2 }],
            B: [{ node: "C", weight: 3 }],
            C: []
        };

        const result = aStar(graph, "A", "C", zeroHeuristic);

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(1);
        expectPathIsValid(result, graph, "A", "C");
    });

    test("handles a path with several intermediate nodes", () => {
        const graph = {
            A: [{ node: "B", weight: 1 }],
            B: [{ node: "C", weight: 1 }],
            C: [{ node: "D", weight: 1 }],
            D: [{ node: "E", weight: 1 }],
            E: []
        };

        const result = aStar(graph, "A", "E", zeroHeuristic);

        expect(result.path).toEqual(["A", "B", "C", "D", "E"]);
        expect(result.distance).toBe(4);
        expectPathIsValid(result, graph, "A", "E");
    });
});

describe("bellmanFord", () => {
    test("finds a normal reachable path", () => {
        const graph = {
            A: [{ node: "B", weight: 2 }],
            B: [{ node: "C", weight: 3 }],
            C: []
        };

        const result = bellmanFord(graph, "A", "C");

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(5);
        expect(result.negativeCycle).toBe(false);
        expectPathIsValid(result, graph, "A", "C");
    });

    test("returns the start when start equals destination", () => {
        const result = bellmanFord(
            { A: [{ node: "B", weight: 2 }], B: [] },
            "A",
            "A"
        );

        expect(result.path).toEqual(["A"]);
        expect(result.distance).toBe(0);
        expect(result.negativeCycle).toBe(false);
    });

    test("returns no path for an unreachable destination", () => {
        const result = bellmanFord(
            { A: [{ node: "B", weight: 2 }], B: [], C: [] },
            "A",
            "C"
        );

        expect(result.path).toEqual([]);
        expect(result.distance).toBeNull();
        expect(result.negativeCycle).toBe(false);
    });

    test("handles a missing start node", () => {
        const graph = {
            A: [{ node: "B", weight: 2 }],
            B: []
        };

        expect(bellmanFord(graph, "Missing", "B")).toMatchObject({
            path: [],
            distance: null,
            negativeCycle: false
        });
    });

    test("detects the current empty-graph non-termination safely", () => {
        const child = spawnSync(
            process.execPath,
            [
                "--input-type=module",
                "-e",
                "import { bellmanFord } from './src/algorithms/journey/bellmanFord.js'; bellmanFord({}, 'A', 'B');"
            ],
            {
                cwd: process.cwd(),
                encoding: "utf8",
                timeout: 500
            }
        );

        expect(child.error?.code).toBe("ETIMEDOUT");
    });

    test("handles zero-weight edges", () => {
        const graph = {
            A: [
                { node: "B", weight: 0 },
                { node: "C", weight: 4 }
            ],
            B: [{ node: "C", weight: 2 }],
            C: []
        };

        const result = bellmanFord(graph, "A", "C");

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(2);
        expectPathIsValid(result, graph, "A", "C");
    });

    test("supports negative edges without a negative cycle", () => {
        const graph = {
            A: [
                { node: "B", weight: 4 },
                { node: "C", weight: 5 }
            ],
            B: [{ node: "C", weight: -3 }],
            C: []
        };

        const result = bellmanFord(graph, "A", "C");

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(1);
        expect(result.negativeCycle).toBe(false);
        expectPathIsValid(result, graph, "A", "C");
    });

    test("detects a reachable negative-weight cycle", () => {
        const graph = {
            A: [{ node: "B", weight: 1 }],
            B: [
                { node: "C", weight: 1 },
                { node: "B", weight: -2 }
            ],
            C: []
        };

        const result = bellmanFord(graph, "A", "C");

        expect(result.path).toEqual([]);
        expect(result.distance).toBeNull();
        expect(result.negativeCycle).toBe(true);
    });

    test("selects the least-cost path among multiple paths", () => {
        const graph = {
            A: [
                { node: "B", weight: 2 },
                { node: "D", weight: 1 }
            ],
            B: [{ node: "C", weight: 5 }],
            D: [{ node: "C", weight: 1 }],
            C: []
        };

        const result = bellmanFord(graph, "A", "C");

        expect(result.path).toEqual(["A", "D", "C"]);
        expect(result.distance).toBe(2);
        expectPathIsValid(result, graph, "A", "C");
    });

    test("handles a path with several intermediate nodes", () => {
        const graph = {
            A: [{ node: "B", weight: 1 }],
            B: [{ node: "C", weight: 1 }],
            C: [{ node: "D", weight: 1 }],
            D: [{ node: "E", weight: 1 }],
            E: []
        };

        const result = bellmanFord(graph, "A", "E");

        expect(result.path).toEqual(["A", "B", "C", "D", "E"]);
        expect(result.distance).toBe(4);
        expectPathIsValid(result, graph, "A", "E");
    });
});