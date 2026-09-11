// Greedy Charging Bay Assignment


// Priority order for vehicles
const priorityRank = {
    Emergency: 1,
    High: 2,
    Medium: 3,
    Low: 4
};


export const greedyAssignment = (vehicles, chargingBays) => {

    // Copy arrays so the original data is not modified
    const sortedVehicles = [...vehicles];

    const availableBays = chargingBays.filter(
        (bay) => bay.status === "available"
    );

    // Higher-priority vehicles are processed first
    sortedVehicles.sort(
        (a, b) =>
            priorityRank[a.priority] -
            priorityRank[b.priority]
    );


    const assignments = [];
    const unassignedVehicles = [];

    let operations = 0;


    // Process every vehicle
    for (const vehicle of sortedVehicles) {

        let bestBay = null;

        // Look for the smallest suitable available bay
        for (const bay of availableBays) {

            operations++;

            // Bay must have enough charging power
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


        // Assign vehicle if a suitable bay was found
        if (bestBay) {

            assignments.push({
                vehicleId: vehicle.id,
                bayId: bestBay.id
            });

            // Remove the bay so it cannot be assigned again
            const bayIndex = availableBays.findIndex(
                (bay) => bay.id === bestBay.id
            );

            availableBays.splice(bayIndex, 1);

        } else {

            // No suitable bay available
            unassignedVehicles.push(vehicle.id);
        }
    }


    return {
        assignments,
        unassignedVehicles,
        operations
    };
};