import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { getTaskTemplates } from "../../../lib/workspace-api";
import { requireAdmin } from "../../../lib/permissions";
import { addTaskTemplate, updateTemplateStatus } from "./actions";
import SubmitButton from "../../../components/SubmitButton";
import EditTaskTemplate from "../../../components/EditTaskTemplate";

type SearchParams = Promise<{
    shift?: string | string[];
    status?: string | string[];
}>;

async function TemplatesContent({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    await connection();
    await requireAdmin();

    const params = await searchParams;
    const templates = await getTaskTemplates();

    const shift =
        params.shift === "morning" ||
            params.shift === "evening" ||
            params.shift === "night"
            ? params.shift
            : "all";

    const status =
        params.status === "active" || params.status === "inactive"
            ? params.status
            : "all";

    const filteredTemplates = templates.filter((template) => {
        const matchesShift =
            shift === "all" || template.shift_name === shift;

        const isActive = Boolean(template.is_active);

        const matchesStatus =
            status === "all" ||
            (status === "active" && isActive) ||
            (status === "inactive" && !isActive);

        return matchesShift && matchesStatus;
    });

    const activeCount = templates.filter(
        (template) => Boolean(template.is_active),
    ).length;

    const summary = [
        {
            label: "Total templates",
            count: templates.length,
            accent: "border-amber-400",
        },
        {
            label: "Active",
            count: activeCount,
            accent: "border-emerald-400",
        },
        {
            label: "Inactive",
            count: templates.length - activeCount,
            accent: "border-slate-400",
        },
    ];

    return (
        <>
            <Link
                href="/settings?tab=tasks"
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
                <span aria-hidden="true">←</span>
                Back to Settings
            </Link>

            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                    Task Templates
                </h1>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                    Admin only
                </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
                Manage regular tasks used to generate shift checklists.
            </p>

            <dl className="mt-6 grid grid-cols-3 gap-3">
                {summary.map((item) => (
                    <div
                        key={item.label}
                        className={`rounded-xl border border-slate-200 border-t-4 ${item.accent} bg-white p-4 shadow-sm`}
                    >
                        <dt className="text-xs text-slate-500">
                            {item.label}
                        </dt>

                        <dd className="mt-2 text-2xl font-bold">
                            {item.count}
                        </dd>
                    </div>
                ))}
            </dl>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-3">
                <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
                    <div className="border-b border-slate-100 p-5">
                        <h2 className="text-lg font-semibold">
                            Templates by shift
                        </h2>

                        <form
                            key={`filters-${shift}-${status}`}
                            action="/task-templates"
                            method="get"
                            className="mt-4 flex flex-wrap items-end gap-3"
                        >
                            <label className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-slate-600">
                                    Shift
                                </span>

                                <select
                                    name="shift"
                                    defaultValue={shift}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="all">All shifts</option>
                                    <option value="morning">Morning</option>
                                    <option value="evening">Evening</option>
                                    <option value="night">Night</option>
                                </select>
                            </label>

                            <label className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-slate-600">
                                    Status
                                </span>

                                <select
                                    name="status"
                                    defaultValue={status}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </label>

                            <button
                                type="submit"
                                className="rounded-lg bg-brand text-brand-ink px-4 py-2 text-sm font-semibold hover:bg-amber-400"
                            >
                                Apply
                            </button>

                            <Link
                                href="/task-templates"
                                className="px-2 py-2 text-sm text-slate-600 underline underline-offset-4"
                            >
                                Clear
                            </Link>
                        </form>

                        <p className="mt-3 text-xs text-slate-500">
                            Showing {filteredTemplates.length} of{" "}
                            {templates.length} templates
                        </p>
                    </div>

                    {filteredTemplates.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-slate-600">
                            {templates.length === 0
                                ? "No task templates have been added yet."
                                : "No templates match these filters."}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col">Task name</th>
                                        <th scope="col">Shift</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredTemplates.map((template) => {
                                        const isActive =
                                            Boolean(template.is_active);

                                        const buttonLabel = isActive
                                            ? "Deactivate"
                                            : "Activate";

                                        return (
                                            <tr key={template.id}>
                                                <td className="min-w-64 align-top">
                                                    <EditTaskTemplate
                                                        id={template.id}
                                                        name={template.name}
                                                    />

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Template #{template.id}
                                                    </p>
                                                </td>

                                                <td className="align-top capitalize">
                                                    {template.shift_name}
                                                </td>

                                                <td className="align-top">
                                                    <span
                                                        className={`badge ${isActive
                                                                ? "badge-success"
                                                                : "badge-neutral"
                                                            }`}
                                                    >
                                                        {isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>

                                                <td className="align-top">
                                                    <form
                                                        action={updateTemplateStatus}
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="id"
                                                            value={template.id}
                                                        />

                                                        <input
                                                            type="hidden"
                                                            name="active"
                                                            value={
                                                                isActive ? "0" : "1"
                                                            }
                                                        />

                                                        <SubmitButton
                                                            label={buttonLabel}
                                                            pendingLabel="Saving…"
                                                            ariaLabel={`${buttonLabel}: ${template.name}, ${template.shift_name} shift`}
                                                            className={`btn-sm rounded-lg shadow-none ${isActive
                                                                    ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                                                    : "border-amber-400 bg-brand text-brand-ink hover:bg-amber-400"
                                                                }`}
                                                        />
                                                    </form>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <aside className="space-y-5">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold">
                            Add task template
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Create a regular checklist task for a shift.
                        </p>

                        <form
                            action={addTaskTemplate}
                            className="mt-5 space-y-4"
                        >
                            <label className="block">
                                <span className="mb-1 block text-sm font-medium">
                                    Task name
                                </span>

                                <input
                                    name="name"
                                    required
                                    maxLength={120}
                                    placeholder="Review backup status"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-sm font-medium">
                                    Shift
                                </span>

                                <select
                                    name="shift"
                                    defaultValue="morning"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="morning">Morning</option>
                                    <option value="evening">Evening</option>
                                    <option value="night">Night</option>
                                </select>
                            </label>

                            <SubmitButton
                                label="Add template"
                                pendingLabel="Saving…"
                                className="w-full rounded-lg border-amber-400 bg-brand text-brand-ink hover:bg-amber-400"
                            />
                        </form>
                    </section>

                    <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                        <h2 className="text-sm font-semibold">
                            How templates work
                        </h2>

                        <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-6 text-slate-600">
                            <li>
                                Active templates are used when generating
                                a shift checklist.
                            </li>
                            <li>
                                Deactivating a template does not remove
                                tasks already generated.
                            </li>
                            <li>
                                Renaming a template does not rename
                                existing shift tasks.
                            </li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
}

export default function TaskTemplatesPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    return (
        <Suspense
            fallback={
                <p
                    role="status"
                    className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600"
                >
                    Loading templates…
                </p>
            }
        >
            <TemplatesContent searchParams={searchParams} />
        </Suspense>
    );
}