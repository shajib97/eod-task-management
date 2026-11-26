import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

export function backendUrl(path: string) {
    return new URL(path, process.env.BACKEND_URL ?? "http://127.0.0.1:4000");
}

export async function requestBackend<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    const cookie = (await headers()).get("cookie");
    const requestHeaders = new Headers();
    if (cookie) requestHeaders.set("cookie", cookie);
    if (body) requestHeaders.set("content-type", "application/json");

    const response = await fetch(backendUrl(`/api/workspace${path}`), {
        cache: "no-store",
        redirect: "error",
        headers: requestHeaders,
        ...(body && { method: "POST", body: JSON.stringify(body) }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        if (response.status === 401 && error?.code === "SIGN_IN_REQUIRED") {
            redirect("/sign-in");
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
