"use client";

import { useState } from "react";
import { authClient } from "../lib/auth-client";

export default function SignOutButton() {
    const [pending, setPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSignOut() {
        if (pending) return;

        setPending(true);
        setErrorMessage("");

        try {
            const { error } = await authClient.signOut();

            if (error) {
                setErrorMessage("Could not sign out. Please try again.");
                return;
            }

            window.location.replace("/");
        } catch {
            setErrorMessage("Could not sign out. Please try again.");
        } finally {
            setPending(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={handleSignOut}
                disabled={pending}
                aria-label={pending ? "Signing out…" : "Sign out"}
                aria-busy={pending}
                title="Sign out"
                className="workspace-sign-out btn btn-square size-10 min-h-10 disabled:opacity-60"
            >
                {pending ? (
                    <span aria-hidden="true" className="loading loading-spinner loading-xs" />
                ) : (
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-5"
                    >
                        <path d="M14 7l5 5-5 5m5-5H9m3-8H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
                    </svg>
                )}
            </button>

            {errorMessage && (
                <p role="alert" className="mt-1 text-sm text-red-800">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}