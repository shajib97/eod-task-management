import { Suspense } from "react";
import { connection } from "next/server";
import { getTaskHistory } from "../../../lib/workspace-api";
import { requireOperator } from "../../../lib/permissions";
import TaskHistoryTable from "../../../components/TaskHistoryTable";

async function HistoryList() {
    await connection();
    await requireOperator();

    const entries = await getTaskHistory();

    return (
        <TaskHistoryTable
            entries={entries.map((entry) => ({
                id: entry.id,
                taskId: entry.taskId,
                taskName: entry.taskName,
                previousStatus: entry.previousStatus,
                newStatus: entry.newStatus,
                shiftDate: entry.shiftDate,
                shiftName: entry.shiftName,
                changedAtDhaka: entry.changedAtDhaka,
                changedByName: entry.changedByName,
            }))}
        />
    );
}

export default function TaskHistoryPage() {
    return (
        <>
            <h1 className="text-3xl font-bold">
                Task History
            </h1>

            <p className="mt-2 text-sm text-slate-500">
                Review task completion and reopening activity across shifts.
            </p>

            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold">
                    Recent status changes
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Search and filter the latest 100 recorded events.
                    Shift dates identify when each shift started.
                </p>

                <Suspense
                    fallback={
                        <p
                            role="status"
                            className="mt-4 text-sm text-slate-600"
                        >
                            Loading history…
                        </p>
                    }
                >
                    <HistoryList />
                </Suspense>
            </section>
        </>
    );
}