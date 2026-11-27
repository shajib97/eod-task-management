"use client";

import { useState } from "react";

export interface TaskHistoryItem {
    id: number;
    taskId: number;
    taskName: string;
    previousStatus: string;
    newStatus: string;
    shiftDate: string;
    shiftName: string;
    changedAtDhaka: string | null;
    changedByEmail: string | null;
}

export default function TaskHistoryTable({
    entries,
}: {
    entries: TaskHistoryItem[];
}) {
    const [search, setSearch] = useState("");
    const [shift, setShift] = useState("All");
    const [status, setStatus] = useState("All");
    const [visibleCount, setVisibleCount] = useState(10);

    const filteredEntries = entries.filter((entry) => {
        const query = search.trim().toLowerCase();

        const matchesSearch =
            entry.taskName.toLowerCase().includes(query) ||
            (entry.changedByEmail ?? "").toLowerCase().includes(query) ||
            String(entry.taskId).includes(query);

        const matchesShift =
            shift === "All" || entry.shiftName === shift;

        const matchesStatus =
            status === "All" || entry.newStatus === status;

        return matchesSearch && matchesShift && matchesStatus;
    });

    const visibleEntries = filteredEntries.slice(0, visibleCount);
    const hasMore = visibleCount < filteredEntries.length;

    function clearFilters() {
        setSearch("");
        setShift("All");
        setStatus("All");
        setVisibleCount(10);
    }

    return (
        <div className="mt-5 space-y-4">
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-semibold text-slate-600">
                        Search
                    </span>

                    <input
                        type="search"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setVisibleCount(10);
                        }}
                        placeholder="Task name, officer or task ID…"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                    />
                </label>

                <label>
                    <span className="mb-1 block text-xs font-semibold text-slate-600">
                        Shift
                    </span>

                    <select
                        value={shift}
                        onChange={(event) => {
                            setShift(event.target.value);
                            setVisibleCount(10);
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                        <option value="All">All shifts</option>
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                    </select>
                </label>

                <label>
                    <span className="mb-1 block text-xs font-semibold text-slate-600">
                        New status
                    </span>

                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value);
                            setVisibleCount(10);
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                        <option value="All">All statuses</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending / reopened</option>
                    </select>
                </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <p
                    role="status"
                    className="text-xs text-slate-500"
                >
                    Showing {visibleEntries.length} of{" "}
                    {filteredEntries.length} matching events
                    {" · "}
                    {entries.length} events loaded
                </p>

                <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-slate-700 underline underline-offset-4"
                >
                    Clear filters
                </button>
            </div>

            {visibleEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
                    <p className="text-sm text-slate-600">
                        {entries.length === 0
                            ? "No status changes recorded yet."
                            : "No events match your filters."}
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col">Task</th>
                                    <th scope="col">Previous status</th>
                                    <th scope="col">New status</th>
                                    <th scope="col">Changed by</th>
                                    <th scope="col">Shift</th>
                                    <th scope="col">
                                        Changed at · Dhaka
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {visibleEntries.map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="min-w-48 align-top">
                                            <p className="font-medium">
                                                {entry.taskName}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Task #{entry.taskId}
                                            </p>
                                        </td>

                                        <td className="align-top">
                                            {entry.previousStatus}
                                        </td>

                                        <td className="align-top">
                                            <span
                                                className={`badge whitespace-nowrap ${entry.newStatus === "Completed"
                                                        ? "badge-success"
                                                        : "badge-warning"
                                                    }`}
                                            >
                                                {entry.newStatus}
                                            </span>
                                        </td>

                                        <td className="min-w-36 align-top">
                                            {entry.changedByEmail ??
                                                "Not recorded"}
                                        </td>

                                        <td className="align-top">
                                            <p className="capitalize">
                                                {entry.shiftName}
                                            </p>

                                            <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
                                                {entry.shiftDate}
                                            </p>
                                        </td>

                                        <td className="min-w-44 align-top text-sm text-slate-600">
                                            {entry.changedAtDhaka ??
                                                "Time unavailable"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredEntries.length > 10 && (
                        <div className="flex flex-wrap justify-center gap-3 border-t border-slate-200 p-4">
                            {hasMore && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setVisibleCount(
                                            (count) => count + 10,
                                        )
                                    }
                                    className="rounded-lg bg-[#ffcf00] text-brand-ink px-4 py-2 text-sm font-semibold hover:bg-amber-400"
                                >
                                    Show 10 more
                                </button>
                            )}

                            {visibleCount > 10 && (
                                <button
                                    type="button"
                                    onClick={() => setVisibleCount(10)}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                                >
                                    Show less
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}