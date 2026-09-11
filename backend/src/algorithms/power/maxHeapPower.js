export const maxHeapPower = (vehicles, availablePowerKw) => {

    const heap = [];
    const allocations = [];

    let operations = 0;


    // Add vehicle to max heap
    const insert = (vehicle) => {

        heap.push(vehicle);

        let index = heap.length - 1;

        while (index > 0) {

            const parent =
                Math.floor((index - 1) / 2);

            operations++;

            if (
                heap[parent].priorityValue >=
                heap[index].priorityValue
            ) {
                break;
            }

            [heap[parent], heap[index]] =
                [heap[index], heap[parent]];

            index = parent;
        }
    };


    // Remove highest-priority vehicle
    const extractMax = () => {

        if (heap.length === 0) {
            return null;
        }

        const max = heap[0];

        const last = heap.pop();

        if (heap.length > 0) {

            heap[0] = last;

            let index = 0;

            while (true) {

                const left =
                    index * 2 + 1;

                const right =
                    index * 2 + 2;

                let largest = index;


                if (
                    left < heap.length
                ) {

                    operations++;

                    if (
                        heap[left].priorityValue >
                        heap[largest].priorityValue
                    ) {
                        largest = left;
                    }
                }


                if (
                    right < heap.length
                ) {

                    operations++;

                    if (
                        heap[right].priorityValue >
                        heap[largest].priorityValue
                    ) {
                        largest = right;
                    }
                }


                if (largest === index) {
                    break;
                }


                [heap[index], heap[largest]] =
                    [heap[largest], heap[index]];

                index = largest;
            }
        }

        return max;
    };


    // Insert all vehicles
    for (const vehicle of vehicles) {
        insert(vehicle);
    }


    // Allocate available transformer power
    while (
        heap.length > 0 &&
        availablePowerKw > 0
    ) {

        const vehicle = extractMax();

        const requestedPower =
            Number(vehicle.requested_power_kw);

        const allocatedPower =
            Math.min(
                requestedPower,
                availablePowerKw
            );


        allocations.push({
            vehicleId: vehicle.id,
            requestedPowerKw: requestedPower,
            allocatedPowerKw: allocatedPower
        });


        availablePowerKw -= allocatedPower;
    }


    return {
        allocations,
        remainingPowerKw: availablePowerKw,
        operations
    };
};