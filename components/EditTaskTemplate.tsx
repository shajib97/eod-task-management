"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { renameTaskTemplate } from "../app/(workspace)/task-templates/actions";

interface EditTaskTemplateProps {
    id: number;
    name: string;
}

function EditButtons({ onCancel }: { onCancel: () => void }) {
    const { pending } = useFormStatus();

    return (
        <div className="flex gap-2">
            <button
                type="submit"
                disabled={pending}
                className="btn btn-sm bg-[#ffcf00] text-brand-ink"
            >
                {pending ? "Updating…" : "Update"}
            </button>

            <button
                type="button"
                disabled={pending}
                onClick={onCancel}
                className="btn btn-sm btn-ghost"
            >
                Cancel
            </button>
        </div>
    );
}

export default function EditTaskTemplate({
    id,
    name,
}: EditTaskTemplateProps) {
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");

    async function handleUpdate(formData: FormData) {
        setError("");

        try {
            await renameTaskTemplate(formData);
            setEditing(false);
        } catch {
            setError(
                "Could not update the name. Check for a duplicate name and try again."
            );
        }
    }

    if (!editing) {
        return (
            <div className="flex items-center justify-between gap-4">
                <span className="font-medium">{name}</span>

                <button
                    type="button"
                    onClick={() => {
                        setError("");
                        setEditing(true);
                    }}
                    aria-label={`Edit ${name}`}
                    className="btn btn-sm btn-ghost"
                >
                    Edit
                </button>
            </div>
        );
    }

    return (
        <form action={handleUpdate}>
            <input type="hidden" name="id" value={id} />

            <div className="flex flex-wrap items-center gap-2">
                <input
                    name="name"
                    defaultValue={name}
                    required
                    maxLength={120}
                    autoFocus
                    aria-label="Task template name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 sm:w-80"
                />

                <EditButtons onCancel={() => setEditing(false)} />
            </div>

            {error && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}
        </form>
    );
}