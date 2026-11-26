"use server";

import { revalidatePath } from "next/cache";
import { mutate } from "../../../lib/backend";

export async function addTask(formData: FormData) {
    await mutate<void>("/tasks", formData);
    revalidatePath("/shift-tasks");
    revalidatePath("/dashboard");
}

export async function updateTaskStatus(formData: FormData) {
    await mutate<void>("/tasks/status", formData);
    revalidatePath("/shift-tasks");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/task-history");
}

export async function generateShiftChecklist() {
    await mutate<void>("/tasks/checklist");
    revalidatePath("/shift-tasks");
    revalidatePath("/dashboard");
}

export async function updateTaskNotes(formData: FormData) {
    const result = await mutate<{ success: boolean; message: string }>("/tasks/notes", formData);
    if (!result.success) return result;
    revalidatePath("/shift-tasks");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return result;
}
