import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { getHandovers } from "../../../lib/workspace-api";
import { requireOperator } from "../../../lib/permissions";
import { getCurrentShiftKey, getShiftTasks } from "../../../lib/workspace-api";
import HandoverTransferHistory from "../../../components/HandoverTransferHistory";

async function HandoverContent() {
    await connection();
    await requireOperator();

    const shift = await getCurrentShiftKey();
    const tasks = await getShiftTasks(shift.date, shift.name);

    const carriedTasks = tasks.filter(
        (task) => Boolean(task.carriedOver),
    );

    const pendingTasks = carriedTasks.filter(
        (task) => task.status === "Pending",
    );

    const completedTasks = carriedTasks.filter(
        (task) => task.status === "Completed",
    );

    const tasksWithNotes = carriedTasks.filter(
        (task) => Boolean(task.notes?.trim()),
    );

    const handovers = await getHandovers();

    const summary = [
        {
            label: "Received this shift",
            count: carriedTasks.length,
            color: "border-blue-400",
        },
        {
            label: "Pending",
            count: pendingTasks.length,
            color: "border-amber-400",
        },
        {
            label: "Completed",
            count: completedTasks.length,
            color: "border-emerald-400",
        },
    ];

    return (
        <div className="mt-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="capitalize text-slate-600">
                    {shift.name} shift · {shift.date} · Dhaka time
                </p>

                <Link
                    href="/shift-tasks"
                    className="rounded-lg bg-brand text-brand-ink px-4 py-2 text-sm font-semibold hover:bg-amber-400"
                >
                    Open shift tasks
                </Link>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
                {summary.map((item) => (
                    <div
                        key={item.label}
                        className={`rounded-xl border border-slate-200 border-t-4 ${item.color} bg-white p-5 shadow-sm`}
                    >
                        <dt className="text-sm text-slate-600">
                            {item.label}
                        </dt>

                        <dd className="mt-2 text-3xl font-bold">
                            {item.count}
                        </dd>
                    </div>
                ))}
            </dl>

            <div className="grid items-start gap-6 xl:grid-cols-3">
                <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">
                            Incoming work
                        </h2>

                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                            {pendingTasks.length} pending
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Unfinished carried-over tasks in the current shift.
                    </p>

                    {pendingTasks.length === 0 ? (
                        <p className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
                            No pending carried-over tasks.
                        </p>
                    ) : (
                        <ul className="mt-5 space-y-4">
                            {pendingTasks.map((task) => (
                                <li
                                    key={task.id}
                                    className="rounded-xl border border-slate-200 p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold [overflow-wrap:anywhere]">
                                                {task.name}
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Task #{task.id}
                                                {" · "}
                                                Received from a previous shift
                                            </p>
                                        </div>

                                        <span className="badge badge-warning">
                                            Pending
                                        </span>
                                    </div>

                                    <div className="mt-4 rounded-lg bg-slate-50 p-3">
                                        <p className="text-xs font-semibold text-slate-600">
                                            Current task note
                                        </p>

                                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 [overflow-wrap:anywhere]">
                                            {task.notes?.trim()
                                                ? task.notes
                                                : "No handover note recorded."}
                                        </p>
                                    </div>

                                    <div className="mt-4">
                                        <Link
                                            href="/shift-tasks"
                                            className="inline-block rounded-lg border border-amber-400 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-amber-50"
                                        >
                                            Manage in Shift Tasks
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {completedTasks.length > 0 && (
                        <details className="mt-5 border-t border-slate-100 pt-4">
                            <summary className="cursor-pointer text-sm font-semibold text-emerald-800">
                                Completed carry-overs ({completedTasks.length})
                            </summary>

                            <ul className="mt-3 divide-y divide-slate-100">
                                {completedTasks.map((task) => (
                                    <li key={task.id} className="py-3">
                                        <p className="text-sm font-medium">
                                            {task.name}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Task #{task.id}
                                        </p>

                                        {task.completedAtDhaka && (
                                            <p className="mt-1 text-xs text-emerald-700">
                                                Completed:{" "}
                                                {task.completedAtDhaka}
                                                {" · Dhaka"}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </details>
                    )}
                </section>

                <aside className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-semibold">
                        Handover notes
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Current notes on tasks received this shift.
                    </p>

                    {tasksWithNotes.length === 0 ? (
                        <p className="mt-5 text-sm text-slate-500">
                            No notes recorded on carried-over tasks.
                        </p>
                    ) : (
                        <ul className="mt-5 space-y-3">
                            {tasksWithNotes.slice(0, 3).map((task) => (
                                <li
                                    key={task.id}
                                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                                >
                                    <p className="text-sm font-semibold [overflow-wrap:anywhere]">
                                        {task.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Task #{task.id} · {task.status}
                                    </p>

                                    <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-slate-600 [overflow-wrap:anywhere]">
                                        {task.notes}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}

                    {tasksWithNotes.length > 3 && (
                        <p className="mt-3 text-xs text-slate-500">
                            Showing 3 of {tasksWithNotes.length} notes.
                        </p>
                    )}

                    <Link
                        href="/shift-tasks"
                        className="mt-5 block rounded-lg border border-amber-400 px-4 py-2 text-center text-sm font-semibold hover:bg-amber-50"
                    >
                        Review or edit task notes
                    </Link>
                </aside>
            </div>

            <HandoverTransferHistory
                handovers={handovers.map((handover) => ({
                    id: handover.id,
                    task_id: handover.task_id,
                    task_name: handover.task_name,
                    from_date: handover.from_date,
                    from_shift_name: handover.from_shift_name,
                    to_date: handover.to_date,
                    to_shift_name: handover.to_shift_name,
                }))}
            />
        </div>
    );
}

export default function HandoversPage() {
    return (
        <>
            <h1 className="text-3xl font-bold">
                Handovers
            </h1>

            <p className="mt-2 text-sm text-slate-500">
                Review unfinished work and notes from previous shifts.
            </p>

            <Suspense
                fallback={
                    <div
                        role="status"
                        className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm"
                    >
                        Loading handovers…
                    </div>
                }
            >
                <HandoverContent />
            </Suspense>
        </>
    );
}