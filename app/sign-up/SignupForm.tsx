"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "../../lib/auth-client";

const inputClass =
    "w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-2 focus:outline-blue-600";

export default function SignupForm() {
    const [pending, setPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    async function handleSignup(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (pending) return;

        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") ?? "").trim();
        const email = String(formData.get("email") ?? "")
            .trim()
            .toLowerCase();
        const password = String(formData.get("password") ?? "");
        const confirmPassword = String(
            formData.get("confirmPassword") ?? ""
        );

        setErrorMessage("");

        if (!name) {
            setErrorMessage("Enter your name.");
            return;
        }

        if (password.length < 12 || password.length > 128) {
            setErrorMessage(
                "Use a password containing 12–128 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("The passwords do not match.");
            return;
        }

        setPending(true);

        try {
            const { error } = await authClient.signUp.email({
                name,
                email,
                password,
            });

            if (error) {
                if (error.status === 429) {
                    setErrorMessage(
                        "Too many attempts. Please wait and try again."
                    );
                } else {
                    setErrorMessage(
                        "Unable to register. Use your approved work email and check your details. If you already have an account, sign in."
                    );
                }

                return;
            }

            setSubmitted(true);
        } catch {
            setErrorMessage(
                "Could not connect to the registration service. Please try again."
            );
        } finally {
            setPending(false);
        }
    }

    if (submitted) {
        return (
            <div
                role="status"
                className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-slate-700"
            >
                <p className="font-semibold">
                    Registration request processed
                </p>

                <p className="mt-2">
                    If your work email is approved, check your inbox for a
                    verification link. Open it only if you requested this registration.
                </p>

                <p className="mt-2">
                    If you already have an account, this request does
                    not change its password.
                </p>
            </div>
        );
    }

    return (
        <form
            method="post"
            onSubmit={handleSignup}
            aria-busy={pending}
            className="mt-6"
        >
            <fieldset disabled={pending} className="space-y-4">
                <label className="block">
                    <span className="mb-1 block font-medium">
                        Full name
                    </span>

                    <input
                        name="name"
                        type="text"
                        autoComplete="name"
                        maxLength={120}
                        required
                        className={inputClass}
                    />
                </label>

                <label className="block">
                    <span className="mb-1 block font-medium">
                        Work email
                    </span>

                    <input
                        name="email"
                        type="email"
                        autoComplete="username"
                        maxLength={254}
                        required
                        className={inputClass}
                    />
                </label>

                <label className="block">
                    <span className="mb-1 block font-medium">
                        Password
                    </span>

                    <input
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        maxLength={128}
                        required
                        aria-describedby="password-help"
                        className={inputClass}
                    />

                    <span
                        id="password-help"
                        className="mt-1 block text-xs text-slate-500"
                    >
                        Use 12–128 characters.
                    </span>
                </label>

                <label className="block">
                    <span className="mb-1 block font-medium">
                        Confirm password
                    </span>

                    <input
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        minLength={12}
                        maxLength={128}
                        required
                        className={inputClass}
                    />
                </label>

                {errorMessage && (
                    <p
                        role="alert"
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                    >
                        {errorMessage}
                    </p>
                )}

                <button
                    type="submit"
                    className="w-full rounded-lg bg-[#ffcf00] px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {pending ? "Submitting…" : "Create account"}
                </button>
            </fieldset>
        </form>
    );
}