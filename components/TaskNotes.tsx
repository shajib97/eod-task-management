"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateTaskNotes } from "../app/(workspace)/shift-tasks/actions";

interface TaskNotesProps {
    taskId: number;
    taskName: string;
    notes: string | null;
}

export default function TaskNotes({
    taskId,
    taskName,
    notes,
}: TaskNotesProps) {
    const router = useRouter();

    const [editing, setEditing] = useState(false);
    const [pending, setPending] = useState(false);
    const [draft, setDraft] = useState("");
    const [originalNotes, setOriginalNotes] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    function startEditing() {
        setDraft(notes ?? "");
        setOriginalNotes(notes ?? "");
        setErrorMessage("");
        setEditing(true);
    }

    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (pending) return;

        const formData = new FormData();

        formData.set("id", String(taskId));
        formData.set("notes", draft);
        formData.set("originalNotes", originalNotes);

        setPending(true);
        setErrorMessage("");

        try {
            const result = await updateTaskNotes(formData);

            if (!result.success) {
                setErrorMessage(result.message);
                router.refresh();
                return;
            }

            setEditing(false);
            router.refresh();
        } catch {
            setErrorMessage(
                "Could not save the note. Your draft is still here. Please try again."
            );
        } finally {
            setPending(false);
        }
    }

    if (!editing) {
        return (
            <div className="mt-3">
                {notes ? (
                    <p className="whitespace-pre-wrap break-words text-sm text-slate-600">
                        {notes}
                    </p>
                ) : (
                    <p className="text-sm text-slate-400">
                        No notes added.
                    </p>
                )}

                <button
                    type="button"
                    onClick={startEditing}
                    aria-label={`Edit notes for ${taskName}`}
                    className="btn btn-ghost btn-xs mt-1"
                >
                    {notes ? "Edit note" : "Add note"}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="mt-3 space-y-2">
            <label className="block">
                <span className="mb-1 block text-sm font-medium">
                    Task note
                </span>

                <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={2000}
                    rows={3}
                    disabled={pending}
                    autoFocus
                    placeholder="Explain progress, blockers, or what the next shift needs to do."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
            </label>

            <p className="text-xs text-slate-500">
                {draft.length}/2000 characters
            </p>

            {errorMessage && (
                <p role="alert" className="text-sm text-red-700">
                    {errorMessage}
                </p>
            )}

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={pending}
                    className="btn btn-sm bg-[#ffcf00] text-brand-ink"
                >
                    {pending ? "Saving…" : "Save"}
                </button>

                <button
                    type="button"
                    disabled={pending}
                    onClick={() => setEditing(false)}
                    className="btn btn-sm btn-ghost"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}