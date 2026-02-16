"use server";

import { db } from "@/db/index";
import { guestGroups, groupAssignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "@/lib/nanoid";
import { auth } from "@/lib/auth";

import { ADMIN_EMAILS } from "@/lib/admin-emails";

async function checkAdmin() {
    const session = await auth();
    return session?.user?.email ? ADMIN_EMAILS.includes(session.user.email.toLowerCase()) : false;
}

export async function getGroups() {
    return await db.query.guestGroups.findMany({
        orderBy: (groups, { desc }) => [desc(groups.createdAt)],
    });
}

export async function createGroup(data: {
    name: string;
    email: string;
    count: number;
    isDelivery: boolean;
    color?: string;
}) {
    if (!(await checkAdmin())) throw new Error("Unauthorized");

    const id = nanoid();
    await db.insert(guestGroups).values({
        id,
        name: data.name,
        email: data.email,
        count: data.count,
        isDelivery: data.isDelivery,
        color: data.color || "bg-slate-100 border-slate-300 text-slate-800",
        createdAt: new Date(),
    });

    // Also create or update group assignment
    await db.insert(groupAssignments).values({
        guestGroupName: data.name,
        email: data.email,
        updatedAt: new Date(),
    }).onConflictDoUpdate({
        target: groupAssignments.guestGroupName,
        set: {
            email: data.email,
            updatedAt: new Date(),
        },
    });

    revalidatePath("/admin");
    return { success: true };
}

export async function updateGroup(id: string, data: {
    name: string;
    email: string;
    count: number;
    isDelivery: boolean;
    color?: string;
}) {
    if (!(await checkAdmin())) throw new Error("Unauthorized");

    const oldGroup = await db.query.guestGroups.findFirst({
        where: eq(guestGroups.id, id),
    });

    if (!oldGroup) throw new Error("Group not found");

    await db.update(guestGroups)
        .set({
            name: data.name,
            email: data.email,
            count: data.count,
            isDelivery: data.isDelivery,
            color: data.color,
        })
        .where(eq(guestGroups.id, id));

    // Update assignment if name changed or email changed
    await db.update(groupAssignments)
        .set({
            guestGroupName: data.name,
            email: data.email,
            updatedAt: new Date(),
        })
        .where(eq(groupAssignments.guestGroupName, oldGroup.name));

    revalidatePath("/admin");
    return { success: true };
}

export async function deleteGroup(id: string) {
    if (!(await checkAdmin())) throw new Error("Unauthorized");

    const group = await db.query.guestGroups.findFirst({
        where: eq(guestGroups.id, id),
    });

    if (group) {
        await db.delete(guestGroups).where(eq(guestGroups.id, id));
        // cascade will handle groupAssignments if foreign key is correctly set and supported
    }

    revalidatePath("/admin");
    return { success: true };
}

export async function migrateHardcodedGroups() {
    if (!(await checkAdmin())) throw new Error("Unauthorized");

    const { GUEST_GROUPS } = await import("@/lib/guest-groups");

    for (const group of GUEST_GROUPS) {
        const existing = await db.query.guestGroups.findFirst({
            where: eq(guestGroups.name, group.name),
        });

        if (!existing) {
            const id = nanoid();
            await db.insert(guestGroups).values({
                id,
                name: group.name,
                email: "placeholder@example.com", // Default email
                count: group.count,
                isDelivery: group.isDelivery,
                color: group.color,
                createdAt: new Date(),
            });

            await db.insert(groupAssignments).values({
                guestGroupName: group.name,
                email: "placeholder@example.com",
                updatedAt: new Date(),
            }).onConflictDoNothing();
        }
    }

    revalidatePath("/admin");
    return { success: true };
}
