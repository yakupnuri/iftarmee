"use server";

import { db } from "@/db/index";
import { groupUnavailability } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "@/lib/nanoid";
import { auth } from "@/lib/auth";

export async function toggleUnavailability(date: string, guestGroupName: string) {
    const session = await auth();
    if (!session?.user?.email) return { error: "Unauthorized" };

    try {
        // Check if already exists
        const existing = await db.query.groupUnavailability.findFirst({
            where: and(
                eq(groupUnavailability.date, date),
                eq(groupUnavailability.guestGroupName, guestGroupName)
            )
        });

        if (existing) {
            // Remove
            await db.delete(groupUnavailability)
                .where(eq(groupUnavailability.id, existing.id));
        } else {
            // Add
            await db.insert(groupUnavailability).values({
                id: nanoid(),
                date,
                guestGroupName,
                reason: "Grup tarafından dolu olarak işaretlendi",
                createdAt: new Date()
            });
        }

        revalidatePath("/my-invitations");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Toggle Unavailability Error:", error);
        return { error: "İşlem sırasında bir hata oluştu" };
    }
}

export async function getGroupUnavailability(guestGroupName: string) {
    try {
        return await db.query.groupUnavailability.findMany({
            where: eq(groupUnavailability.guestGroupName, guestGroupName)
        });
    } catch (error) {
        console.error("Get Unavailability Error:", error);
        return [];
    }
}
