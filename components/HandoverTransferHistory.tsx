"use client";

import { useState } from "react";

interface Handover {
    id: number;
    task_id: number;
    task_name: string;
    from_date: string;
    from_shift_name: string;
    to_date: string;
    to_shift_name: string;
}

export default function HandoverTransferHistory({
    handovers,
}: {
    handovers: Handover[];
}) {
    const [visibleCount, setVisibleCount] = useState(5);

    const visibleHandovers = handovers.slice(0, visibleCount);
    const hasMore = visibleCount < handovers.length;

    return (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
                <h2 className="text-xl font-semibold">
                    Transfer history
                </h2>

                <p
                    role="status"
                    className="mt-1 text-sm text-slate-500"
                >
                    Showing {visibleHandovers.length} of{" "}
                    {handovers.length} loaded records.
                    Dates identify when each shift started.
                </p>
            </div>

            {handovers.length === 0 ? (
                <p className="p-5 text-sm text-slate-600">
                    No handovers recorded yet.
                </p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col">Task</th>
                                    <th scope="col">From shift</th>
                                    <th scope="col">To shift</th>
                                </tr>
                            </thead>

                            <tbody>
                                {visibleHandovers.map((handover) => (
                                    <tr key={handover.id}>
                                        <td className="min-w-48">
                                            <p className="font-medium">
                                                {handover.task_name}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Task #{handover.task_id}
                                            </p>
                                        </td>

                                        <td>
                                            <p className="capitalize">
                                                {handover.from_shift_name}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {handover.from_date}
                                            </p>
                                        </td>

                                        <td>
                                            <p className="capitalize">
                                                {handover.to_shift_name}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {handover.to_date}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {handovers.length > 5 && (
                        <div className="flex flex-wrap justify-center gap-3 border-t border-slate-100 p-4">
                            {hasMore && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setVisibleCount((count) => count + 5)
                                    }
                                    className="rounded-lg bg-brand text-brand-ink px-4 py-2 text-sm font-semibold hover:bg-amber-400"
                                >
                                    Show 5 more
                                </button>
                            )}

                            {visibleCount > 5 && (
                                <button
                                    type="button"
                                    onClick={() => setVisibleCount(5)}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                                >
                                    Show less
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}