import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "../../../lib/permissions";
import { getEmailReportSettings } from "../../../lib/workspace-api";
import SubmitButton from "../../../components/SubmitButton";
import { saveEmailReportSettings } from "./actions";

type SettingsPageProps = {
    searchParams: Promise<{
        tab?: string | string[];
        email?: string | string[];
    }>;
};

const tabs = [
    { key: "team", label: "Team Access" },
    { key: "tasks", label: "Task Templates" },
    { key: "email", label: "Email Recipients" },
];

async function SettingsContent({
    searchParams,
}: SettingsPageProps) {
    await requireAdmin();

    const params = await searchParams;

    const activeTab =
        params.email === "saved" || params.email === "invalid"
            ? "email"
            : params.tab === "tasks" || params.tab === "email"
                ? params.tab
                : "team";

    const settings =
        activeTab === "email"
            ? await getEmailReportSettings()
            : null;

    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                    Settings
                </h1>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                    Admin only
                </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
                Manage team access, recurring tasks and report recipients.
            </p>

            <nav
                aria-label="Settings sections"
                className="mt-6 flex gap-1 overflow-x-auto border-b border-slate-200"
            >
                {tabs.map((tab) => {
                    const selected = activeTab === tab.key;

                    return (
                        <Link
                            key={tab.key}
                            href={`/settings?tab=${tab.key}`}
                            aria-current={selected ? "page" : undefined}
                            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${selected
                                    ? "border-amber-500 text-slate-900"
                                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                                }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>

            {activeTab === "team" && (
                <div className="mt-6 grid items-start gap-5 xl:grid-cols-3">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                        <h2 className="text-xl font-semibold">
                            Team access
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Review approved users and manage their access
                            to the EOD workspace.
                        </p>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <h3 className="font-semibold">
                                    EOD Operators
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Work with shift tasks, handovers,
                                    history and reports.
                                </p>
                            </div>

                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                <h3 className="font-semibold">
                                    Administrators
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Manage workspace users, task templates
                                    and report recipients.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/users"
                            className="mt-6 inline-flex rounded-lg bg-[#ffcf00] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                        >
                            Manage user access
                        </Link>
                    </section>

                    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="font-semibold">
                            Access requirements
                        </h2>

                        <ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-6 text-slate-600">
                            <li>Users must sign in to the application.</li>
                            <li>Their work email must be verified.</li>
                            <li>Their access must be approved and active.</li>
                            <li>Settings are restricted to administrators.</li>
                        </ul>
                    </aside>
                </div>
            )}

            {activeTab === "tasks" && (
                <div className="mt-6 grid items-start gap-5 xl:grid-cols-3">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                        <h2 className="text-xl font-semibold">
                            Recurring task templates
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Manage the regular tasks used to generate
                            morning, evening and night shift checklists.
                        </p>

                        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <p className="text-sm leading-6 text-slate-700">
                                Active templates are used when a shift
                                checklist is generated. Officers can also
                                add custom tasks from Shift Tasks.
                            </p>
                        </div>

                        <Link
                            href="/task-templates"
                            className="mt-6 inline-flex rounded-lg bg-[#ffcf00] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                        >
                            Manage task templates
                        </Link>
                    </section>

                    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="font-semibold">
                            Shift timings
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Bangladesh time · Asia/Dhaka
                        </p>

                        <dl className="mt-4 space-y-4 text-sm">
                            <div>
                                <dt className="font-medium">Morning</dt>
                                <dd className="mt-1 text-slate-600">
                                    8:00 AM – 3:00 PM
                                </dd>
                            </div>

                            <div>
                                <dt className="font-medium">Evening</dt>
                                <dd className="mt-1 text-slate-600">
                                    3:00 PM – 10:00 PM
                                </dd>
                            </div>

                            <div>
                                <dt className="font-medium">Night</dt>
                                <dd className="mt-1 text-slate-600">
                                    10:00 PM – 8:00 AM the next day
                                </dd>
                            </div>
                        </dl>
                    </aside>
                </div>
            )}

            {activeTab === "email" && settings && (
                <div className="mt-6 grid items-start gap-5 xl:grid-cols-3">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                        <h2 className="text-xl font-semibold">
                            Report recipients
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Configure who receives shift reports sent
                            manually by officers.
                        </p>

                        {params.email === "saved" && (
                            <p
                                role="status"
                                className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
                            >
                                Report recipients saved.
                            </p>
                        )}

                        {params.email === "invalid" && (
                            <p
                                role="alert"
                                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
                            >
                                Enter between 1 and 10 valid email
                                addresses separated by commas.
                            </p>
                        )}

                        <form
                            key={settings.recipientEmails}
                            action={saveEmailReportSettings}
                            className="mt-5 space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="recipientEmails"
                                    className="block text-sm font-semibold"
                                >
                                    Recipient email addresses
                                </label>

                                <textarea
                                    id="recipientEmails"
                                    name="recipientEmails"
                                    defaultValue={settings.recipientEmails}
                                    required
                                    maxLength={2000}
                                    rows={5}
                                    placeholder="manager@example.com, supervisor@example.com"
                                    aria-describedby="recipient-help"
                                    className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                                />

                                <p
                                    id="recipient-help"
                                    className="mt-2 text-xs text-slate-500"
                                >
                                    Separate addresses with commas.
                                    Maximum 10 recipients.
                                </p>
                            </div>

                            <SubmitButton
                                label="Save recipients"
                                pendingLabel="Saving…"
                                className="rounded-lg border-amber-400 bg-[#ffcf00] text-slate-900 hover:bg-amber-400"
                            />
                        </form>
                    </section>

                    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="font-semibold">
                            Manual report delivery
                        </h2>

                        <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-600">
                            <li>Wait until the shift ends.</li>
                            <li>Review the selected shift in Reports.</li>
                            <li>Click Send report by email.</li>
                            <li>Review the saved submission status.</li>
                        </ol>

                        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                            Saving recipients does not send an email.
                            Existing report snapshots keep their original
                            recipient addresses.
                        </p>
                    </aside>
                </div>
            )}
        </>
    );
}

export default function SettingsPage({
    searchParams,
}: SettingsPageProps) {
    return (
        <Suspense
            fallback={
                <p
                    role="status"
                    className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600"
                >
                    Loading settings…
                </p>
            }
        >
            <SettingsContent searchParams={searchParams} />
        </Suspense>
    );
}