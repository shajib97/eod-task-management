import { cookies } from "next/headers";
import { Suspense, type ReactNode } from "react";
import EblLogo from "../../components/EblLogo";
import WorkspaceNav from "../../components/WorkspaceNav";
import ShiftSync from "../../components/ShiftSync";
import { requireOperator } from "../../lib/permissions";
import SignOutButton from "../../components/SignOutButton";
import { WorkspaceThemeProvider, WorkspaceThemeToggle } from "../../components/WorkspaceTheme";
import { workspaceThemeCookie } from "../../lib/workspace-theme";

async function ProtectedWorkspace({
    children,
}: {
    children: ReactNode;
}) {
    const [access, preferences] = await Promise.all([requireOperator(), cookies()]);
    const initialTheme = preferences.get(workspaceThemeCookie)?.value === "dark" ? "dark" : "light";

    return (
        <WorkspaceThemeProvider initialTheme={initialTheme}>
            <WorkspaceNav role={access.role} />

            <div className="min-w-0 lg:pl-64">
                <header className="workspace-header border-b border-amber-300 bg-brand">
                    <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div>
                            <p className="text-sm font-semibold">
                                Bank ICT Operations
                            </p>

                            <p className="mt-1 text-xs text-slate-700">
                                EOD Team Workspace
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                            <div className="text-right">
                                <p className="text-sm font-semibold sm:text-base">
                                    {access.user.name}
                                </p>

                                <p className="text-xs sm:text-sm">
                                    {access.role === "admin"
                                        ? "Admin"
                                        : "EOD Operator"}
                                </p>
                            </div>

                            <div className="hidden w-44 rounded-lg bg-white px-2 py-1 sm:block">
                                <EblLogo />
                            </div>

                            <WorkspaceThemeToggle />
                            <SignOutButton />
                        </div>
                    </div>
                </header>

                <main
                    id="workspace-content"
                    tabIndex={-1}
                    className="workspace-main mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
                >
                    <ShiftSync />
                    {children}
                </main>
            </div>
        </WorkspaceThemeProvider>
    );
}

export default function WorkspaceLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <Suspense
            fallback={
                <div
                    role="status"
                    className="grid min-h-screen place-items-center bg-slate-100 text-slate-600"
                >
                    Checking access…
                </div>
            }
        >
            <ProtectedWorkspace>
                {children}
            </ProtectedWorkspace>
        </Suspense>
    );
}