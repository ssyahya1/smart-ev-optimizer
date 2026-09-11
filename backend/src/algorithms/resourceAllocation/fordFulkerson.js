// Ford-Fulkerson Max Flow Algorithm
// Determines the maximum amount of charging power
// that can flow through a capacity-constrained network.

export const fordFulkerson = (
    graph,
    source,
    sink
) => {

    const residualGraph = {};

    let operations = 0;
    let maxFlow = 0;

    // Create residual graph
    for (const node of Object.keys(graph)) {

        residualGraph[node] = {};

        for (const edge of graph[node]) {

            residualGraph[node][edge.node] =
                Number(edge.capacity);
        }
    }

    const findPath = () => {

        const queue = [source];

        const parent = {};
        const visited = new Set();

        visited.add(source);

        while (queue.length > 0) {

            const currentNode =
                queue.shift();

            operations++;

            const neighbors =
                residualGraph[currentNode] || {};

            for (const neighbor of Object.keys(neighbors)) {

                operations++;

                if (
                    !visited.has(neighbor) &&
                    neighbors[neighbor] > 0
                ) {

                    visited.add(neighbor);

                    parent[neighbor] =
                        currentNode;

                    if (neighbor === sink) {

                        return parent;
                    }

                    queue.push(neighbor);
                }
            }
        }

        return null;
    };

    while (true) {

        const parent = findPath();

        if (parent === null) {
            break;
        }

        let pathFlow = Infinity;

        let currentNode = sink;

        while (currentNode !== source) {

            const previousNode =
                parent[currentNode];

            pathFlow = Math.min(
                pathFlow,
                residualGraph[previousNode][currentNode]
            );

            currentNode = previousNode;
        }

        currentNode = sink;

        while (currentNode !== source) {

            const previousNode =
                parent[currentNode];

            residualGraph[previousNode][currentNode] -=
                pathFlow;

            if (
                !residualGraph[currentNode]
            ) {
                residualGraph[currentNode] = {};
            }

            residualGraph[currentNode][previousNode] =
                (
                    residualGraph[currentNode][previousNode] ||
                    0
                ) + pathFlow;

            currentNode = previousNode;
        }

        maxFlow += pathFlow;
    }

    return {
        maxFlow,
        operations
    };
};