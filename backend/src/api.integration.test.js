import { spawn } from "node:child_process";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import request from "supertest";

const testPort = 5101;
const baseUrl = `http://127.0.0.1:${testPort}`;
const testEmail = `api-test-${Date.now()}@example.test`;
const testPassword = "ApiTestPassword123!";

let backendProcess;
let api;
let vehicleId;
let chargingBayId;
let gridSlotId;
let chargingSessionId;

const vehiclePayload = {
    vehicle_number: `API-TEST-${Date.now()}`,
    arrival_time: "2026-09-11T08:00:00",
    initial_soc: 25,
    battery_capacity_kwh: 80,
    priority: "High",
    deadline: "2026-09-11T12:00:00"
};

const bayPayload = {
    bay_number: `API-BAY-${Date.now()}`,
    charger_type: "DC",
    max_power_kw: 150,
    status: "available"
};

const waitForBackend = () => new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
        reject(new Error("Backend did not start within the test timeout"));
    }, 15000);

    const onData = (chunk) => {
        output += chunk.toString();
        if (output.includes(`EV Optimizer API running on port ${testPort}`)) {
            clearTimeout(timeout);
            backendProcess.stdout.off("data", onData);
            resolve();
        }
    };

    backendProcess.stdout.on("data", onData);
    backendProcess.once("error", (error) => {
        clearTimeout(timeout);
        reject(error);
    });
});

beforeAll(async () => {
    backendProcess = spawn(process.execPath, ["src/app.js"], {
        cwd: process.cwd(),
        env: { ...process.env, PORT: String(testPort) },
        stdio: ["ignore", "pipe", "ignore"]
    });

    await waitForBackend();
    api = request.agent(baseUrl);

    const registration = await api.post("/api/auth/register").send({
        name: "API Test User",
        email: testEmail,
        password: testPassword
    });
    expect(registration.status).toBe(201);

    const login = await api.post("/api/auth/login").send({
        email: testEmail,
        password: testPassword
    });
    expect(login.status).toBe(200);
});

afterAll(async () => {
    if (api) {
        if (chargingSessionId) {
            await api.delete(`/api/charging-sessions/${chargingSessionId}`);
        }
        if (vehicleId) {
            await api.delete(`/api/vehicles/${vehicleId}`);
        }
        if (chargingBayId) {
            await api.delete(`/api/charging-bays/${chargingBayId}`);
        }
        if (gridSlotId) {
            await api.delete(`/api/grid-slots/${gridSlotId}`);
        }
    }

    if (backendProcess && !backendProcess.killed) {
        backendProcess.kill();
    }
});

describe("Express API integration", () => {
    test("returns root and health responses", async () => {
        const root = await request(baseUrl).get("/");
        const health = await request(baseUrl).get("/api/health");

        expect(root.status).toBe(200);
        expect(root.body).toEqual({
            success: true,
            message: "Smart EV Optimizer API is running"
        });
        expect(health.status).toBe(200);
        expect(health.body).toMatchObject({
            success: true,
            service: "smart-ev-optimizer-backend",
            status: "healthy"
        });
        expect(health.body.timestamp).toEqual(expect.any(String));
    });

    test("registers, logs in, authenticates, and logs out a user", async () => {
        const me = await api.get("/api/auth/me");
        expect(me.status).toBe(200);
        expect(me.body).toMatchObject({ role: "user" });
        expect(me.body.id).toEqual(expect.any(Number));

        const logout = await api.post("/api/auth/logout");
        expect(logout.status).toBe(200);

        expect((await api.get("/api/vehicles")).status).toBe(401);

        const relogin = await api.post("/api/auth/login").send({
            email: testEmail,
            password: testPassword
        });
        expect(relogin.status).toBe(200);
        expect(relogin.body.user).toMatchObject({ email: testEmail, role: "user" });
    });

    test("rejects invalid registration, login, and duplicate-user requests", async () => {
        const invalidRegistration = await request(baseUrl)
            .post("/api/auth/register")
            .send({ name: "A", email: "bad", password: "short" });
        const invalidLogin = await request(baseUrl)
            .post("/api/auth/login")
            .send({ email: "bad", password: "short" });
        const duplicate = await request(baseUrl)
            .post("/api/auth/register")
            .send({ name: "API Test User", email: testEmail, password: testPassword });
        const wrongPassword = await request(baseUrl)
            .post("/api/auth/login")
            .send({ email: testEmail, password: "WrongPassword123!" });

        expect(invalidRegistration.status).toBe(400);
        expect(invalidLogin.status).toBe(400);
        expect(duplicate.status).toBe(409);
        expect(wrongPassword.status).toBe(401);
    });

    test("rejects protected requests without or with an invalid token", async () => {
        const noToken = await request(baseUrl).get("/api/vehicles");
        const invalidToken = await request(baseUrl)
            .get("/api/vehicles")
            .set("Cookie", "ev_optimizer_token=invalid-token");

        expect(noToken.status).toBe(401);
        expect(noToken.body.message).toBe("Access token required");
        expect(invalidToken.status).toBe(401);
        expect(invalidToken.body.message).toBe("Invalid or expired token");
    });

    test("enforces role-based authorization", async () => {
        const adminTest = await api.get("/api/auth/admin-test");
        const adminCreation = await api.post("/api/auth/admin").send({
            name: "Unauthorized Admin",
            email: `unauthorized-${Date.now()}@example.test`,
            password: testPassword
        });

        expect(adminTest.status).toBe(403);
        expect(adminTest.body.message).toBe("Access denied");
        expect(adminCreation.status).toBe(403);
    });

    test("performs vehicle CRUD", async () => {
        const created = await api.post("/api/vehicles/registervehicle").send(vehiclePayload);
        const listed = await api.get("/api/vehicles");

        vehicleId = listed.body.vehicles.find(
            (vehicle) => vehicle.vehicle_number === vehiclePayload.vehicle_number
        ).id;

        const fetched = await api.get(`/api/vehicles/${vehicleId}`);
        const updated = await api.put(`/api/vehicles/${vehicleId}`).send({
            ...vehiclePayload,
            priority: "Emergency"
        });
        const deleted = await api.delete(`/api/vehicles/${vehicleId}`);

        expect(created.status).toBe(201);
        expect(created.body.vehicle).toMatchObject({ vehicle_number: vehiclePayload.vehicle_number });
        expect(fetched.status).toBe(200);
        expect(updated.status).toBe(200);
        expect(updated.body.vehicle.priority).toBe("Emergency");
        expect(deleted.status).toBe(200);
        expect((await api.get(`/api/vehicles/${vehicleId}`)).status).toBe(404);
        vehicleId = undefined;
    });

    test("validates vehicle request bodies", async () => {
        const response = await api.post("/api/vehicles/registervehicle").send({
            vehicle_number: "bad",
            initial_soc: -1
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation Failed");
    });

    test("performs charging-bay CRUD", async () => {
        const created = await api.post("/api/charging-bays").send(bayPayload);
        chargingBayId = created.body.chargingBay.id;

        const listed = await api.get("/api/charging-bays");
        const fetched = await api.get(`/api/charging-bays/${chargingBayId}`);
        const updated = await api.put(`/api/charging-bays/${chargingBayId}`).send({
            ...bayPayload,
            status: "maintenance"
        });
        const deleted = await api.delete(`/api/charging-bays/${chargingBayId}`);

        expect(created.status).toBe(201);
        expect(listed.body.chargingBays.some((bay) => bay.id === chargingBayId)).toBe(true);
        expect(fetched.status).toBe(200);
        expect(updated.body.chargingBay.status).toBe("maintenance");
        expect(deleted.status).toBe(200);
        expect((await api.get(`/api/charging-bays/${chargingBayId}`)).status).toBe(404);
        chargingBayId = undefined;
    });

    test("validates charging-bay request bodies", async () => {
        const response = await api.post("/api/charging-bays").send({
            bay_number: "",
            charger_type: "invalid",
            max_power_kw: 0
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation Failed");
    });

    test("performs grid-slot CRUD", async () => {
        const payload = {
            slot_time: `2026-09-11T${String((Date.now() % 10) + 10).padStart(2, "0")}:00:00`,
            max_capacity_kw: 200,
            electricity_price: 0.25,
            current_load_kw: 20
        };
        const created = await api.post("/api/grid-slots").send(payload);
        gridSlotId = created.body.gridSlot.id;

        const listed = await api.get("/api/grid-slots");
        const fetched = await api.get(`/api/grid-slots/${gridSlotId}`);
        const updated = await api.put(`/api/grid-slots/${gridSlotId}`).send({
            ...payload,
            current_load_kw: 40
        });
        const deleted = await api.delete(`/api/grid-slots/${gridSlotId}`);

        expect(created.status).toBe(201);
        expect(listed.body.gridSlots.some((slot) => slot.id === gridSlotId)).toBe(true);
        expect(fetched.status).toBe(200);
        expect(Number(updated.body.gridSlot.current_load_kw)).toBe(40);
        expect(deleted.status).toBe(200);
        expect((await api.get(`/api/grid-slots/${gridSlotId}`)).status).toBe(404);
        gridSlotId = undefined;
    });

    test("validates grid-slot request bodies", async () => {
        const response = await api.post("/api/grid-slots").send({
            max_capacity_kw: -1,
            electricity_price: -1
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation Failed");
    });

    test("performs charging-session CRUD with related resources", async () => {
        const vehicleResponse = await api.post("/api/vehicles/registervehicle").send({
            ...vehiclePayload,
            vehicle_number: `SESSION-${Date.now()}`
        });
        const vehicles = await api.get("/api/vehicles");
        vehicleId = vehicles.body.vehicles.find(
            (vehicle) => vehicle.vehicle_number === vehicleResponse.body.vehicle.vehicle_number
        ).id;

        const bayResponse = await api.post("/api/charging-bays").send({
            ...bayPayload,
            bay_number: `SESSION-BAY-${Date.now()}`
        });
        chargingBayId = bayResponse.body.chargingBay.id;

        const slotResponse = await api.post("/api/grid-slots").send({
            slot_time: "2026-09-11T23:00:00",
            max_capacity_kw: 300,
            electricity_price: 0.2,
            current_load_kw: 0
        });
        gridSlotId = slotResponse.body.gridSlot.id;

        const payload = {
            vehicle_id: vehicleId,
            charging_bay_id: chargingBayId,
            grid_slot_id: gridSlotId,
            start_time: "2026-09-11T10:00:00",
            end_time: null,
            power_kw: 50,
            energy_delivered_kwh: 0,
            status: "scheduled"
        };
        const created = await api.post("/api/charging-sessions").send(payload);
        const sessions = await api.get("/api/charging-sessions");
        chargingSessionId = sessions.body.chargingSessions.find(
            (session) => session.vehicle_id === vehicleId
        ).id;

        const fetched = await api.get(`/api/charging-sessions/${chargingSessionId}`);
        const updated = await api.put(`/api/charging-sessions/${chargingSessionId}`).send({
            ...payload,
            status: "charging"
        });
        const deleted = await api.delete(`/api/charging-sessions/${chargingSessionId}`);

        expect(created.status).toBe(201);
        expect(created.body.chargingSession.vehicle_id).toBe(vehicleId);
        expect(fetched.status).toBe(200);
        expect(updated.body.chargingSession.status).toBe("charging");
        expect(deleted.status).toBe(200);
        expect((await api.get(`/api/charging-sessions/${chargingSessionId}`)).status).toBe(404);
        chargingSessionId = undefined;
    });

    test("validates charging-session request bodies", async () => {
        const response = await api.post("/api/charging-sessions").send({
            vehicle_id: -1,
            power_kw: 0
        });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Validation Failed");
    });

    test("runs all optimization endpoints and validates their envelopes", async () => {
        const responses = await Promise.all([
            api.post("/api/assignment").send({
                vehicles: [{
                    id: 1,
                    priority: "Emergency",
                    battery_capacity_kwh: 80,
                    initial_soc: 25,
                    arrival_time: "2026-09-11T08:00:00",
                    deadline: "2026-09-11T12:00:00"
                }],
                chargingBays: [{ id: 1, status: "available", max_power_kw: 50 }]
            }),
            api.post("/api/scheduling").send({
                chargingJobs: [{
                    id: 1,
                    vehicle_id: 1,
                    start_time: "2026-09-11T08:00:00.000Z",
                    end_time: "2026-09-11T09:00:00.000Z",
                    deadline: "2026-09-11T10:00:00.000Z",
                    priority: "High"
                }]
            }),
            api.post("/api/power").send({
                vehicles: [{ id: 1, priority: "High", requested_power_kw: 20 }],
                availablePower: 15
            }),
            api.post("/api/routing").send({
                graph: { A: [{ node: "B", weight: 1 }], B: [] },
                source: "A",
                destination: "B"
            }),
            api.post("/api/journey").send({
                graph: { A: [{ node: "B", weight: 1 }], B: [] },
                source: "A",
                destination: "B",
                heuristic: { A: 1, B: 0 }
            }),
            api.post("/api/resource-allocation").send({
                graph: { S: [{ node: "T", capacity: 5 }], T: [] },
                source: "S",
                sink: "T"
            }),
            api.post("/api/benchmark").send({ datasetSize: 20 })
        ]);

        expect(responses.map((response) => response.status)).toEqual([
            200, 200, 200, 200, 200, 200, 200
        ]);
        expect(responses[0].body).toMatchObject({ success: true, greedy: expect.any(Object), priorityQueue: expect.any(Object) });
        expect(responses[1].body).toMatchObject({ success: true, greedy: expect.any(Object), dynamicProgramming: expect.any(Object) });
        expect(responses[2].body).toMatchObject({ success: true, maxHeap: expect.any(Object), roundRobin: expect.any(Object) });
        expect(responses[3].body).toMatchObject({ success: true, bfs: expect.any(Object), dijkstra: expect.any(Object) });
        expect(responses[4].body).toMatchObject({ success: true, aStar: expect.any(Object), bellmanFord: expect.any(Object) });
        expect(responses[5].body).toMatchObject({ success: true, fordFulkerson: expect.any(Object), greedyBottleneck: expect.any(Object) });
        expect(responses[6].body).toMatchObject({ success: true, datasetSize: 20 });
    });

    test("rejects invalid optimization bodies and unknown routes", async () => {
        const invalidResponses = await Promise.all([
            api.post("/api/assignment").send({ vehicles: "invalid", chargingBays: [] }),
            api.post("/api/scheduling").send({ chargingJobs: [] }),
            api.post("/api/power").send({ vehicles: [], availablePower: 0 }),
            api.post("/api/routing").send({ graph: {}, source: "", destination: "" }),
            api.post("/api/journey").send({ graph: {}, source: "", destination: "", heuristic: {} }),
            api.post("/api/resource-allocation").send({ graph: {}, source: "", sink: "" }),
            api.post("/api/benchmark").send({ datasetSize: 21 })
        ]);
        const notFound = await request(baseUrl).get("/api/does-not-exist");

        expect(invalidResponses.every((response) => response.status === 400)).toBe(true);
        expect(notFound.status).toBe(404);
        expect(notFound.body).toEqual({ success: false, message: "Route not found" });
    });
});