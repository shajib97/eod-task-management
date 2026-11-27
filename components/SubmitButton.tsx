"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
    label: string;
    pendingLabel: string;
    ariaLabel?: string;
    className?: string;
};

export default function SubmitButton({
    label,
    pendingLabel,
    ariaLabel,
    className = "",
}: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-label={pending ? pendingLabel : ariaLabel}
            className={`btn bg-[#ffcf00] text-brand-ink disabled:opacity-60 ${className}`}
        >
            {pending ? pendingLabel : label}
        </button>
    );
}