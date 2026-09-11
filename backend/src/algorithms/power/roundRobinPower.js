
// Round-Robin Dynamic Power Throttling
// Distributes available transformer power fairly
// among active EV charging requests.
//
// A minimum allocation threshold prevents
// unrealistic tiny charging allocations.

const MIN_ALLOCATION_KW = 5;

export const roundRobinPower = (
    vehicles,
    availablePower
) => {

    const queue = vehicles.map((vehicle) => ({
        ...vehicle,
        remainingPower:
            Number(vehicle.requested_power_kw)
    }));

    let remainingPower =
        Number(availablePower);

    let operations = 0;

    const allocations = [];

    while (
        queue.length > 0 &&
        remainingPower > 0
    ) {

        const currentVehicle =
            queue.shift();

        operations++;

        if (
            currentVehicle.remainingPower <= 0
        ) {
            continue;
        }

        /*
         * Divide the currently available power
         * fairly among the vehicles still waiting.
         *
         * +1 includes the current vehicle.
         */
        const fairShare =
            remainingPower /
            (queue.length + 1);

        let allocation = Math.min(
            currentVehicle.remainingPower,
            fairShare
        );

        /*
         * If the fair share becomes too small,
         * give the remaining power to the current
         * vehicle instead of repeatedly re-queuing it.
         *
         * This prevents an infinite loop.
         */
        if (
            allocation < MIN_ALLOCATION_KW
        ) {

            allocation = Math.min(
                currentVehicle.remainingPower,
                remainingPower
            );
        }

        allocations.push({
            vehicleId: currentVehicle.id,
            requestedPowerKw:
                Number(
                    currentVehicle.requestedPowerKw ??
                    currentVehicle.requested_power_kw
                ),
            allocatedPowerKw:
                Number(
                    allocation.toFixed(2)
                )
        });

        currentVehicle.remainingPower -=
            allocation;

        remainingPower -= allocation;

        operations++;

        /*
         * Re-queue the vehicle if it still
         * requires meaningful charging power.
         */
        if (
            currentVehicle.remainingPower >=
            MIN_ALLOCATION_KW &&
            remainingPower >= MIN_ALLOCATION_KW
        ) {

            queue.push(currentVehicle);
        }
    }

    return {
        allocations,

        remainingPowerKw:
            Number(
                remainingPower.toFixed(2)
            ),

        operations
    };
};
