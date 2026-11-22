import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { apiRequest, authAPI } from "../src/API/api.js";

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

test("protected requests refresh once and retry with cookies", async () => {
  let refreshCalls = 0;
  const protectedCalls = new Map();
  const observedCredentials = [];
  globalThis.fetch = async (url, options) => {
    observedCredentials.push(options.credentials);
    if (String(url).endsWith("/api/auth/refresh")) {
      refreshCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 15));
      return Response.json({ success: true, user: { id: "1", role: "customer" } });
    }

    const path = new URL(String(url)).pathname;
    const calls = (protectedCalls.get(path) || 0) + 1;
    protectedCalls.set(path, calls);
    if (calls === 1) return Response.json({ success: false, code: "ACCESS_TOKEN_EXPIRED" }, { status: 401 });
    return Response.json({ success: true, path });
  };

  const [one, two] = await Promise.all([
    apiRequest("/api/customer/one"),
    apiRequest("/api/customer/two"),
  ]);

  assert.equal(one.success, true);
  assert.equal(two.success, true);
  assert.equal(refreshCalls, 1);
  assert.deepEqual([...protectedCalls.values()], [2, 2]);
  assert.ok(observedCredentials.every((value) => value === "include"));
});

test("auth restoration and concurrent expired requests share one refresh", async () => {
  let refreshCalls = 0;
  let protectedCalls = 0;
  globalThis.fetch = async (url) => {
    if (String(url).endsWith("/api/auth/refresh")) {
      refreshCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 15));
      return Response.json({ success: true, user: { id: "driver-1", role: "driver" } });
    }
    protectedCalls += 1;
    return protectedCalls === 1
      ? Response.json({ success: false, code: "ACCESS_TOKEN_EXPIRED" }, { status: 401 })
      : Response.json({ success: true });
  };

  const [restored, parallelRestore, retried] = await Promise.all([
    authAPI.refresh(),
    authAPI.refresh(),
    apiRequest("/api/driver/profile"),
  ]);

  assert.equal(restored.user.role, "driver");
  assert.equal(parallelRestore.user.role, "driver");
  assert.equal(retried.success, true);
  assert.equal(refreshCalls, 1);
  assert.equal(protectedCalls, 2);
});

test("refresh failure notifies auth state listeners instead of retrying forever", async () => {
  let expiredEvents = 0;
  let resourceCalls = 0;
  globalThis.window = { dispatchEvent: (event) => { if (event.type === "routecargo:auth-expired") expiredEvents += 1; } };
  globalThis.fetch = async (url) => {
    if (String(url).endsWith("/api/auth/refresh")) {
      return Response.json({ success: false, code: "REFRESH_EXPIRED", message: "Please sign in again" }, { status: 401 });
    }
    resourceCalls += 1;
    return Response.json({ success: false }, { status: 401 });
  };

  await assert.rejects(apiRequest("/api/customer/private"), /Please sign in again/);
  assert.equal(resourceCalls, 1);
  assert.equal(expiredEvents, 1);
});

test("temporary refresh server failures do not mark the session expired", async () => {
  let expiredEvents = 0;
  globalThis.window = { dispatchEvent: (event) => { if (event.type === "routecargo:auth-expired") expiredEvents += 1; } };
  globalThis.fetch = async (url) => String(url).endsWith("/api/auth/refresh")
    ? Response.json({ success: false, message: "Service unavailable" }, { status: 503 })
    : Response.json({ success: false }, { status: 401 });

  await assert.rejects(apiRequest("/api/customer/private"), /Service unavailable/);
  assert.equal(expiredEvents, 0);
});

test("signin and signout errors never trigger a refresh attempt", async () => {
  let refreshCalls = 0;
  globalThis.fetch = async (url) => {
    if (String(url).endsWith("/api/auth/refresh")) refreshCalls += 1;
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  };

  await assert.rejects(authAPI.signin({ identifier: "user@example.com", password: "bad" }));
  await assert.rejects(authAPI.signout());
  assert.equal(refreshCalls, 0);
});
