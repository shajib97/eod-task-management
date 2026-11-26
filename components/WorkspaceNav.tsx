"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface WorkspaceNavProps {
    role: "admin" | "operator";
}

const links = [
    { href: "/dashboard", label: "Dashboard", adminOnly: false },
    { href: "/shift-tasks", label: "Shift Tasks", adminOnly: false },
    { href: "/handovers", label: "Handovers", adminOnly: false },
    { href: "/reports", label: "Reports", adminOnly: false },
    { href: "/task-history", label: "Task History", adminOnly: false },
    { href: "/settings", label: "Settings", adminOnly: true },
];

function NavigationIcon({ href }: { href: string }) {
    let path: string;

    switch (href) {
        case "/dashboard":
            path =
                "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z";
            break;

        case "/shift-tasks":
            path =
                "M9 6h12 M9 12h12 M9 18h12 M3 6h1 M3 12h1 M3 18h1";
            break;

        case "/handovers":
            path =
                "M4 7h16 M16 3l4 4-4 4 M20 17H4 M8 13l-4 4 4 4";
            break;

        case "/reports":
            path =
                "M6 3h9l4 4v14H6z M14 3v5h5 M10 12h5 M10 16h5";
            break;

        case "/task-history":
            path =
                "M3 11a9 9 0 1 1 2.6 7.4 M3 4v7h7 M12 7v5l3 2";
            break;

        default:
            path =
                "M4 7h16 M4 17h16 M8 4v6 M16 14v6";
    }

    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 shrink-0"
        >
            <path d={path} />
        </svg>
    );
}

export default function WorkspaceNav({
    role,
}: WorkspaceNavProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const visibleLinks = links.filter(
        (link) => !link.adminOnly || role === "admin",
    );

    return (
        <>
            <a
                href="#workspace-content"
                className="sr-only z-50 rounded-lg bg-[#ffcf00] px-4 py-3 font-semibold text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
                Skip to content
            </a>

            <aside className="border-b border-slate-800 bg-slate-900 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between gap-3 px-4 py-4 lg:border-b lg:border-slate-800 lg:px-6 lg:py-6">
                    <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ffcf00] text-sm font-extrabold text-slate-900">
                            EOD
                        </span>

                        <span>
                            <span className="block text-base font-bold">
                                EOD Workspace
                            </span>

                            <span className="mt-1 block text-xs text-slate-400">
                                Task Management
                            </span>
                        </span>
                    </Link>

                    <button
                        type="button"
                        aria-expanded={mobileOpen}
                        aria-controls="workspace-navigation"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 lg:hidden"
                    >
                        {mobileOpen ? "Close" : "Menu"}
                    </button>
                </div>

                <nav
                    id="workspace-navigation"
                    aria-label="Workspace"
                    className={`${mobileOpen ? "block" : "hidden"
                        } px-3 pb-4 lg:block lg:flex-1 lg:px-4 lg:py-6`}
                >
                    <p className="mb-3 hidden px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:block">
                        Workspace
                    </p>

                    <ul className="space-y-2">
                        {visibleLinks.map((link) => {
                            const isActive =
                                pathname === link.href ||
                                pathname.startsWith(`${link.href}/`) ||
                                (link.href === "/settings" &&
                                    (
                                        pathname === "/users" ||
                                        pathname.startsWith("/users/") ||
                                        pathname === "/task-templates" ||
                                        pathname.startsWith("/task-templates/")
                                    ));

                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        aria-current={
                                            isActive ? "page" : undefined
                                        }
                                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${isActive
                                                ? "bg-[#ffcf00] text-slate-950 shadow-sm"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                            }`}
                                    >
                                        <NavigationIcon href={link.href} />
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="hidden border-t border-slate-800 px-6 py-5 lg:block">
                    <p className="text-xs font-semibold text-slate-300">
                        Eastern Bank PLC
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        ICT Division · EOD Operations
                    </p>
                </div>
            </aside>
        </>
    );
}