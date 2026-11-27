"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { workspaceThemeCookie, type WorkspaceTheme } from "../lib/workspace-theme";

const ThemeContext = createContext<{
    theme: WorkspaceTheme;
    setTheme: (theme: WorkspaceTheme) => void;
} | null>(null);

export function WorkspaceThemeProvider({
    initialTheme,
    children,
}: {
    initialTheme: WorkspaceTheme;
    children: ReactNode;
}) {
    const [theme, setTheme] = useState(initialTheme);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <div data-theme={theme} className="workspace-shell min-h-screen bg-slate-100 text-slate-900">
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function WorkspaceThemeToggle() {
    const preference = useContext(ThemeContext);
    if (!preference) throw new Error("The theme switch requires a workspace theme.");

    const { theme, setTheme } = preference;
    const dark = theme === "dark";
    const nextTheme = dark ? "light" : "dark";

    function switchTheme() {
        setTheme(nextTheme);
        const secure = location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `${workspaceThemeCookie}=${nextTheme}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    }

    return (
        <button
            type="button"
            role="switch"
            aria-label="Dark mode"
            aria-checked={dark}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={switchTheme}
            className="workspace-theme-toggle btn btn-square size-10 min-h-10"
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
            >
                {dark ? (
                    <>
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4m11.2-11.2L19 5" />
                    </>
                ) : (
                    <path d="M20.9 13.4A9 9 0 0 1 10.6 3.1a9 9 0 1 0 10.3 10.3Z" />
                )}
            </svg>
        </button>
    );
}
