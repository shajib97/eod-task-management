import { Suspense } from "react";
import { connection } from "next/server";
import { getCurrentShiftKey, getShiftReport, getReportDeliveryStatus, type ShiftKey } from "../../../lib/workspace-api";
import SendReportButton from "../../../components/SendReportButton";
import { sendSelectedShiftReport } from "./actions";

type SearchParams = Promise<{
    date?: string | string[];
    shift?: string | string[];
    email?: string | string[];
}>;

function isValidDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00Z`);

    return (
        Number(value.slice(0, 4)) >= 1000 &&
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}

async function ShiftReport({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    await connection();

    const params = await searchParams;
    const current = await getCurrentShiftKey();

    const date =
        typeof params.date === "string" && isValidDate(params.date)
            ? params.date
            : current.date;

    const shiftName =
        params.shift === "morning" ||
            params.shift === "evening" ||
            params.shift === "night"
            ? params.shift
            : current.name;

    const selectedShift: ShiftKey = {
        date,
        name: shiftName,
    };

    const nextDay = new Date(`${date}T00:00:00Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const nextDate = nextDay.toISOString().split("T")[0];

    const shiftPeriod =
        shiftName === "morning"
            ? `${date} · 8:00 AM – 3:00 PM`
            : shiftName === "evening"
                ? `${date} · 3:00 PM – 10:00 PM`
                : `${date} · 10:00 PM → ${nextDate} · 8:00 AM`;

    const tasks = await getShiftReport(selectedShift);
    const delivery = await getReportDeliveryStatus(selectedShift);

    const shiftOrder = {
        morning: 0,
        evening: 1,
        night: 2,
    };

    const hasEnded =
        date < current.date ||
        (date === current.date &&
            shiftOrder[shiftName] < shiftOrder[current.name]);

    const deliveryLabel = !delivery
        ? "Not sent"
        : delivery.deliveryStatus === "Sent"
            ? "Sent"
            : delivery.deliveryStatus === "Sending"
                ? "Awaiting confirmation"
                : "Needs review";

    const deliveryColor = !delivery
        ? "bg-slate-100 text-slate-700"
        : delivery.deliveryStatus === "Sent"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-amber-100 text-amber-900";

    const emailMessages: Record<string, string> = {
        sent: "The email server accepted the report for all recipients.",
        "already-sent": "This shift report has already been sent.",
        "not-ended": "You can send this report after the shift ends.",
        busy: "Another officer is submitting this report. Refresh shortly.",
        review: "This submission needs administrator review before retrying.",
        recipients: "Ask an administrator to configure valid report recipients in Settings.",
        smtp: "Email sending is not configured correctly. Contact an administrator.",
        failed: "Submission could not be completed. Check its saved status before retrying.",
        invalid: "The selected date or shift is invalid.",
    };

    const emailMessage =
        typeof params.email === "string" &&
            Object.prototype.hasOwnProperty.call(emailMessages, params.email)
            ? emailMessages[params.email]
            : undefined;

    const summary = [
        {
            label: "Total tasks",
            count: tasks.length,
            accent: "border-amber-400",
        },
        {
            label: "Completed",
            count: tasks.filter(
                (task) => task.reportStatus === "Completed",
            ).length,
            accent: "border-emerald-400",
        },
        {
            label: "Pending",
            count: tasks.filter(
                (task) => task.reportStatus === "Pending",
            ).length,
            accent: "border-orange-400",
        },
        {
            label: "Handed over",
            count: tasks.filter(
                (task) => task.reportStatus === "Handed over",
            ).length,
            accent: "border-blue-400",
        },
    ];

    return (
        <div className="mt-6 space-y-5">
            <form
                key={`filters-${date}-${shiftName}`}
                action="/reports"
                method="get"
                className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
                <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-600">
                        Shift start date
                    </span>

                    <input
                        type="date"
                        name="date"
                        required
                        min="1000-01-01"
                        max="9999-12-31"
                        defaultValue={date}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-600">
                        Shift
                    </span>

                    <select
                        name="shift"
                        defaultValue={shiftName}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                    </select>
                </label>

                <button
                    type="submit"
                    className="rounded-lg bg-[#ffcf00] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                >
                    View report
                </button>

                <p className="text-xs text-slate-500 sm:ml-auto">
                    All times shown in Asia/Dhaka
                </p>
            </form>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold capitalize">
                            {shiftName} shift report
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            {shiftPeriod} · Dhaka time
                        </p>
                    </div>

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${hasEnded
                                ? "bg-slate-100 text-slate-700"
                                : "bg-amber-100 text-amber-900"
                            }`}
                    >
                        {hasEnded ? "Shift ended" : "Current or upcoming shift"}
                    </span>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {summary.map((item) => (
                        <div
                            key={item.label}
                            className={`rounded-lg border border-slate-200 border-t-4 ${item.accent} p-4`}
                        >
                            <dt className="text-xs font-medium text-slate-500">
                                {item.label}
                            </dt>

                            <dd className="mt-1 text-2xl font-bold">
                                {item.count}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            <div className="grid items-start gap-5 xl:grid-cols-3">
                <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                    <div className="border-b border-slate-100 p-5">
                        <h2 className="text-lg font-semibold">
                            Shift task report
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Current task details. The saved email snapshot
                            remains unchanged after submission.
                        </p>
                    </div>

                    {tasks.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-slate-600">
                            No tasks recorded for this shift.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col">Task</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">
                                            Completed at · Dhaka
                                        </th>
                                        <th scope="col">Handed to</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {tasks.map((task) => {
                                        const badgeClass =
                                            task.reportStatus === "Completed"
                                                ? "badge-success"
                                                : task.reportStatus === "Pending"
                                                    ? "badge-warning"
                                                    : "badge-info";

                                        return (
                                            <tr key={task.id}>
                                                <td className="min-w-56 align-top">
                                                    <p className="font-medium">
                                                        {task.name}
                                                    </p>

                                                    {Boolean(task.carriedIn) && (
                                                        <p className="mt-1 text-xs text-blue-700">
                                                            Received from an earlier shift
                                                        </p>
                                                    )}

                                                    {task.notes && (
                                                        <details className="mt-2">
                                                            <summary className="cursor-pointer text-xs font-medium text-slate-600">
                                                                View current note
                                                            </summary>

                                                            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-amber-50 p-3 text-sm text-slate-700 [overflow-wrap:anywhere]">
                                                                {task.notes}
                                                            </p>
                                                        </details>
                                                    )}
                                                </td>

                                                <td className="align-top">
                                                    <span
                                                        className={`badge whitespace-nowrap ${badgeClass}`}
                                                    >
                                                        {task.reportStatus}
                                                    </span>
                                                </td>

                                                <td className="min-w-40 align-top text-xs text-slate-600">
                                                    {task.completedAtDhaka ?? "—"}
                                                </td>

                                                <td className="min-w-32 align-top text-xs text-slate-600">
                                                    {task.nextShiftName ? (
                                                        <>
                                                            <p className="capitalize">
                                                                {task.nextShiftName}
                                                            </p>
                                                            <p className="mt-1">
                                                                {task.nextShiftDate}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <aside className="min-w-0 space-y-5">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold">
                                Email report
                            </h2>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${deliveryColor}`}
                            >
                                {deliveryLabel}
                            </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            An officer sends this report manually after
                            the shift ends.
                        </p>

                        {delivery && (
                            <dl className="mt-4 space-y-4 border-t border-slate-100 pt-4 text-sm">
                                <div>
                                    <dt className="text-xs text-slate-500">
                                        Requested by
                                    </dt>
                                    <dd className="mt-1 font-medium">
                                        {delivery.requestedByName ?? "Not recorded"}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs text-slate-500">
                                        Requested at · Dhaka
                                    </dt>
                                    <dd className="mt-1">
                                        {delivery.requestedAtDhaka ?? "—"}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs text-slate-500">
                                        Email server accepted at · Dhaka
                                    </dt>
                                    <dd className="mt-1">
                                        {delivery.sentAtDhaka ?? "—"}
                                    </dd>
                                </div>
                            </dl>
                        )}

                        {emailMessage && (
                            <p
                                role="status"
                                className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700"
                            >
                                {emailMessage}
                            </p>
                        )}

                        {delivery?.deliveryStatus === "Sent" ? (
                            <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                                Accepted for all recipients. Inbox delivery
                                is not confirmed by the application.
                            </p>
                        ) : delivery ? (
                            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                                A submission already exists. Refresh to
                                check its status. If unresolved, ask an
                                administrator to review it before retrying.
                            </p>
                        ) : hasEnded ? (
                            <form
                                action={sendSelectedShiftReport}
                                className="mt-4"
                            >
                                <input
                                    type="hidden"
                                    name="date"
                                    value={date}
                                />
                                <input
                                    type="hidden"
                                    name="shift"
                                    value={shiftName}
                                />

                                <SendReportButton />

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    Sends to the recipients configured
                                    by your administrator.
                                </p>
                            </form>
                        ) : (
                            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                                Sending becomes available after this
                                shift ends.
                            </p>
                        )}
                    </section>

                    {delivery && (
                        <details
                            key={`snapshot-${date}-${shiftName}`}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <summary className="cursor-pointer font-semibold">
                                {delivery.deliveryStatus === "Sent"
                                    ? "View sent report"
                                    : "View saved report snapshot"}
                            </summary>

                            <p className="mt-3 text-xs leading-5 text-slate-500">
                                Saved at submission time. Later task or
                                note changes do not alter this content.
                            </p>

                            <dl className="mt-4 space-y-3 text-sm">
                                <div>
                                    <dt className="text-xs font-semibold text-slate-500">
                                        Recipients
                                    </dt>
                                    <dd className="mt-1 [overflow-wrap:anywhere]">
                                        {delivery.recipientEmails}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs font-semibold text-slate-500">
                                        Subject
                                    </dt>
                                    <dd className="mt-1 [overflow-wrap:anywhere]">
                                        {delivery.reportSubject}
                                    </dd>
                                </div>
                            </dl>

                            <pre className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 font-sans text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]">
                                {delivery.reportBody}
                            </pre>
                        </details>
                    )}
                </aside>
            </div>
        </div>
    );
}

export default function ReportsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    return (
        <>
            <h1 className="text-3xl font-bold">
                Shift Reports
            </h1>

            <p className="mt-2 text-sm text-slate-500">
                Review shift work, handovers and manually submitted reports.
                Night shifts use the date they started.
            </p>

            <Suspense
                fallback={
                    <p
                        role="status"
                        className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600"
                    >
                        Loading report…
                    </p>
                }
            >
                <ShiftReport searchParams={searchParams} />
            </Suspense>
        </>
    );
}