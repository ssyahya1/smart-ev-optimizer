import { afterEach, describe, expect, test, vi } from "vitest";
import { apiRequest } from "./api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("apiRequest", () => {
  test("returns successful JSON responses with credentials", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await expect(apiRequest("/api/health")).resolves.toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/health"),
      expect.objectContaining({
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  test("throws the API error message for failed responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Validation failed" }),
    });

    await expect(apiRequest("/api/fail")).rejects.toThrow("Validation failed");
  });

  test("throws when the network request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network down"));

    await expect(apiRequest("/api/health")).rejects.toThrow("Network down");
  });

  test("surfaces authentication failures from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Access token required" }),
    });

    await expect(apiRequest("/api/protected")).rejects.toThrow(
      "Access token required"
    );
  });

  test("refreshes once and retries an unauthorized request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Access token required" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ message: "Token refreshed" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: { id: 1 } }),
      });

    await expect(apiRequest("/api/protected")).resolves.toEqual({ user: { id: 1 } });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain("/api/auth/refresh");
  });
});