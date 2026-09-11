
//
// Greedy Bottleneck Resource Allocation
//
// Repeatedly finds the available path from source
// to sink with the HIGHEST bottleneck capacity.
//
// Bottleneck capacity of a path:
// minimum edge capacity on that path.
//
// The algorithm then sends that bottleneck amount
// through the selected path and updates the
// remaining capacities.
//

export const greedyBottleneck = (
    graph,
    source,
    sink
) => {

    const residualGraph = {};

    let operations = 0;
    let totalFlow = 0;


    // --------------------------------------------------
    // Create residual capacity graph
    // --------------------------------------------------

    for (const node of Object.keys(graph)) {

        residualGraph[node] = {};

        for (const edge of graph[node]) {

            residualGraph[node][edge.node] =
                Number(edge.capacity);
        }
    }


    // --------------------------------------------------
    // Find the path with the highest bottleneck
    // --------------------------------------------------

    const findMaximumBottleneckPath = () => {

        const bestCapacity = {};
        const parent = {};
        const visited = new Set();

        for (const node of Object.keys(residualGraph)) {
            bestCapacity[node] = 0;
        }

        bestCapacity[source] = Infinity;


        while (true) {

            let currentNode = null;
            let highestCapacity = 0;


            // Find unvisited node with
            // highest bottleneck capacity.
            for (const node of Object.keys(residualGraph)) {

                operations++;

                if (
                    !visited.has(node) &&
                    bestCapacity[node] > highestCapacity
                ) {

                    highestCapacity =
                        bestCapacity[node];

                    currentNode = node;
                }
            }


            // No reachable node remains.
            if (currentNode === null) {
                break;
            }


            visited.add(currentNode);


            // Sink reached.
            if (currentNode === sink) {
                break;
            }


            const neighbors =
                residualGraph[currentNode] || {};


            for (const neighbor of Object.keys(neighbors)) {

                operations++;

                const capacity =
                    residualGraph[currentNode][neighbor];

                if (
                    capacity <= 0 ||
                    visited.has(neighbor)
                ) {
                    continue;
                }


                // Bottleneck of the new path.
                const candidateCapacity =
                    Math.min(
                        bestCapacity[currentNode],
                        capacity
                    );


                // Keep the path only if it provides
                // a better bottleneck.
                if (
                    candidateCapacity >
                    bestCapacity[neighbor]
                ) {

                    bestCapacity[neighbor] =
                        candidateCapacity;

                    parent[neighbor] =
                        currentNode;
                }
            }
        }


        if (
            !visited.has(sink)
        ) {
            return null;
        }


        return {
            parent,
            pathFlow: bestCapacity[sink]
        };
    };


    // --------------------------------------------------
    // Repeatedly select the maximum-bottleneck path
    // --------------------------------------------------

    while (true) {

        const result =
            findMaximumBottleneckPath();


        if (result === null) {
            break;
        }


        const {
            parent,
            pathFlow
        } = result;


        // --------------------------------------------------
        // Update residual capacities
        // --------------------------------------------------

        let currentNode = sink;


        while (currentNode !== source) {

            const previousNode =
                parent[currentNode];


            residualGraph[previousNode][currentNode] -=
                pathFlow;


            currentNode =
                previousNode;
        }


        totalFlow += pathFlow;
    }


    return {
        totalFlow,
        operations
    };
};
