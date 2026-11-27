"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { syncWorkspace } from "../app/(workspace)/actions";

export default function ShiftSync() {
    const router = useRouter();
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let active = true;
        let running = false;

        async function sync() {
            if (running || document.hidden) return;
            running = true;

            try {
                const result = await syncWorkspace();

                if (!active) return;

                setFailed(!result.success);

                if (result.success) {
                    router.refresh();
                }
            } catch {
                if (active) setFailed(true);
            } finally {
                running = false;
            }
        }

        void sync();
        const timer = window.setInterval(() => void sync(), 60_000);

        return () => {
            active = false;
            window.clearInterval(timer);
        };
    }, [router]);

    if (!failed) return null;

    return (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">
            Couldn’t update the shift checklist. Refresh to retry.
        </p>
    );
}