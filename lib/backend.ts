import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

export function backendUrl(path: string) {
    return new URL(path, process.env.BACKEND_URL ?? "http://127.0.0.1:4000");
}

function fetchWorkspace(path: string, cookie: string | null, body?: Record<string, unknown>) {
    const requestHeaders = new Headers();
    if (cookie) requestHeaders.set("cookie", cookie);
    if (body) requestHeaders.set("content-type", "application/json");

    return fetch(backendUrl(`/api/workspace${path}`), {
        cache: "no-store",
        redirect: "error",
        headers: requestHeaders,
        ...(body && { method: "POST", body: JSON.stringify(body) }),
    });
}

export async function hasWorkspaceSession() {
    const cookie = (await headers()).get("cookie");
    if (!cookie) return false;
    try {
        const response = await fetchWorkspace("/session", cookie);
        await response.text();
        return response.ok;
    } catch {
        return false;
    }
}

export async function requestBackend<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    const response = await fetchWorkspace(path, (await headers()).get("cookie"), body);
    if (!response.ok) {
        const error = await response.json().catch(() => null);
        if (response.status === 401 && error?.code === "SIGN_IN_REQUIRED") {
            redirect("/");
        }
        if (response.status === 403 && error?.code === "ADMIN_REQUIRED") {
            redirect("/dashboard");
        }
        throw new Error(error?.message ?? "The backend could not complete this request.");
    }

    if (response.status === 204) return undefined as T;
    return response.json();
}

export function mutate<T = void>(path: string, formData?: FormData) {
    const fields: Record<string, string | null> = Object.create(null);
    if (formData) {
        for (const [key, value] of formData) {
            if (!Object.hasOwn(fields, key)) {
                fields[key] = typeof value === "string" ? value : null;
            }
        }
    }
    return requestBackend<T>(path, fields);
}
