"use server";

import { revalidatePath } from "next/cache";
import { mutate } from "../../../lib/backend";

export async function addTaskTemplate(formData: FormData) {
    await mutate<void>("/templates", formData);
    revalidatePath("/task-templates");
}

export async function updateTemplateStatus(formData: FormData) {
    await mutate<void>("/templates/status", formData);
    revalidatePath("/task-templates");
}

export async function renameTaskTemplate(formData: FormData) {
    await mutate<void>("/templates/name", formData);
    revalidatePath("/task-templates");
}
