"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mutate } from "../../../lib/backend";

export async function saveEmailReportSettings(formData: FormData) {
    const { status } = await mutate<{ status: "invalid" | "saved" }>("/settings/email", formData);
    if (status === "saved") {
        revalidatePath("/settings");
        revalidatePath("/reports");
    }
    redirect(`/settings?email=${status}`);
}
