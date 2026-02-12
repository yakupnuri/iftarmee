import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEvents } from "@/app/actions/events";
import { Header } from "@/components/Header";
import { GUEST_GROUPS } from "@/lib/guest-groups";
import { db } from "@/db/index";
import { groupAssignments, hosts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cn } from "@/lib/utils";
import { EventActionButtons } from "@/components/EventActionButtons";
import { WarningBanner } from "@/components/WarningBanner";
import { getRamadanDates, formatDate } from "@/lib/ramadan-dates";
import { getGroupUnavailability } from "@/app/actions/unavailability";
import { UnavailabilityCalendar } from "@/components/UnavailabilityCalendar";

export default async function MyInvitationsPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    const assignment = await db.query.groupAssignments.findFirst({
        where: eq(groupAssignments.email, session.user.email.toLowerCase()),
    });

    const isAdmin = session.user.email === "vahidnuri@gmail.com";

    if (!assignment && !isAdmin) {
        redirect("/");
    }

    const allEvents = await getEvents();
    const userEvents = isAdmin
        ? allEvents
        : allEvents.filter(e => e.guestGroupName === assignment?.guestGroupName);

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
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Benim Davetlerim</h2>
                        <p className="text-gray-500 font-medium text-lg">Hoş geldiniz, {session.user.name}. İşte Ramazan programınız:</p>
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

                <WarningBanner />

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
                        <div className="grid gap-6">
                            {userEvents.map(event => {
                                const status = event.status as keyof typeof statusStyles;
                                const eventDate = new Date(event.date);
                                const host = allHosts.find(h => h.id === event.hostId);

                                return (
                                    <div key={event.id} className={cn(
                                        "group relative bg-white rounded-3xl border-2 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col md:flex-row overflow-hidden",
                                        status === 'pending' ? "border-amber-100" :
                                            status === 'accepted' ? "border-emerald-100" : "border-red-100"
                                    )}>
                                        {/* Date Sidebar */}
                                        <div className={cn(
                                            "md:w-40 p-6 flex flex-col items-center justify-center text-center gap-1",
                                            status === 'pending' ? "bg-amber-50/50" :
                                                status === 'accepted' ? "bg-emerald-50/50" : "bg-red-50/50"
                                        )}>
                                            <div className="text-sm font-black opacity-50 uppercase tracking-tighter">
                                                {eventDate.toLocaleDateString("tr-TR", { month: 'long' })}
                                            </div>
                                            <div className="text-5xl font-black tabular-nums tracking-tighter">
                                                {eventDate.getDate()}
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                                {eventDate.toLocaleDateString("tr-TR", { weekday: 'long' })}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center gap-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={cn(
                                                    "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm",
                                                    status === 'pending' ? "bg-amber-100 border-amber-300 text-amber-800" :
                                                        status === 'accepted' ? "bg-emerald-100 border-emerald-300 text-emerald-800" :
                                                            "bg-red-100 border-red-300 text-red-800"
                                                )}>
                                                    {statusLabels[status]}
                                                </span>
                                                <span className="text-[11px] font-bold text-slate-400 tracking-wider">INV-{event.id.slice(0, 8).toUpperCase()}</span>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:text-primary-700 transition-colors">
                                                    {host?.name || "Bilinmeyen Ev Sahibi"}
                                                </h4>
                                                <p className="text-slate-500 font-medium italic">Davet Eden Kişi / Ev Sahibi</p>
                                            </div>

                                            {isAdmin && (
                                                <div className="text-[11px] font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg w-fit">
                                                    Grup: {event.guestGroupName}
                                                </div>
                                            )}

                                            {status === 'accepted' && event.rejectionReason && (
                                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm font-medium text-emerald-900 leading-relaxed relative">
                                                    <span className="absolute -top-3 left-4 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">Onay Mesajı</span>
                                                    &quot;{event.rejectionReason}&quot;
                                                </div>
                                            )}

                                            {status === 'rejected' && event.rejectionReason && (
                                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-medium text-red-900 leading-relaxed relative">
                                                    <span className="absolute -top-3 left-4 bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">Red Mesajı</span>
                                                    &quot;{event.rejectionReason}&quot;
                                                </div>
                                            )}
                                        </div>

                                        {/* Stats Section */}
                                        <div className="px-8 py-6 md:w-56 border-t md:border-t-0 md:border-l border-slate-50 flex flex-col items-center md:items-end justify-center gap-4">
                                            <div className="text-center md:text-right">
                                                <div className="text-4xl font-black text-slate-900 leading-none">
                                                    {event.participantCount}
                                                </div>
                                                <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Kişilik Davet</div>
                                            </div>

                                            {event.isDelivery && (
                                                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                                                    <span className="text-lg">🚚</span>
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Teslimat</span>
                                                </div>
                                            )}

                                            <div className="mt-2 w-full">
                                                <EventActionButtons eventId={event.id} currentStatus={event.status} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
