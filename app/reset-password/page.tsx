"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { authClient } from "../../lib/auth-client";

function PasswordResetForm() {
    const params = useSearchParams();
    const token = params.get("token");
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState("");
    const [completed, setCompleted] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (pending) return;

        const data = new FormData(event.currentTarget);
        setMessage("");
        setPending(true);
        try {
            const { error } = token
                ? await authClient.resetPassword({ token, newPassword: String(data.get("password")) })
                : await authClient.requestPasswordReset({
                    email: String(data.get("email")).trim().toLowerCase(),
                    redirectTo: "/reset-password",
                });
            if (error) {
                setMessage(error.status === 429
                    ? "Too many attempts. Wait and try again."
                    : token ? "This reset link could not be used. Request a new link." : "Could not request a reset. Try again.");
                return;
            }
            setCompleted(true);
            setMessage(token
                ? "Password updated. Sign in with your new password."
                : "If your approved email has an account, check your inbox for a reset link.");
        } catch {
            setMessage("Could not connect to the password reset service. Try again.");
        } finally {
            setPending(false);
        }
    }

    return (
        <>
            {params.has("error") && !message && <p role="alert">This reset link has expired. Request a new one below.</p>}
            {message && <p role={completed ? "status" : "alert"} className="mt-4 text-sm">{message}</p>}
            {!completed && (
                <form method="post" onSubmit={submit} className="mt-5 space-y-4">
                    <label className="block font-medium">
                        {token ? "New password" : "Work email"}
                        <input
                            name={token ? "password" : "email"}
                            type={token ? "password" : "email"}
                            autoComplete={token ? "new-password" : "username"}
                            minLength={token ? 12 : undefined}
                            maxLength={token ? 128 : 254}
                            required
                            disabled={pending}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3"
                        />
                    </label>
                    <button type="submit" disabled={pending} className="w-full rounded-lg bg-[#ffcf00] px-4 py-3 font-semibold">
                        {pending ? "Submitting?" : token ? "Set password" : "Send reset link"}
                    </button>
                </form>
            )}
        </>
    );
}

export default function PasswordResetPage() {
    return (
        <main className="grid min-h-screen place-items-center bg-[#ffcf00] px-4 py-10 text-slate-900">
            <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <Suspense fallback={<p role="status">Loading password reset?</p>}>
                    <PasswordResetForm />
                </Suspense>
                <Link href="/" className="mt-5 block text-sm text-blue-700 hover:underline">Back to sign in</Link>
            </section>
        </main>
    );
}
