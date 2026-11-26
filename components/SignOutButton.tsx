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
                className="btn btn-sm bg-white text-slate-900 disabled:opacity-60"
            >
                {pending ? "Signing out…" : "Sign out"}
            </button>

            {errorMessage && (
                <p role="alert" className="mt-1 text-sm text-red-800">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}