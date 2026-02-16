import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEvents } from "@/app/actions/events";
import { Header } from "@/components/Header";
import { GUEST_GROUPS } from "@/lib/guest-groups";
import { db } from "@/db/index";
import { ADMIN_EMAILS } from "@/lib/admin-emails";
import { groupAssignments, hosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cn } from "@/lib/utils";
import { EventActionButtons } from "@/components/EventActionButtons";
import { WarningBanner } from "@/components/WarningBanner";
import { getRamadanDates, formatDate } from "@/lib/ramadan-dates";
import { getGroupUnavailability } from "@/app/actions/unavailability";
import { UnavailabilityCalendar } from "@/components/UnavailabilityCalendar";
import { InvitationsTable } from "@/components/InvitationsTable";
import { getGroups } from "@/app/actions/groups";

export default async function MyInvitationsPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const assignment = await db.query.groupAssignments.findFirst({
        where: eq(groupAssignments.email, session.user.email.toLowerCase()),
    });

    const host = await db.query.hosts.findFirst({
        where: eq(hosts.email, session.user.email.toLowerCase()),
    });

    if (!assignment && !host) {
        redirect("/");
    }

    const allEvents = await getEvents();
    const groups = await getGroups();
    const isAdminUser = session.user.email ? ADMIN_EMAILS.includes(session.user.email.toLowerCase()) : false;

    // Filtreleme: Kullanıcının içinde olduğu davetler
    // 1. Ev sahibi olduğu davetler
    // 2. Misafir grubu içinde olduğu davetler
    const userEvents = allEvents.filter(e => {
        const isHost = host && e.hostId === host.id;
        const isGuest = assignment && e.guestGroupName === assignment.guestGroupName;
        return isHost || isGuest;
    });


    userEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const statusStyles = {
        pending: "bg-amber-50 border-amber-200 text-amber-800",
        accepted: "bg-emerald-50 border-emerald-200 text-emerald-800",
        rejected: "bg-red-50 border-red-200 text-red-800",
    };

    const statusLabels = {
        pending: "Beklemede",
        accepted: "Onaylandı",
        rejected: "Reddedildi",
    };
    const allHosts = await db.query.hosts.findMany();
    const ramadanDates = getRamadanDates();
    const unavailability = assignment ? await getGroupUnavailability(assignment.guestGroupName) : [];
    const unavailableDates = unavailability.map(u => u.date);
    const bookedDates = userEvents
        .filter(e => e.status === 'accepted' || e.status === 'pending')
        .map(e => e.date);

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-5xl space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                            {isAdminUser ? "Tüm Davetler" : "Benim Davetlerim"}
                        </h2>
                        <p className="text-gray-500 font-medium text-lg">
                            Hoş geldiniz, {session.user.name}. {isAdminUser ? "Sistemdeki tüm davetleri görüntülüyorsunuz." : "İşte Ramazan programınız:"}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <div className="bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-2xl text-center min-w-[100px]">
                            <div className="text-2xl font-black text-emerald-600">{userEvents.filter(e => e.status === 'accepted').length}</div>
                            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Onaylı</div>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 px-4 py-3 rounded-2xl text-center min-w-[100px]">
                            <div className="text-2xl font-black text-amber-600">{userEvents.filter(e => e.status === 'pending').length}</div>
                            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Bekleyen</div>
                        </div>
                    </div>
                </div>



                {assignment && (
                    <UnavailabilityCalendar
                        ramadanDates={ramadanDates}
                        unavailableDates={unavailableDates}
                        guestGroupName={assignment.guestGroupName}
                        bookedDates={bookedDates}
                    />
                )}

                <div className="border-t border-slate-200 mt-12 pt-10">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6">Gelen Davet Detayları</h3>
                    {userEvents.length === 0 ? (
                        <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-slate-200 text-slate-400">
                            <div className="text-5xl mb-4">🌙</div>
                            <p className="text-xl font-bold">Henüz bir iftar daveti almadınız.</p>
                            <p className="mt-2 text-sm">Giriş yaptığınız e-posta adresine bir grup atanmış olmalıdır.</p>
                        </div>
                    ) : (
                        <InvitationsTable
                            events={userEvents}
                            hosts={allHosts}
                            isAdmin={isAdminUser}
                            guestGroups={groups}
                        />
                    )}
                </div>

                <WarningBanner />
            </main>
        </div>
    );
}
