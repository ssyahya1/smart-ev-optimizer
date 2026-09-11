// Dijkstra's Algorithm
// Finds the shortest weighted path.

export const dijkstra = (
    graph,
    startNode,
    targetNode
) => {

    const distances = {};
    const previous = {};

    const unvisited = new Set(
        Object.keys(graph)
    );

    let operations = 0;

    for (const node of unvisited) {

        distances[node] = Infinity;
        previous[node] = null;
    }

    distances[startNode] = 0;

    while (unvisited.size > 0) {

        let currentNode = null;
        let shortestDistance = Infinity;

        for (const node of unvisited) {

            operations++;

            if (
                distances[node] <
                shortestDistance
            ) {

                shortestDistance =
                    distances[node];

                currentNode = node;
            }
        }

        if (
            currentNode === null ||
            distances[currentNode] === Infinity
        ) {
            break;
        }

        unvisited.delete(currentNode);

        if (currentNode === targetNode) {
            break;
        }

        const neighbors =
            graph[currentNode] || [];

        for (const edge of neighbors) {

            operations++;

            const neighbor =
                edge.node;

            const weight =
                Number(edge.weight);

            const newDistance =
                distances[currentNode] +
                weight;

            if (
                newDistance <
                distances[neighbor]
            ) {

                distances[neighbor] =
                    newDistance;

                previous[neighbor] =
                    currentNode;
            }
        }
    }

    if (
        distances[targetNode] === undefined ||
        distances[targetNode] === Infinity
    ) {

        return {
            path: [],
            distance: null,
            operations
        };
    }

    const path = [];

    let currentNode = targetNode;

    while (currentNode !== null) {

        path.push(currentNode);

        currentNode =
            previous[currentNode];
    }

    path.reverse();

    return {
        path,
        distance: distances[targetNode],
        operations
    };
};