"use client";

export default function WorkspaceError({
    reset,
}: {
    reset: () => void;
}) {
    return (
        <section
            role="alert"
            className="rounded-xl border border-red-200 bg-white p-6 shadow-sm"
        >
            <h1 className="text-2xl font-bold text-slate-900">
                Couldn’t complete the request
            </h1>

            <p className="mt-2 text-slate-600">
                Something went wrong. Please try again.
            </p>

            <button
                type="button"
                onClick={reset}
                className="btn mt-5 bg-[#ffcf00] text-slate-900"
            >
                Try again
            </button>
        </section>
    );
}