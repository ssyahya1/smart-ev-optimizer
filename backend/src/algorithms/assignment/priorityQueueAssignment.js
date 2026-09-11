// Priority Queue Charging Bay Assignment
// Uses a Binary Min-Heap to prioritize vehicles.
//
// Priority:
// Emergency = 1
// High      = 2
// Medium    = 3
// Low       = 4

const priorityRank = {
    Emergency: 1,
    High: 2,
    Medium: 3,
    Low: 4
};

export const priorityQueueAssignment = (
    vehicles,
    chargingBays
) => {

    const heap = [];

    const availableBays = chargingBays.filter(
        (bay) => bay.status === "available"
    );

    const assignments = [];
    const unassignedVehicles = [];

    let operations = 0;

    // Insert vehicle into Binary Min-Heap
    const insert = (vehicle) => {

        heap.push(vehicle);

        let index = heap.length - 1;

        while (index > 0) {

            const parent =
                Math.floor((index - 1) / 2);

            operations++;

            if (
                priorityRank[heap[parent].priority] <=
                priorityRank[heap[index].priority]
            ) {
                break;
            }

            [
                heap[parent],
                heap[index]
            ] = [
                heap[index],
                heap[parent]
            ];

            index = parent;
        }
    };

    // Remove highest-priority vehicle
    const extractMin = () => {

        if (heap.length === 0) {
            return null;
        }

        const minimum = heap[0];

        const last = heap.pop();

        if (heap.length > 0) {

            heap[0] = last;

            let index = 0;

            while (true) {

                const left =
                    index * 2 + 1;

                const right =
                    index * 2 + 2;

                let smallest = index;

                if (
                    left < heap.length
                ) {

                    operations++;

                    if (
                        priorityRank[
                            heap[left].priority
                        ] <
                        priorityRank[
                            heap[smallest].priority
                        ]
                    ) {
                        smallest = left;
                    }
                }

                if (
                    right < heap.length
                ) {

                    operations++;

                    if (
                        priorityRank[
                            heap[right].priority
                        ] <
                        priorityRank[
                            heap[smallest].priority
                        ]
                    ) {
                        smallest = right;
                    }
                }

                if (smallest === index) {
                    break;
                }

                [
                    heap[index],
                    heap[smallest]
                ] = [
                    heap[smallest],
                    heap[index]
                ];

                index = smallest;
            }
        }

        return minimum;
    };

    // Add all vehicles to the priority queue
    for (const vehicle of vehicles) {
        insert(vehicle);
    }

    // Process highest-priority vehicle first
    while (heap.length > 0) {

        const vehicle = extractMin();

        let bestBay = null;

        for (const bay of availableBays) {

            operations++;

            if (
                Number(bay.max_power_kw) >=
                Number(vehicle.required_power_kw)
            ) {

                if (
                    bestBay === null ||
                    Number(bay.max_power_kw) <
                    Number(bestBay.max_power_kw)
                ) {

                    bestBay = bay;
                }
            }
        }

        if (bestBay) {

            assignments.push({
                vehicleId: vehicle.id,
                bayId: bestBay.id
            });

            const bayIndex =
                availableBays.findIndex(
                    (bay) =>
                        bay.id === bestBay.id
                );

            availableBays.splice(
                bayIndex,
                1
            );

        } else {

            unassignedVehicles.push(
                vehicle.id
            );
        }
    }

    return {
        assignments,
        unassignedVehicles,
        operations
    };
};