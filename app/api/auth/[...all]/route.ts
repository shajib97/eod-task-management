import { backendUrl } from "../../../../lib/backend";

async function proxyAuth(request: Request) {
    const { pathname, search } = new URL(request.url);
    const forwarded = new Headers();
    for (const name of [
        "accept", "content-type", "cookie", "origin", "referer",
        "sec-fetch-site", "sec-fetch-mode", "sec-fetch-dest", "user-agent",
    ]) {
        const value = request.headers.get(name);
        if (value) forwarded.set(name, value);
    }

    const response = await fetch(backendUrl(pathname + search), {
        method: request.method,
        headers: forwarded,
        body: request.method === "POST" ? await request.arrayBuffer() : undefined,
        cache: "no-store",
        redirect: "manual",
    });

    const outgoing = new Headers({ "cache-control": "no-store" });
    for (const name of ["content-type", "location", "retry-after"]) {
        const value = response.headers.get(name);
        if (value) outgoing.set(name, value);
    }
    for (const cookie of response.headers.getSetCookie()) {
        outgoing.append("set-cookie", cookie);
    }

    return new Response(response.body, {
        status: response.status,
        headers: outgoing,
    });
}

export const GET = proxyAuth;
export const POST = proxyAuth;
