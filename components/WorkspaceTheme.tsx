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

    return (
        <label className="workspace-theme-toggle flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-semibold">
            <span>Dark mode</span>
            <input
                type="checkbox"
                role="switch"
                checked={preference.theme === "dark"}
                className="toggle toggle-sm"
                onChange={(event) => {
                    const theme = event.currentTarget.checked ? "dark" : "light";
                    preference.setTheme(theme);
                    const secure = location.protocol === "https:" ? "; Secure" : "";
                    document.cookie = `${workspaceThemeCookie}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
                }}
            />
        </label>
    );
}
