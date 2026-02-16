import { Header } from "@/components/Header";
import { getEvents } from "@/app/actions/events";
import { getRamadanDates } from "@/lib/ramadan-dates";
import { GUEST_GROUPS } from "@/lib/guest-groups";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { hosts, groupAssignments, type Host, type Event as IftarEvent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getGroups } from "@/app/actions/groups";
import { CalendarGrid } from "@/components/CalendarGrid";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

export default async function HomePage() {
  const session = await auth();

  // Find assignment if logged in
  const assignment = session?.user?.email
    ? await db.query.groupAssignments.findFirst({
      where: eq(groupAssignments.email, session.user.email.toLowerCase()),
    })
    : null;

  const isGuestGroup = !!assignment;
  const guestGroupName = assignment?.guestGroupName || null;

  let events: IftarEvent[] = [];
  let allHosts: Host[] = [];
  let dbGroups: any[] = [];
  let unavailability: any[] = [];

  try {
    events = await getEvents();
    allHosts = await db.query.hosts.findMany();
    dbGroups = await getGroups();
    unavailability = await db.query.groupUnavailability.findMany();
  } catch (error) {
    console.error("Database fetch error:", error);
  }

  const guestGroups = dbGroups.length > 0 ? dbGroups : GUEST_GROUPS;
  const ramadanDates = getRamadanDates();

  let userEventCount = 0;
  let currentHost = null;

  // Host Stats
  if (session?.user?.email && !isGuestGroup) {
    try {
      currentHost = await db.query.hosts.findFirst({
        where: eq(hosts.email, session.user.email),
      });

      if (currentHost) {
        userEventCount = events.filter(
          (e) => e.hostId === currentHost!.id && (e.status === "pending" || e.status === "accepted")
        ).length;
      }
    } catch (error) {
      console.error("Host stats error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* User Stats Card */}
        {session && !isGuestGroup && (
          <div className="mb-10 bg-white rounded-2xl p-6 shadow-xl shadow-primary-900/5 border border-primary-100 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50 select-none pointer-events-none" />
            <div className="flex items-center gap-5 z-10">
              <img
                src={session.user?.image || "https://cdn.pixabay.com/photo/2024/02/06/05/36/ai-generated-8555954_1280.jpg"}
                alt="Profil"
                className="w-16 h-16 rounded-full border-2 border-primary-200 p-0.5 object-cover"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Hoş geldin, {session.user?.name}</h3>
                <p className="text-sm text-gray-500 font-medium">Bu ramazan bereketini paylaşıyoruz.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 z-10 w-full sm:w-auto">
              {!isGuestGroup && (
                <>
                  <div className="bg-primary-600 text-white px-6 py-4 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-primary-200 transform hover:scale-105 transition-transform w-full sm:w-32">
                    <span className="text-2xl font-black">{userEventCount}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-center">İftar Aldınız</span>
                  </div>
                  <Link href="/host" className="bg-white border-2 border-primary-600 text-primary-600 px-6 py-4 rounded-xl font-bold hover:bg-primary-50 transition-colors hidden sm:block">
                    Davet Oluştur
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Ramazan Takvimi
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              {isGuestGroup
                ? "Davetlerinizi ve programınızı buradan takip edebilirsiniz."
                : "İftar daveti durumlarını takip edin ve yerinizi ayırtın."}
            </p>
          </div>
        </div>

        <CalendarGrid
          events={events}
          allHosts={allHosts}
          guestGroups={guestGroups}
          unavailability={unavailability}
          ramadanDates={ramadanDates}
          isGuestGroup={isGuestGroup}
          guestGroupName={guestGroupName}
        />

        {!isGuestGroup && (
          <div className="mt-12 p-6 bg-white rounded-2xl border border-gray-100 flex flex-wrap items-center gap-6 shadow-sm">
            <span className="text-xs font-black uppercase text-gray-400 tracking-widest mr-2">Renk Anahtarı:</span>
            <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
              <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded-md"></div>
              <span className="text-sm font-bold text-gray-600">Boş</span>
            </div>
            <div className="flex items-center gap-2 pr-4 border-r border-gray-100">
              <div className="w-4 h-4 bg-amber-50 border-2 border-amber-300 rounded-md"></div>
              <span className="text-sm font-bold text-gray-800">Kısmen Dolu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-50 border-2 border-emerald-400 rounded-md"></div>
              <span className="text-sm font-bold text-emerald-800">Tüm Gruplar Dolu</span>
            </div>
          </div>
        )}
      </main>
      <PWAInstallPrompt />
    </div>
  );
}
