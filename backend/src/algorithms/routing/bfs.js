// Breadth-First Search (BFS)
// Finds the shortest path based on the number of edges.

export const bfs = (graph, startNode, targetNode) => {

    const queue = [startNode];

    const visited = new Set();

    const previous = new Map();

    let operations = 0;

    visited.add(startNode);

    while (queue.length > 0) {

        const currentNode = queue.shift();

        operations++;

        if (currentNode === targetNode) {
            break;
        }

        const neighbors = graph[currentNode] || [];

        for (const neighbor of neighbors) {

            operations++;

            if (!visited.has(neighbor)) {

                visited.add(neighbor);

                previous.set(
                    neighbor,
                    currentNode
                );

                queue.push(neighbor);
            }
        }
    }

    if (!visited.has(targetNode)) {

        return {
            path: [],
            distance: null,
            operations
        };
    }

    const path = [];

    let currentNode = targetNode;

    while (currentNode !== undefined) {

        path.push(currentNode);

        currentNode =
            previous.get(currentNode);
    }

    path.reverse();

    return {
        path,
        distance: path.length - 1,
        operations
    };
};