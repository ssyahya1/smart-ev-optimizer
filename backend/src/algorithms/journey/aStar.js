// A* Search Algorithm
// Finds a low-cost path using:
// f(n) = g(n) + h(n)
//
// g(n) = actual cost from start
// h(n) = estimated cost to target

export const aStar = (
    graph,
    startNode,
    targetNode,
    heuristic
) => {

    const openSet = [startNode];

    const cameFrom = {};

    const gScore = {};
    const fScore = {};

    let operations = 0;

    for (const node of Object.keys(graph)) {

        gScore[node] = Infinity;
        fScore[node] = Infinity;
    }

    gScore[startNode] = 0;

    fScore[startNode] =
        heuristic(startNode, targetNode);

    while (openSet.length > 0) {

        let currentNode = openSet[0];

        for (const node of openSet) {

            operations++;

            if (
                fScore[node] <
                fScore[currentNode]
            ) {
                currentNode = node;
            }
        }

        if (currentNode === targetNode) {

            const path = [];

            let current = currentNode;

            while (current !== undefined) {

                path.push(current);

                current = cameFrom[current];
            }

            path.reverse();

            return {
                path,
                distance: gScore[targetNode],
                operations
            };
        }

        const index =
            openSet.indexOf(currentNode);

        openSet.splice(index, 1);

        const neighbors =
            graph[currentNode] || [];

        for (const edge of neighbors) {

            operations++;

            const neighbor = edge.node;
            const weight = Number(edge.weight);

            const tentativeGScore =
                gScore[currentNode] + weight;

            if (
                tentativeGScore <
                gScore[neighbor]
            ) {

                cameFrom[neighbor] =
                    currentNode;

                gScore[neighbor] =
                    tentativeGScore;

                fScore[neighbor] =
                    tentativeGScore +
                    heuristic(
                        neighbor,
                        targetNode
                    );

                if (
                    !openSet.includes(neighbor)
                ) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    return {
        path: [],
        distance: null,
        operations
    };
};