"use client";

import { useFormStatus } from "react-dom";

export default function SendReportButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="btn bg-[#ffcf00] text-brand-ink disabled:cursor-wait disabled:opacity-60"
        >
            {pending ? "Sending report…" : "Send report by email"}
        </button>
    );
}