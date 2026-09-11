import { describe, expect, test } from "vitest";
import { bfs } from "./bfs.js";
import { dijkstra } from "./di jkstra.js";

const expectBfsPathIsValid = (result, graph, start, target) => {
    expect(result.path[0]).toBe(start);
    expect(result.path[result.path.length - 1]).toBe(target);
    expect(result.distance).toBe(result.path.length - 1);

    for (let index = 0; index < result.path.length - 1; index++) {
        expect(graph[result.path[index]]).toContain(
            result.path[index + 1]
        );
    }
};

const expectDijkstraPathIsValid = (result, graph, start, target) => {
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

describe("bfs", () => {
    test("finds a normal reachable path", () => {
        const graph = {
            A: ["B"],
            B: ["C"],
            C: []
        };

        const result = bfs(graph, "A", "C");

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(2);
        expectBfsPathIsValid(result, graph, "A", "C");
    });

    test("returns the source when source equals destination", () => {
        const result = bfs({ A: ["B"], B: [] }, "A", "A");

        expect(result.path).toEqual(["A"]);
        expect(result.distance).toBe(0);
    });

    test("returns no path for an unreachable destination", () => {
        const result = bfs(
            { A: ["B"], B: [], C: [] },
            "A",
            "C"
        );

        expect(result.path).toEqual([]);
        expect(result.distance).toBeNull();
    });

    test("handles missing source and destination nodes", () => {
        const graph = { A: ["B"], B: [] };

        expect(bfs(graph, "Missing", "B")).toMatchObject({
            path: [],
            distance: null
        });
        expect(bfs(graph, "A", "Missing")).toMatchObject({
            path: [],
            distance: null
        });
    });

    test("handles empty graphs and preserves the source shortcut", () => {
        expect(bfs({}, "A", "B")).toMatchObject({
            path: [],
            distance: null
        });
        expect(bfs({}, "A", "A")).toMatchObject({
            path: ["A"],
            distance: 0
        });
    });

    test("handles cycles without revisiting nodes", () => {
        const graph = {
            A: ["B"],
            B: ["A", "C"],
            C: ["B", "D"],
            D: []
        };

        const result = bfs(graph, "A", "D");

        expect(result.path).toEqual(["A", "B", "C", "D"]);
        expectBfsPathIsValid(result, graph, "A", "D");
    });

    test("chooses a shortest path by edge count among multiple paths", () => {
        const graph = {
            A: ["B", "D"],
            B: ["C"],
            D: ["C"],
            C: []
        };

        const result = bfs(graph, "A", "C");

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(2);
        expectBfsPathIsValid(result, graph, "A", "C");
    });
});

describe("dijkstra", () => {
    test("finds a normal reachable path with minimum weighted cost", () => {
        const graph = {
            A: [
                { node: "B", weight: 2 },
                { node: "C", weight: 5 }
            ],
            B: [{ node: "C", weight: 1 }],
            C: []
        };

        const result = dijkstra(graph, "A", "C");

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(3);
        expectDijkstraPathIsValid(result, graph, "A", "C");
    });

    test("returns the source with zero cost when source equals destination", () => {
        const result = dijkstra(
            { A: [{ node: "B", weight: 2 }], B: [] },
            "A",
            "A"
        );

        expect(result.path).toEqual(["A"]);
        expect(result.distance).toBe(0);
    });

    test("returns no path for an unreachable destination", () => {
        const result = dijkstra(
            { A: [{ node: "B", weight: 2 }], B: [], C: [] },
            "A",
            "C"
        );

        expect(result.path).toEqual([]);
        expect(result.distance).toBeNull();
    });

    test("handles missing source and destination nodes", () => {
        const graph = {
            A: [{ node: "B", weight: 2 }],
            B: []
        };

        expect(dijkstra(graph, "Missing", "B")).toMatchObject({
            path: [],
            distance: null
        });
        expect(dijkstra(graph, "A", "Missing")).toMatchObject({
            path: [],
            distance: null
        });
    });

    test("handles empty graphs for distinct source and destination nodes", () => {
        expect(dijkstra({}, "A", "B")).toMatchObject({
            path: [],
            distance: null
        });
    });

    test("handles cycles with non-negative weights", () => {
        const graph = {
            A: [{ node: "B", weight: 1 }],
            B: [
                { node: "A", weight: 1 },
                { node: "C", weight: 2 }
            ],
            C: []
        };

        const result = dijkstra(graph, "A", "C");

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(3);
        expectDijkstraPathIsValid(result, graph, "A", "C");
    });

    test("supports zero-weight edges", () => {
        const graph = {
            A: [
                { node: "B", weight: 0 },
                { node: "C", weight: 5 }
            ],
            B: [{ node: "C", weight: 2 }],
            C: []
        };

        const result = dijkstra(graph, "A", "C");

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(2);
        expectDijkstraPathIsValid(result, graph, "A", "C");
    });

    test("processes a simple negative edge according to current behavior", () => {
        const graph = {
            A: [{ node: "B", weight: -2 }],
            B: [{ node: "C", weight: 3 }],
            C: []
        };

        const result = dijkstra(graph, "A", "C");

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(1);
        expectDijkstraPathIsValid(result, graph, "A", "C");
    });

    test("selects the least-cost path among multiple weighted paths", () => {
        const graph = {
            A: [
                { node: "B", weight: 1 },
                { node: "D", weight: 4 }
            ],
            B: [{ node: "C", weight: 2 }],
            D: [{ node: "C", weight: 1 }],
            C: []
        };

        const result = dijkstra(graph, "A", "C");

        expect(result.path).toEqual(["A", "B", "C"]);
        expect(result.distance).toBe(3);
        expectDijkstraPathIsValid(result, graph, "A", "C");
    });
});