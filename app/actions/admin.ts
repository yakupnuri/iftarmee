"use server";

import { db } from "@/db/index";
import { hosts, events, groupAssignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { nanoid } from "@/lib/nanoid";

import { ADMIN_EMAILS } from "@/lib/admin-emails";

export async function isAdmin() {
    const session = await auth();
    return session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase());
}

export async function addAllowedHost(email: string, name: string) {
    const admin = await isAdmin();
    if (!admin) return { error: "Unauthorized" };

    try {
        await db.insert(hosts).values({
            id: nanoid(),
            email,
            name,
            createdAt: new Date(),
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { error: "Host eklenemedi (muhtemelen zaten ekli)" };
    }
}

export async function removeAllowedHost(id: string) {
    const admin = await isAdmin();
    if (!admin) return { error: "Unauthorized" };

    try {
        // Admin kendisini silemesin
        const host = await db.query.hosts.findFirst({ where: eq(hosts.id, id) });
        if (host && ADMIN_EMAILS.includes(host.email)) {
            return { error: "Admin silinemez" };
        }

        await db.delete(hosts).where(eq(hosts.id, id));
        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        return { error: "Host silinemedi" };
    }
}

export async function getAllHosts() {
    const admin = await isAdmin();
    if (!admin) return [];
    return await db.query.hosts.findMany();
}

export async function assignEmailToGroup(groupName: string, email: string) {
    const admin = await isAdmin();
    if (!admin) return { error: "Unauthorized" };

    try {
        await db.insert(groupAssignments)
            .values({
                guestGroupName: groupName,
                email: email.toLowerCase(),
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: groupAssignments.guestGroupName,
                set: {
                    email: email.toLowerCase(),
                    updatedAt: new Date()
                }
            });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error assigning email:", error);
        return { error: "E-posta atanamadı." };
    }
}

export async function getGroupAssignments() {
    const admin = await isAdmin();
    if (!admin) return [];
    return await db.query.groupAssignments.findMany();
}
