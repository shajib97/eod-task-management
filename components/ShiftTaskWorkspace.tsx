"use client";

import { useState } from "react";
import TaskNotes from "./TaskNotes";
import SubmitButton from "./SubmitButton";
import { updateTaskStatus } from "../app/(workspace)/shift-tasks/actions";

interface Task {
    id: number;
    name: string;
    notes: string | null;
    status: "Pending" | "Completed";
    carriedOver: number;
    completedAtDhaka: string | null;
}

interface Props {
    tasks: Task[];
    shiftLabel: string;
}

export default function ShiftTaskWorkspace({
    tasks,
    shiftLabel,
}: Props) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [origin, setOrigin] = useState("All");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const filteredTasks = tasks.filter((task) => {
        const query = search.trim().toLowerCase();

        const matchesSearch =
            task.name.toLowerCase().includes(query) ||
            (task.notes ?? "").toLowerCase().includes(query);

        const matchesStatus =
            status === "All" || task.status === status;

        const matchesOrigin =
            origin === "All" ||
            (origin === "Carried over" && Boolean(task.carriedOver)) ||
            (origin === "Current shift" && !task.carriedOver);

        return matchesSearch && matchesStatus && matchesOrigin;
    });

    const selectedTask =
        filteredTasks.find((task) => task.id === selectedId) ??
        filteredTasks[0] ??
        null;

    function clearFilters() {
        setSearch("");
        setStatus("All");
        setOrigin("All");
    }

    return (
        <div className="space-y-4">
            <section
                aria-label="Task filters"
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <label className="sm:col-span-2 xl:col-span-2">
                        <span className="mb-1 block text-xs font-semibold text-slate-600">
                            Search tasks
                        </span>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search task names or notes…"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                        />
                    </label>

                    <label>
                        <span className="mb-1 block text-xs font-semibold text-slate-600">
                            Status
                        </span>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        >
                            <option value="All">All statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </label>

                    <label>
                        <span className="mb-1 block text-xs font-semibold text-slate-600">
                            Origin
                        </span>

                        <select
                            value={origin}
                            onChange={(event) =>
                                setOrigin(event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        >
                            <option value="All">All origins</option>
                            <option value="Current shift">
                                Current shift
                            </option>
                            <option value="Carried over">
                                Carried over
                            </option>
                        </select>
                    </label>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                    <p
                        role="status"
                        className="text-xs text-slate-500"
                    >
                        Showing {filteredTasks.length} of {tasks.length} tasks
                    </p>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs font-semibold text-slate-700 underline underline-offset-4"
                    >
                        Clear filters
                    </button>
                </div>
            </section>

            <div className="grid items-start gap-4 xl:grid-cols-5">
                <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-3">
                    <div className="border-b border-slate-100 p-4">
                        <h2 className="font-semibold">
                            Shift tasks
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Select a task to view its notes and actions.
                        </p>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <p className="font-medium text-slate-700">
                                {tasks.length === 0
                                    ? "No tasks for this shift yet."
                                    : "No tasks match your filters."}
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                {tasks.length === 0
                                    ? "Generate the checklist or add a custom task above."
                                    : "Try another search or clear the filters."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col">Task</th>
                                        <th scope="col">Origin</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Details</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredTasks.map((task) => {
                                        const selected =
                                            selectedTask?.id === task.id;

                                        return (
                                            <tr
                                                key={task.id}
                                                className={
                                                    selected
                                                        ? "bg-amber-50"
                                                        : "hover:bg-slate-50"
                                                }
                                            >
                                                <td className="min-w-48 align-top">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedId(task.id)
                                                        }
                                                        aria-pressed={selected}
                                                        aria-controls="task-details"
                                                        className="rounded text-left font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                                                    >
                                                        {task.name}
                                                    </button>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Task #{task.id}
                                                    </p>
                                                </td>

                                                <td className="align-top text-xs text-slate-600">
                                                    {task.carriedOver
                                                        ? "Carried over"
                                                        : "Current shift"}
                                                </td>

                                                <td className="align-top">
                                                    <span
                                                        className={`badge whitespace-nowrap ${task.status === "Completed"
                                                            ? "badge-success"
                                                            : "badge-warning"
                                                            }`}
                                                    >
                                                        {task.status}
                                                    </span>
                                                </td>

                                                <td className="align-top">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedId(task.id)
                                                        }
                                                        aria-label={`View details for ${task.name}`}
                                                        aria-controls="task-details"
                                                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-amber-400 hover:bg-amber-50"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <aside
                    id="task-details"
                    aria-label="Selected task details"
                    className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2"
                >
                    {selectedTask ? (
                        <>
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                                Task details
                            </p>

                            <h2 className="mt-2 text-xl font-bold text-slate-900 [overflow-wrap:anywhere]">
                                {selectedTask.name}
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Task #{selectedTask.id}
                            </p>

                            <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-slate-100 py-4 text-sm">
                                <div>
                                    <dt className="text-xs text-slate-500">
                                        Status
                                    </dt>

                                    <dd className="mt-2">
                                        <span
                                            className={`badge ${selectedTask.status === "Completed"
                                                    ? "badge-success"
                                                    : "badge-warning"
                                                }`}
                                        >
                                            {selectedTask.status}
                                        </span>
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs text-slate-500">
                                        Origin
                                    </dt>

                                    <dd className="mt-2 font-medium">
                                        {selectedTask.carriedOver
                                            ? "Previous shift"
                                            : "Current shift"}
                                    </dd>
                                </div>

                                <div className="col-span-2">
                                    <dt className="text-xs text-slate-500">
                                        Current shift
                                    </dt>

                                    <dd className="mt-1 capitalize">
                                        {shiftLabel}
                                    </dd>
                                </div>

                                {selectedTask.status === "Completed" && (
                                    <div className="col-span-2">
                                        <dt className="text-xs text-slate-500">
                                            Completed at · Dhaka
                                        </dt>

                                        <dd className="mt-1">
                                            {selectedTask.completedAtDhaka ?? "—"}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </>
                    ) : (
                        <p className="py-8 text-center text-sm text-slate-500">
                            Task details appear here when a task is available.
                        </p>
                    )}

                    {/* Keep editors mounted even when filters show no tasks. */}
                    <section hidden={!selectedTask} className="mt-5">
                        <h3 className="text-sm font-semibold">
                            Progress and handover notes
                        </h3>

                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                hidden={task.id !== selectedTask?.id}
                            >
                                <TaskNotes
                                    taskId={task.id}
                                    taskName={task.name}
                                    notes={task.notes}
                                />
                            </div>
                        ))}
                    </section>

                    {selectedTask && (
                        <div className="mt-6 border-t border-slate-100 pt-4">
                            <form action={updateTaskStatus}>
                                <input
                                    type="hidden"
                                    name="id"
                                    value={selectedTask.id}
                                />

                                <input
                                    type="hidden"
                                    name="status"
                                    value={
                                        selectedTask.status === "Completed"
                                            ? "Pending"
                                            : "Completed"
                                    }
                                />

                                <SubmitButton
                                    label={
                                        selectedTask.status === "Completed"
                                            ? "Reopen task"
                                            : "Mark complete"
                                    }
                                    pendingLabel="Saving…"
                                    ariaLabel={`${selectedTask.status === "Completed"
                                            ? "Reopen"
                                            : "Complete"
                                        }: ${selectedTask.name}`}
                                    className="w-full rounded-lg border-amber-400 bg-[#ffcf00] text-slate-900 hover:bg-amber-400"
                                />
                            </form>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}