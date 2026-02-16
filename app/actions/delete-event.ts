"use server";

import { db } from "@/db/index";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteEvent(eventId: string) {
    try {
        await db.delete(events).where(eq(events.id, eventId));
        revalidatePath("/my-invitations");
        return { success: true };
    } catch (error) {
        console.error("Error deleting event:", error);
        return { success: false, error: "Silme işlemi başarısız oldu" };
    }
}
