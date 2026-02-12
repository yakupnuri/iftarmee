"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/index";
import { hosts, events, groupAssignments, groupUnavailability } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { GUEST_GROUPS, getGuestGroupByName } from "@/lib/guest-groups";
import { nanoid } from "@/lib/nanoid";

import { isAdmin } from "@/app/actions/admin";
import { getGroups } from "@/app/actions/groups";
import {
  sendEmail,
  getNewInvitationEmailHtml,
  getInvitationAcceptedEmailHtml,
  getInvitationRejectedEmailHtml
} from "@/lib/mail";

export async function createEvent(formData: FormData) {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: "Unauthorized" };
  }

  const date = formData.get("date") as string;
  const guestGroupName = formData.get("guest_group") as string;

  if (!date || !guestGroupName) {
    return { error: "Missing fields" };
  }

  // Get groups from DB or Fallback
  const dbGroups = await getGroups();
  const guestGroups = dbGroups.length > 0 ? dbGroups : GUEST_GROUPS;
  const guestGroup = guestGroups.find(g => g.name === guestGroupName);

  if (!guestGroup) {
    return { error: "Invalid group" };
  }

  try {
    const host = await db.query.hosts.findFirst({
      where: eq(hosts.email, session.user.email),
    });

    if (!host) {
      return { error: "Davet oluşturma yetkiniz bulunmuyor. Lütfen yönetici ile iletişime geçin." };
    }

    // Check if the host already has an event on this date
    const existingHostEvent = await db.query.events.findFirst({
      where: and(
        eq(events.date, date),
        eq(events.hostId, host.id),
        ne(events.status, "rejected")
      ),
    });

    if (existingHostEvent) {
      return { error: "Bu tarih için zaten bir davetiniz bulunuyor. Aynı gün birden fazla davet oluşturamazsınız." };
    }

    const existingEvent = await db.query.events.findFirst({
      where: and(
        eq(events.date, date),
        eq(events.guestGroupName, guestGroupName),
        ne(events.status, "rejected")
      ),
    });

    if (existingEvent) {
      return { error: "Bu grup için bu tarihte zaten bir davet bulunuyor." };
    }

    // --- YENİ: Grubun kendi işaretlediği DOLU GÜN kontrolü ---
    const groupIsUnavailable = await db.query.groupUnavailability.findFirst({
      where: and(
        eq(groupUnavailability.date, date),
        eq(groupUnavailability.guestGroupName, guestGroupName)
      )
    });

    if (groupIsUnavailable) {
      return { error: "Bu grup bu tarihte müsait olmadığını (dolu olduğunu) belirtmiştir." };
    }

    await db.insert(events).values({
      id: nanoid(),
      date,
      hostId: host.id,
      guestGroupName,
      participantCount: guestGroup.count,
      isDelivery: guestGroup.isDelivery,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/host");
    revalidatePath("/admin");

    // -- Mail Gönderimi (Yeni Davet) --
    const groupEmail = (guestGroup as any).email;
    if (groupEmail) {
      await sendEmail({
        to: groupEmail,
        subject: `Yeni İftar Daveti: ${session.user.name} `,
        html: getNewInvitationEmailHtml(session.user.name || "Bir Davet Sahibi", date, guestGroupName)
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating event:", error);
    return { error: "Failed to create event" };
  }
}

export async function getEvents() {
  try {
    const allEvents = await db.query.events.findMany();
    return allEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

export async function acceptEvent(eventId: string) {
  if (!eventId) return { error: "Geçersiz davet kimliği." };

  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  if (!userEmail) return { error: "Oturum açmanız gerekiyor." };

  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) return { error: "Davet bulunamadı veya silinmiş." };

    // Yetki Kontrolü: Admin mi yoksa bu grubun sorumlusu mu?
    const admin = userEmail === "vahidnuri@gmail.com";
    let isAuthorized = admin;

    if (!admin) {
      const assignment = await db.query.groupAssignments.findFirst({
        where: and(
          eq(groupAssignments.email, userEmail),
          eq(groupAssignments.guestGroupName, event.guestGroupName)
        ),
      });
      if (assignment) isAuthorized = true;
    }

    if (!isAuthorized) return { error: "Bu daveti onaylama yetkiniz bulunmuyor." };

    await db.update(events)
      .set({
        status: "accepted",
        updatedAt: new Date(),
        rejectionReason: "Nazik davetiniz için çok teşekkür ederiz, memnuniyetle davetinize icabet edeceğiz. İftar sofranızda buluşmak dileğiyle."
      })
      .where(eq(events.id, eventId));

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/my-invitations");

    // -- Mail Gönderimi (Davet Kabul Edildi) --
    const host = await db.query.hosts.findFirst({
      where: eq(hosts.id, event.hostId)
    });
    if (host?.email) {
      await sendEmail({
        to: host.email,
        subject: "İftar Davetiniz Kabul Edildi! ✅",
        html: getInvitationAcceptedEmailHtml(host.name, event.date, event.guestGroupName)
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Accept Error:", error);
    return { error: "Onaylama işlemi sırasında bir hata oluştu." };
  }
}

export async function rejectEvent(eventId: string, reason?: string) {
  if (!eventId) return { error: "Geçersiz davet kimliği." };

  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();
  if (!userEmail) return { error: "Oturum açmanız gerekiyor." };

  const defaultReason = "Nazik davetiniz için çok teşekkür ederiz. Maalesef o gün için başka bir programımız olduğundan dolayı davetinize icabet edemeyeceğiz. Başka bir zaman görüşmek dileğiyle.";

  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) return { error: "Davet bulunamadı veya silinmiş." };

    // Yetki Kontrolü
    const admin = userEmail === "vahidnuri@gmail.com";
    let isAuthorized = admin;

    if (!admin) {
      const assignment = await db.query.groupAssignments.findFirst({
        where: and(
          eq(groupAssignments.email, userEmail),
          eq(groupAssignments.guestGroupName, event.guestGroupName)
        ),
      });
      if (assignment) isAuthorized = true;
    }

    if (!isAuthorized) return { error: "Bu daveti reddetme yetkiniz bulunmuyor." };

    await db.update(events)
      .set({
        status: "rejected",
        rejectionReason: reason || defaultReason,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId));

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/my-invitations");

    // -- Mail Gönderimi (Davet Reddedildi) --
    const hostData = await db.query.hosts.findFirst({
      where: eq(hosts.id, event.hostId)
    });
    const finalReason = reason || defaultReason;
    if (hostData?.email) {
      await sendEmail({
        to: hostData.email,
        subject: "İftar Davetiniz Hakkında Bilgilendirme ❌",
        html: getInvitationRejectedEmailHtml(hostData.name, event.date, event.guestGroupName, finalReason)
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Reject Error:", error);
    return { error: "Reddetme işlemi sırasında bir hata oluştu." };
  }
}

export async function updateEvent(eventId: string, data: { participantCount: number; isDelivery: boolean }) {
  try {
    await db.update(events)
      .set({
        participantCount: data.participantCount,
        isDelivery: data.isDelivery,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId));

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/my-invitations");
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    return { error: "Davet güncellenemedi." };
  }
}
export async function markAsNoShow(eventId: string) {
  const session = await auth();
  const userEmail = session?.user?.email?.toLowerCase();

  if (!userEmail) return { error: "Unauthorized" };

  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!event) return { error: "Event not found" };

    // Auth check: Host or Admin
    const host = await db.query.hosts.findFirst({
      where: eq(hosts.email, userEmail),
    });

    const isAdmin = userEmail === "vahidnuri@gmail.com";

    if (!isAdmin && (!host || host.id !== event.hostId)) {
      return { error: "Unauthorized" };
    }

    await db.update(events)
      .set({
        status: "no_show",
        updatedAt: new Date(),
        rejectionReason: "Davetliler iftara katılmadı."
      })
      .where(eq(events.id, eventId));

    revalidatePath("/host");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("No Show Error:", error);
    return { error: "Failed to update status." };
  }
}
