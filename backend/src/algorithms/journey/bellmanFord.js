// Bellman-Ford Algorithm
// Finds shortest weighted paths and can also
// detect negative-weight cycles.

export const bellmanFord = (
    graph,
    startNode,
    targetNode
) => {

    const nodes = Object.keys(graph);

    const distances = {};
    const previous = {};

    let operations = 0;

    for (const node of nodes) {

        distances[node] = Infinity;
        previous[node] = null;
    }

    distances[startNode] = 0;

    for (
        let i = 0;
        i < nodes.length - 1;
        i++
    ) {

        let updated = false;

        for (const node of nodes) {

            const edges =
                graph[node] || [];

            for (const edge of edges) {

                operations++;

                const neighbor = edge.node;
                const weight = Number(edge.weight);

                if (
                    distances[node] !== Infinity &&
                    distances[node] + weight <
                    distances[neighbor]
                ) {

                    distances[neighbor] =
                        distances[node] + weight;

                    previous[neighbor] = node;

                    updated = true;
                }
            }
        }

        if (!updated) {
            break;
        }
    }

    // Negative cycle detection
    for (const node of nodes) {

        const edges =
            graph[node] || [];

        for (const edge of edges) {

            operations++;

            const neighbor = edge.node;
            const weight = Number(edge.weight);

            if (
                distances[node] !== Infinity &&
                distances[node] + weight <
                distances[neighbor]
            ) {

                return {
                    path: [],
                    distance: null,
                    operations,
                    negativeCycle: true
                };
            }
        }
    }

    if (
        distances[targetNode] === Infinity
    ) {

        return {
            path: [],
            distance: null,
            operations,
            negativeCycle: false
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
        operations,
        negativeCycle: false
    };
};