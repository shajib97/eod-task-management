import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { test } from "node:test";

test("home sign-in, workspace theme, response headers and trusted auth forwarding", { timeout: 20000 }, async (t) => {
    let authHeaders;
    const backend = createServer((request, response) => {
        if (request.url === "/api/auth/ok") authHeaders = request.headers;
        response.setHeader("content-type", "application/json");
        const path = request.url?.split("?")[0];
        const session = { user: { id: "fixture", name: "Fixture User", email: "user@example.test" }, role: "operator" };
        if (path === "/api/workspace/session" && !request.headers.cookie?.includes("fixture=session")) {
            response.statusCode = 401;
            response.end(JSON.stringify({ code: "SIGN_IN_REQUIRED" }));
            return;
        }
        const data = path === "/api/workspace/session" ? session
            : path === "/api/workspace/shifts/current" ? { date: "2026-11-27", name: "morning" }
            : path?.startsWith("/api/workspace/") ? [] : { ok: true };
        response.end(JSON.stringify(data));
    }).listen(0, "127.0.0.1");
    t.after(() => backend.close());
    await once(backend, "listening");
    const frontend = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "0", "--hostname", "127.0.0.1"], {
        windowsHide: true,
        env: { ...process.env, BACKEND_URL: `http://127.0.0.1:${backend.address().port}`, AUTH_PROXY_SECRET: "test-proxy-secret", AUTH_CLIENT_IP_HEADER: "x-test-ingress" },
    });
    t.after(() => frontend.kill());
    const base = await new Promise((resolve, reject) => {
        frontend.once("exit", code => reject(new Error(`Next.js exited early (${code}). Run npm run build first.`)));
        frontend.stdout.on("data", data => {
            const address = String(data).match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
            if (address) resolve(address);
        });
    });
    const home = await fetch(base);
    assert.equal(home.status, 200);
    assert.equal(home.headers.get("x-frame-options"), "DENY");
    assert.match(home.headers.get("content-security-policy"), /frame-ancestors 'none'/);
    assert.match(home.headers.get("strict-transport-security"), /max-age=/);
    const html = await home.text();
    assert.ok(html.includes("Work email") && html.includes('>Sign in</button>'));
    const signedIn = await fetch(base, { redirect: "manual", headers: { cookie: "fixture=session" } });
    if (signedIn.status === 307) assert.equal(signedIn.headers.get("location"), "/dashboard");
    else assert.match(await signedIn.text(), /NEXT_REDIRECT[^"]*dashboard|url=\/dashboard/);

    for (const [cookie, expected] of [
        ["fixture=session", "light"],
        ["fixture=session; eod-workspace-theme=dark", "dark"],
        ["fixture=session; eod-workspace-theme=invalid", "light"],
    ]) {
        const workspace = await fetch(base + "/dashboard", { headers: { cookie } });
        assert.equal(workspace.status, 200);
        const page = await workspace.text();
        assert.ok(page.includes(`data-theme="${expected}"`), `Expected ${expected} workspace theme.`);
        const themeSwitch = page.match(/<input\b[^>]*role="switch"[^>]*>/)?.[0];
        assert.ok(themeSwitch, "Expected the workspace theme switch.");
        assert.equal(/\bchecked=""/.test(themeSwitch), expected === "dark");
    }

    const signedOut = await fetch(base, { headers: { cookie: "eod-workspace-theme=dark" } });
    const signIn = await signedOut.text();
    assert.ok(signIn.includes('>Sign in</button>'));
    assert.ok(!signIn.includes('role="switch"'));

    assert.equal((await fetch(base + "/api/auth/ok")).status, 503);
    const auth = await fetch(base + "/api/auth/ok", { headers: {
        "x-test-ingress": "192.0.2.20", "x-forwarded-for": "192.0.2.99",
        "x-eod-client-ip": "192.0.2.99", "x-eod-auth-proxy-secret": "untrusted",
    } });
    assert.equal(auth.status, 200);
    assert.equal(authHeaders["x-eod-client-ip"], "192.0.2.20");
    assert.equal(authHeaders["x-eod-auth-proxy-secret"], "test-proxy-secret");
    assert.equal(authHeaders["x-forwarded-for"], undefined);
});
