"use server";

import { mutate } from "../../lib/backend";

export async function syncWorkspace() {
    return mutate<{ success: boolean }>("/shifts/sync");
}
