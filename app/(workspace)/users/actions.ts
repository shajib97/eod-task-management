"use server";

import { revalidatePath } from "next/cache";
import { mutate } from "../../../lib/backend";

export async function addApprovedUser(formData: FormData) {
    await mutate<void>("/users", formData);
    revalidatePath("/users");
}

export async function manageApprovedUser(formData: FormData) {
    await mutate<void>("/users/access", formData);
    revalidatePath("/users");
}
