import { connection } from "next/server";
import { Suspense } from "react";
import SubmitButton from "../../../components/SubmitButton";
import ShiftTaskWorkspace from "../../../components/ShiftTaskWorkspace";
import { getCurrentShiftKey, getShiftTasks } from "../../../lib/workspace-api";
import {
    addTask,
    generateShiftChecklist,
} from "./actions";

async function ShiftChecklist({ searchParams }: Pick<PageProps<"/shift-tasks">, "searchParams">) {
    await connection();
    const invalidTask = (await searchParams).task === "invalid";

    const shift = await getCurrentShiftKey();
    const tasks = await getShiftTasks(shift.date, shift.name);

    const completed = tasks.filter(
        (task) => task.status === "Completed",
    ).length;

    const pending = tasks.length - completed;

    const carriedOver = tasks.filter(
        (task) => Boolean(task.carriedOver),
    ).length;

    const percentage =
        tasks.length === 0
            ? 0
            : Math.round((completed / tasks.length) * 100);

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="h-1 bg-brand" />

                <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="font-semibold capitalize">
                                {shift.name} shift · {shift.date}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Bangladesh time · Asia/Dhaka
                            </p>
                        </div>

                        <form action={generateShiftChecklist}>
                            <SubmitButton
                                label="Generate checklist"
                                pendingLabel="Generating…"
                                className="rounded-lg border-amber-400 bg-brand text-brand-ink hover:bg-amber-400"
                            />
                        </form>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                        <p>
                            Total:{" "}
                            <strong className="text-slate-900">
                                {tasks.length}
                            </strong>
                        </p>

                        <p>
                            Pending:{" "}
                            <strong className="text-amber-700">
                                {pending}
                            </strong>
                        </p>

                        <p>
                            Completed:{" "}
                            <strong className="text-emerald-700">
                                {completed}
                            </strong>
                        </p>

                        <p>
                            Carried over:{" "}
                            <strong className="text-blue-700">
                                {carriedOver}
                            </strong>
                        </p>
                    </div>

                    <div className="mt-4">
                        <div className="mb-2 flex justify-between text-xs text-slate-500">
                            <span>Shift completion</span>
                            <span>{percentage}%</span>
                        </div>

                        <progress
                            value={completed}
                            max={tasks.length || 1}
                            aria-label="Shift completion"
                            className="progress progress-warning w-full"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 bg-amber-50/50 p-4 sm:p-5">
                    <details open={invalidTask || undefined}>
                        <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                            Add custom task
                        </summary>

                        {invalidTask && (
                            <p role="alert" className="mt-2 text-sm text-red-800">
                                Task name must contain 1?120 characters.
                            </p>
                        )}
                        <form
                            action={addTask}
                            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
                        >
                            <label className="min-w-0 flex-1">
                                <span className="mb-1 block text-sm font-medium">
                                    Task name
                                </span>

                                <input
                                    type="text"
                                    name="name"
                                    required
                                    maxLength={120}
                                    placeholder="Enter a task for this shift…"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                                />
                            </label>

                            <SubmitButton
                                label="Add task"
                                pendingLabel="Saving…"
                                className="rounded-lg border-amber-400 bg-brand text-brand-ink hover:bg-amber-400"
                            />
                        </form>
                    </details>
                </div>
            </section>

            <ShiftTaskWorkspace
                shiftLabel={`${shift.name} · ${shift.date}`}
                tasks={tasks.map((task) => ({
                    id: task.id,
                    name: task.name,
                    notes: task.notes,
                    status: task.status,
                    carriedOver: Number(task.carriedOver),
                    completedAtDhaka: task.completedAtDhaka,
                }))}
            />
        </div>
    );
}

export default function ShiftTasksPage({ searchParams }: PageProps<"/shift-tasks">) {
    return (
        <div className="space-y-6 pb-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">
                    Shift Tasks
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Review your checklist, update task status and record
                    handover notes.
                </p>
            </header>

            <Suspense
                fallback={
                    <div
                        role="status"
                        className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm"
                    >
                        Loading shift tasks…
                    </div>
                }
            >
                <ShiftChecklist searchParams={searchParams} />
            </Suspense>
        </div>
    );
}