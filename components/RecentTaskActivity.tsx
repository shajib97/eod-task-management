import Link from "next/link";
import { getRecentTaskActivity } from "../lib/workspace-api";
import { requireOperator } from "../lib/permissions";

export default async function RecentTaskActivity() {
    await requireOperator();

    const entries = await getRecentTaskActivity();

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">
                    Recent activity
                </h2>

                <Link
                    href="/task-history"
                    className="text-sm font-semibold text-slate-700 underline decoration-amber-400 underline-offset-4 hover:text-slate-950"
                >
                    View all
                </Link>
            </div>

            <p className="mt-1 text-sm text-slate-500">
                Latest 3 status changes across shifts.
            </p>

            {entries.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">
                    No status changes recorded yet.
                </p>
            ) : (
                <ol className="mt-4 space-y-3">
                    {entries.map((entry) => {
                        const completed =
                            entry.newStatus === "Completed";

                        return (
                            <li
                                key={entry.id}
                                className="flex items-start gap-3"
                            >
                                <span
                                    aria-hidden="true"
                                    className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${completed
                                        ? "bg-emerald-500"
                                        : "bg-amber-500"
                                        }`}
                                />

                                <div className="min-w-0">
                                    <p className="text-sm text-slate-800">
                                        <span className="font-semibold">
                                            {entry.changedByName ??
                                                "Officer name not recorded"}
                                        </span>{" "}
                                        {completed
                                            ? "completed a task"
                                            : "changed task status to Pending"}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-600 [overflow-wrap:anywhere]">
                                        {entry.taskName}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Task #{entry.taskId}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {entry.changedAtDhaka
                                            ? `${entry.changedAtDhaka} · Dhaka`
                                            : "Time not available"}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </section>
    );
}