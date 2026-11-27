import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { getApprovedUsers } from "../../../lib/workspace-api";
import { requireAdmin } from "../../../lib/permissions";
import { addApprovedUser, manageApprovedUser } from "./actions";
import SubmitButton from "../../../components/SubmitButton";

type SearchParams = Promise<{
    role?: string | string[];
    status?: string | string[];
}>;

async function UserAccessContent({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    await connection();

    const access = await requireAdmin();
    const currentEmail = access.user.email.trim().toLowerCase();
    const params = await searchParams;

    const role =
        params.role === "admin" || params.role === "operator"
            ? params.role
            : "all";

    const status =
        params.status === "active" || params.status === "inactive"
            ? params.status
            : "all";

    const users = await getApprovedUsers();

    const filteredUsers = users.filter((user) => {
        const matchesRole = role === "all" || user.role === role;
        const isActive = Boolean(user.is_active);

        const matchesStatus =
            status === "all" ||
            (status === "active" && isActive) ||
            (status === "inactive" && !isActive);

        return matchesRole && matchesStatus;
    });

    const activeCount = users.filter(
        (user) => Boolean(user.is_active),
    ).length;

    const activeAdmins = users.filter(
        (user) => user.role === "admin" && Boolean(user.is_active),
    ).length;

    const summary = [
        {
            label: "Listed emails",
            count: users.length,
            accent: "border-amber-400",
        },
        {
            label: "Active access",
            count: activeCount,
            accent: "border-emerald-400",
        },
        {
            label: "Inactive access",
            count: users.length - activeCount,
            accent: "border-slate-400",
        },
        {
            label: "Active admins",
            count: activeAdmins,
            accent: "border-blue-400",
        },
    ];

    return (
        <>
            <Link
                href="/settings?tab=team"
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
                <span aria-hidden="true">←</span>
                Back to Settings
            </Link>

            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">
                    User Access
                </h1>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                    Admin only
                </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
                Manage approved work emails and workspace access.
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
                            Approved emails
                        </h2>

                        <form
                            key={`filters-${role}-${status}`}
                            action="/users"
                            method="get"
                            className="mt-4 flex flex-wrap items-end gap-3"
                        >
                            <label className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-slate-600">
                                    Role
                                </span>

                                <select
                                    name="role"
                                    defaultValue={role}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="all">All roles</option>
                                    <option value="operator">
                                        EOD Operator
                                    </option>
                                    <option value="admin">Admin</option>
                                </select>
                            </label>

                            <label className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-slate-600">
                                    Access
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
                                className="rounded-lg bg-[#ffcf00] text-brand-ink px-4 py-2 text-sm font-semibold hover:bg-amber-400"
                            >
                                Apply
                            </button>

                            <Link
                                href="/users"
                                className="px-2 py-2 text-sm text-slate-600 underline underline-offset-4"
                            >
                                Clear
                            </Link>
                        </form>

                        <p className="mt-3 text-xs text-slate-500">
                            Showing {filteredUsers.length} of {users.length} entries
                        </p>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <p className="px-5 py-10 text-center text-sm text-slate-600">
                            No approved emails match these filters.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col">Work email</th>
                                        <th scope="col">Role</th>
                                        <th scope="col">Access</th>
                                        <th scope="col">Manage</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredUsers.map((user) => {
                                        const isActive =
                                            Boolean(user.is_active);

                                        const isSelf =
                                            user.email.toLowerCase() ===
                                            currentEmail;

                                        const buttonLabel = isActive
                                            ? "Deactivate"
                                            : "Activate";

                                        return (
                                            <tr key={user.email}>
                                                <td className="min-w-52 align-top">
                                                    <p className="font-medium [overflow-wrap:anywhere]">
                                                        {user.email}
                                                    </p>

                                                    {isSelf && (
                                                        <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                                                            You
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="align-top">
                                                    {user.role === "admin"
                                                        ? "Admin"
                                                        : "EOD Operator"}
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

                                                <td className="min-w-48 align-top">
                                                    {isSelf ? (
                                                        <p className="text-xs text-slate-500">
                                                            Own access protected
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <form
                                                                action={manageApprovedUser}
                                                            >
                                                                <input
                                                                    type="hidden"
                                                                    name="email"
                                                                    value={user.email}
                                                                />

                                                                <input
                                                                    type="hidden"
                                                                    name="operation"
                                                                    value={
                                                                        isActive
                                                                            ? "deactivate"
                                                                            : "activate"
                                                                    }
                                                                />

                                                                <SubmitButton
                                                                    label={buttonLabel}
                                                                    pendingLabel="Saving…"
                                                                    ariaLabel={`${buttonLabel} ${user.email}`}
                                                                    className="btn-sm rounded-lg border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                                                />
                                                            </form>

                                                            <details>
                                                                <summary className="cursor-pointer text-xs font-medium text-red-700">
                                                                    Remove approval
                                                                </summary>

                                                                <form
                                                                    action={manageApprovedUser}
                                                                    className="mt-3 space-y-3 rounded-lg border border-red-100 bg-red-50 p-3"
                                                                >
                                                                    <input
                                                                        type="hidden"
                                                                        name="email"
                                                                        value={user.email}
                                                                    />

                                                                    <input
                                                                        type="hidden"
                                                                        name="operation"
                                                                        value="remove"
                                                                    />

                                                                    <p className="text-xs leading-5 text-slate-600">
                                                                        Removes workspace approval.
                                                                        The registered account and
                                                                        task history remain.
                                                                    </p>

                                                                    <label className="flex items-center gap-2 text-xs">
                                                                        <input
                                                                            type="checkbox"
                                                                            name="confirmRemoval"
                                                                            value="yes"
                                                                            required
                                                                            className="checkbox checkbox-sm"
                                                                        />
                                                                        Confirm removal
                                                                    </label>

                                                                    <SubmitButton
                                                                        label="Remove approval"
                                                                        pendingLabel="Removing…"
                                                                        ariaLabel={`Remove approval for ${user.email}`}
                                                                        className="btn-sm rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-100"
                                                                    />
                                                                </form>
                                                            </details>
                                                        </div>
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

                <aside className="space-y-5">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold">
                            Approve work email
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            Add an email and assign its workspace role.
                        </p>

                        <form
                            action={addApprovedUser}
                            className="mt-5 space-y-4"
                        >
                            <label className="block">
                                <span className="mb-1 block text-sm font-medium">
                                    Work email
                                </span>

                                <input
                                    name="email"
                                    type="email"
                                    required
                                    maxLength={254}
                                    placeholder="colleague@ebl-bd.com"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-sm font-medium">
                                    Role
                                </span>

                                <select
                                    name="role"
                                    defaultValue="operator"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="operator">
                                        EOD Operator
                                    </option>
                                    <option value="admin">Admin</option>
                                </select>
                            </label>

                            <SubmitButton
                                label="Approve user"
                                pendingLabel="Saving…"
                                className="w-full rounded-lg border-amber-400 bg-[#ffcf00] text-brand-ink hover:bg-amber-400"
                            />
                        </form>
                    </section>

                    <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                        <h2 className="text-sm font-semibold">
                            Access safeguards
                        </h2>

                        <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-6 text-slate-600">
                            <li>
                                Your own access cannot be changed or removed here.
                            </li>
                            <li>
                                At least one active administrator must remain.
                            </li>
                            <li>
                                Deactivation keeps the approval entry but
                                blocks protected requests.
                            </li>
                            <li>
                                Approval does not create an account or
                                verify the user’s email.
                            </li>
                        </ul>
                    </section>
                </aside>
            </div>
        </>
    );
}

export default function UsersPage({
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
                    Loading user access…
                </p>
            }
        >
            <UserAccessContent searchParams={searchParams} />
        </Suspense>
    );
}