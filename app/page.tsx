"use client";

import { useState, type FormEvent } from "react";

import Link from "next/link";
import EblLogo from "../components/EblLogo";
import { authClient } from "../lib/auth-client";

const inputClass =
    "w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-2 focus:outline-blue-600 disabled:opacity-60";

export default function Home() {
    const [pending, setPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSignIn(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (pending) return;

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "")
            .trim()
            .toLowerCase();
        const password = String(formData.get("password") ?? "");

        setPending(true);
        setErrorMessage("");

        try {
            const { error } = await authClient.signIn.email({
                email,
                password,
                rememberMe: false,
            });

            if (error) {
                if (error.code === "EMAIL_NOT_VERIFIED") {
                    setErrorMessage(
                        "Your work email must be verified before you can sign in. Email verification setup is currently pending."
                    );
                } else if (error.status === 429) {
                    setErrorMessage(
                        "Too many sign-in attempts. Please wait and try again."
                    );
                } else {
                    setErrorMessage(
                        "Unable to sign in. Check your email and password."
                    );
                }

                return;
            }

            window.location.replace("/dashboard");
        } catch {
            setErrorMessage(
                "Could not connect to the sign-in service. Please try again."
            );
        } finally {
            setPending(false);
        }
    }

    return (
        <main className="grid min-h-screen place-items-center bg-[#ffcf00] bg-[radial-gradient(circle,rgba(255,255,255,0.35)_2px,transparent_2px)] bg-size-[20px_20px] px-4 py-10 text-slate-900">
            <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl sm:p-10">
                <div className="flex justify-center">
                    <EblLogo />
                </div>

                <h1 className="mb-6 mt-6 text-center text-2xl font-bold">
                    Sign in to EOD Task Management
                </h1>

                <form
                    method="post"
                    onSubmit={handleSignIn}
                    aria-busy={pending}
                    className="space-y-4"
                >
                    <label className="block">
                        <span className="mb-1 block font-medium">
                            Work email
                        </span>

                        <input
                            type="email"
                            name="email"
                            autoComplete="username"
                            required
                            disabled={pending}
                            className={inputClass}
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1 block font-medium">
                            Password
                        </span>

                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            required
                            disabled={pending}
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
                        disabled={pending}
                        className="w-full rounded-lg bg-[#ffcf00] px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {pending ? "Signing in…" : "Sign in"}
                    </button>
                </form>

                <p className="mt-5 text-center text-sm text-slate-600">
                    First time here?{" "}
                    <Link
                        href="/sign-up"
                        className="font-medium text-blue-700 hover:underline"
                    >
                        Create your account
                    </Link>
                </p>
            </section>
        </main>
    );
}