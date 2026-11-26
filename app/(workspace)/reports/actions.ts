"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mutate } from "../../../lib/backend";
import type { ShiftKey } from "../../../lib/workspace-api";

export async function sendSelectedShiftReport(formData: FormData) {
    const { shift, status } = await mutate<{ shift?: ShiftKey; status: string }>("/reports/send", formData);
    const query = new URLSearchParams();
    if (shift) {
        query.set("date", shift.date);
        query.set("shift", shift.name);
    }
    query.set("email", status);
    if (shift && status !== "not-ended") revalidatePath("/reports");
    redirect(`/reports?${query}`);
}
