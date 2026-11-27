import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { getCurrentShiftKey, getShiftTasks } from "../../../lib/workspace-api";
import RecentTaskActivity from "../../../components/RecentTaskActivity";

async function DashboardOverview() {
    await connection();

    const shift = await getCurrentShiftKey();
    const tasks = await getShiftTasks(shift.date, shift.name);

    const completedTasks = tasks.filter(
        (task) => task.status === "Completed",
    );

    const pendingTasks = tasks.filter(
        (task) => task.status === "Pending",
    );

    const carriedOverTasks = tasks.filter(
        (task) => Boolean(task.carriedOver),
    );

    const attentionTasks = pendingTasks.filter(
        (task) => Boolean(task.carriedOver),
    );

    const completionRate =
        tasks.length === 0
            ? 0
            : Math.round(
                (completedTasks.length / tasks.length) * 100,
            );

    const summary = [
        {
            label: "Total tasks",
            count: tasks.length,
            description: "In the current shift",
            accent: "border-amber-400",
            countColor: "text-slate-900",
        },
        {
            label: "Pending",
            count: pendingTasks.length,
            description: "Awaiting completion",
            accent: "border-orange-400",
            countColor: "text-orange-700",
        },
        {
            label: "Completed",
            count: completedTasks.length,
            description: "Finished this shift",
            accent: "border-emerald-400",
            countColor: "text-emerald-700",
        },
        {
            label: "Carried over",
            count: carriedOverTasks.length,
            description: "Received from earlier shifts",
            accent: "border-blue-400",
            countColor: "text-blue-700",
        },
    ];

    return (
        <>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                <p className="capitalize text-slate-600">
                    {shift.name} shift · {shift.date} · Dhaka time
                </p>

                <Link
                    href="/shift-tasks"
                    className="inline-flex items-center justify-center rounded-lg bg-[#ffcf00] text-brand-ink px-4 py-2 text-sm font-semibold hover:bg-amber-400"
                >
                    Open shift tasks
                </Link>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {summary.map((item) => (
                    <div
                        key={item.label}
                        className={`rounded-xl border border-slate-200 border-t-4 ${item.accent} bg-white p-5 shadow-sm`}
                    >
                        <dt className="text-sm font-medium text-slate-600">
                            {item.label}
                        </dt>

                        <dd
                            className={`mt-2 text-3xl font-bold ${item.countColor}`}
                        >
                            {item.count}
                        </dd>

                        <p className="mt-2 text-xs text-slate-500">
                            {item.description}
                        </p>
                    </div>
                ))}
            </dl>

            <div className="mt-6 grid items-start gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-xl font-semibold">
                                Needs attention
                            </h2>

                            <Link
                                href="/handovers"
                                className="text-sm font-semibold text-slate-700 underline decoration-amber-400 underline-offset-4 hover:text-slate-950"
                            >
                                View handovers
                            </Link>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Unfinished tasks received from previous shifts.
                        </p>

                        {attentionTasks.length === 0 ? (
                            <p className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
                                No pending carried-over tasks.
                            </p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {attentionTasks.slice(0, 5).map((task) => (
                                    <li
                                        key={task.id}
                                        className="rounded-lg border border-amber-200 bg-amber-50 p-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="font-semibold text-slate-900">
                                                {task.name}
                                            </p>

                                            <span className="badge badge-warning">
                                                Pending
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm text-slate-600">
                                            Carried over and awaiting completion.
                                        </p>

                                        {task.notes && (
                                            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 [overflow-wrap:anywhere]">
                                                {task.notes}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {attentionTasks.length > 5 && (
                            <p className="mt-3 text-sm text-slate-500">
                                Showing 5 of {attentionTasks.length} tasks.
                                Open Handovers to review the rest.
                            </p>
                        )}
                    </section>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Current shift tasks
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Task status and handover notes.
                                </p>
                            </div>

                            <Link
                                href="/shift-tasks"
                                className="rounded-lg border border-amber-400 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-amber-50"
                            >
                                Manage tasks
                            </Link>
                        </div>

                        {tasks.length === 0 ? (
                            <p className="p-5 text-slate-600">
                                No tasks for this shift yet.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead className="bg-slate-50 text-slate-600">
                                        <tr>
                                            <th scope="col">Task</th>
                                            <th scope="col">Origin</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">
                                                Completed at · Dhaka
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tasks.map((task) => (
                                            <tr key={task.id}>
                                                <td className="min-w-60 align-top">
                                                    <p className="font-medium text-slate-900">
                                                        {task.name}
                                                    </p>

                                                    {task.notes && (
                                                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500 [overflow-wrap:anywhere]">
                                                            {task.notes}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap align-top">
                                                    {Boolean(task.carriedOver) ? (
                                                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                            Carried over
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-slate-600">
                                                            Current shift
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="align-top">
                                                    <span
                                                        className={`badge ${task.status === "Completed"
                                                            ? "badge-success"
                                                            : "badge-warning"
                                                            }`}
                                                    >
                                                        {task.status}
                                                    </span>
                                                </td>

                                                <td className="min-w-44 align-top text-sm text-slate-600">
                                                    {task.status === "Completed"
                                                        ? task.completedAtDhaka ?? "—"
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>

                <aside className="space-y-6">
                    <Suspense
                        fallback={
                            <div
                                role="status"
                                className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm"
                            >
                                Loading recent activity…
                            </div>
                        }
                    >
                        <RecentTaskActivity />
                    </Suspense>
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-semibold">
                            Shift progress
                        </h2>

                        <div className="mt-5 flex items-end justify-between gap-3">
                            <p className="text-4xl font-bold">
                                {completionRate}%
                            </p>

                            <p className="text-sm text-slate-500">
                                completed
                            </p>
                        </div>

                        <progress
                            value={completedTasks.length}
                            max={tasks.length || 1}
                            aria-label="Current shift task completion"
                            className="progress progress-warning mt-4 w-full"
                        />

                        <p className="mt-3 text-sm text-slate-600">
                            {completedTasks.length} of {tasks.length} tasks
                            completed.
                        </p>

                        <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                            <div className="flex justify-between gap-3">
                                <dt className="text-slate-600">
                                    Remaining tasks
                                </dt>
                                <dd className="font-semibold">
                                    {pendingTasks.length}
                                </dd>
                            </div>

                            <div className="flex justify-between gap-3">
                                <dt className="text-slate-600">
                                    Pending carry-overs
                                </dt>
                                <dd className="font-semibold">
                                    {attentionTasks.length}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-semibold">
                            Quick access
                        </h2>

                        <div className="mt-4 space-y-3">
                            <Link
                                href="/handovers"
                                className="block rounded-lg border border-slate-200 p-3 hover:border-amber-400 hover:bg-amber-50"
                            >
                                <p className="font-medium">
                                    Handovers
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Review unfinished work.
                                </p>
                            </Link>

                            <Link
                                href="/reports"
                                className="block rounded-lg border border-slate-200 p-3 hover:border-amber-400 hover:bg-amber-50"
                            >
                                <p className="font-medium">
                                    Shift reports
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Review and manually email reports.
                                </p>
                            </Link>

                            <Link
                                href="/task-history"
                                className="block rounded-lg border border-slate-200 p-3 hover:border-amber-400 hover:bg-amber-50"
                            >
                                <p className="font-medium">
                                    Task history
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Review recorded task activity.
                                </p>
                            </Link>
                        </div>
                    </section>
                </aside>
            </div>
        </>
    );
}

export default function DashboardPage() {
    return (
        <>
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <Suspense
                fallback={
                    <p role="status" className="mt-2 text-slate-600">
                        Loading shift overview…
                    </p>
                }
            >
                <DashboardOverview />
            </Suspense>
        </>
    );
}