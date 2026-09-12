import { spawn } from "node:child_process";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import request from "supertest";

const testPort = 5102;
const baseUrl = `http://127.0.0.1:${testPort}`;
const testEmail = `security-test-${Date.now()}@example.test`;
const testPassword = "SecurityTestPassword123!";

let backendProcess;
let api;

const waitForBackend = () => new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
        reject(new Error("Security test backend did not start in time"));
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
});

afterAll(() => {
    if (backendProcess && !backendProcess.killed) {
        backendProcess.kill();
    }
});

describe("backend security and authentication", () => {
    test("registers a valid user", async () => {
        const response = await api.post("/api/auth/register").send({
            name: "Security Test User",
            email: testEmail,
            password: testPassword
        });

        expect(response.status).toBe(201);
        expect(response.body.user).toMatchObject({
            name: "Security Test User",
            email: testEmail,
            role: "user"
        });
        expect(response.body.user.password).toBeUndefined();
        expect(response.body.user.password_hash).toBeUndefined();
    });

    test("rejects invalid and missing registration data", async () => {
        const invalid = await request(baseUrl)
            .post("/api/auth/register")
            .send({ name: "X", email: "invalid-email", password: "short" });
        const missing = await request(baseUrl)
            .post("/api/auth/register")
            .send({ email: `missing-${Date.now()}@example.test` });

        expect(invalid.status).toBe(400);
        expect(invalid.body.message).toBe("Validation Failed");
        expect(missing.status).toBe(400);
        expect(missing.body.message).toBe("Validation Failed");
    });

    test("rejects duplicate registration", async () => {
        const response = await request(baseUrl)
            .post("/api/auth/register")
            .send({
                name: "Security Test User",
                email: testEmail,
                password: testPassword
            });

        expect(response.status).toBe(409);
    });

    test("logs in successfully and delivers an HTTP-only cookie JWT", async () => {
        const response = await api.post("/api/auth/login").send({
            email: testEmail,
            password: testPassword
        });
        const cookies = response.headers["set-cookie"] || [];

        expect(response.status).toBe(200);
        expect(response.body.user).toMatchObject({
            email: testEmail,
            role: "user"
        });
        expect(response.body.user.password).toBeUndefined();
        expect(response.body.user.password_hash).toBeUndefined();
        expect(cookies.some((cookie) => cookie.startsWith("ev_optimizer_token=")))
            .toBe(true);
        expect(cookies.some((cookie) => cookie.startsWith("ev_optimizer_refresh_token=")))
            .toBe(true);
        expect(cookies.some((cookie) => /HttpOnly/i.test(cookie))).toBe(true);
    });

    test("refreshes access authentication and rotates the refresh token", async () => {
        const firstRefresh = await api.post("/api/auth/refresh");
        const secondRefresh = await api.post("/api/auth/refresh");
        const me = await api.get("/api/auth/me");

        expect(firstRefresh.status).toBe(200);
        expect(secondRefresh.status).toBe(200);
        expect(me.status).toBe(200);
    });

    test("rejects an invalid password", async () => {
        const response = await request(baseUrl).post("/api/auth/login").send({
            email: testEmail,
            password: "WrongSecurityPassword123!"
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    });

    test("rejects a nonexistent user login", async () => {
        const response = await request(baseUrl).post("/api/auth/login").send({
            email: `unknown-${Date.now()}@example.test`,
            password: testPassword
        });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    });

    test("rejects protected access without authentication", async () => {
        const response = await request(baseUrl).get("/api/auth/me");

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Access token required");
    });

    test("rejects invalid and malformed JWT cookies", async () => {
        const invalid = await request(baseUrl)
            .get("/api/auth/me")
            .set("Cookie", "ev_optimizer_token=invalid.signature.value");
        const malformed = await request(baseUrl)
            .get("/api/auth/me")
            .set("Cookie", "ev_optimizer_token=not-a-jwt");

        expect(invalid.status).toBe(401);
        expect(invalid.body.message).toBe("Invalid or expired token");
        expect(malformed.status).toBe(401);
        expect(malformed.body.message).toBe("Invalid or expired token");
    });

    test("allows authenticated access with the user's correct role", async () => {
        const me = await api.get("/api/auth/me");
        const protectedResource = await api.get("/api/vehicles");

        expect(me.status).toBe(200);
        expect(me.body).toMatchObject({ role: "user" });
        expect(me.body.password).toBeUndefined();
        expect(protectedResource.status).toBe(200);
        expect(protectedResource.body.vehicles).toEqual(expect.any(Array));
    });

    test("denies a user role from admin-only endpoints", async () => {
        const adminTest = await api.get("/api/auth/admin-test");
        const adminCreation = await api.post("/api/auth/admin").send({
            name: "Denied Admin",
            email: `denied-admin-${Date.now()}@example.test`,
            password: testPassword
        });

        expect(adminTest.status).toBe(403);
        expect(adminTest.body.message).toBe("Access denied");
        expect(adminCreation.status).toBe(403);
    });

    test("supports /api/auth/me with valid authentication", async () => {
        const response = await api.get("/api/auth/me");

        expect(response.status).toBe(200);
        expect(response.body.id).toEqual(expect.any(Number));
        expect(response.body.role).toBe("user");
        expect(response.body.password_hash).toBeUndefined();
    });

    test("clears authentication on logout", async () => {
        const logout = await api.post("/api/auth/logout");
        const afterLogout = await api.get("/api/auth/me");
        const afterRefreshLogout = await api.post("/api/auth/refresh");

        expect(logout.status).toBe(200);
        expect(afterLogout.status).toBe(401);
        expect(afterLogout.body.message).toBe("Access token required");
        expect(afterRefreshLogout.status).toBe(401);
        expect(afterRefreshLogout.body.message).toBe("Refresh token required");

        const login = await api.post("/api/auth/login").send({
            email: testEmail,
            password: testPassword
        });
        expect(login.status).toBe(200);
    });

    test("does not expose the removed database debug endpoint", async () => {
        const response = await request(baseUrl).get("/api/test-db");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            message: "Route not found"
        });
    });
});