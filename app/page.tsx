import { Header } from "@/components/Header";
import { getEvents } from "@/app/actions/events";
import { getRamadanDates, formatDate, formatDateLong } from "@/lib/ramadan-dates";
import { GUEST_GROUPS } from "@/lib/guest-groups";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { hosts, type Host, type Event as IftarEvent } from "@/db/schema";
import { eq } from "drizzle-orm";

const statusColors = {
  empty: "bg-white hover:bg-gray-50 border-gray-200 text-gray-400 opacity-60",
  partiallyBooked: "bg-amber-50 border-amber-300 text-amber-800 shadow-sm",
  fullyBooked: "bg-emerald-50 border-emerald-400 text-emerald-800 shadow-md ring-1 ring-emerald-400/20",
};

const statusLabels = {
  empty: "Boş",
  partiallyBooked: "Kısmen Dolu",
  fullyBooked: "Tüm Gruplar Dolu",
};

function getGroupColor(groupName: string) {
  const group = GUEST_GROUPS.find(g => g.name === groupName);
  return group?.color || "bg-gray-100 border-gray-300 text-gray-800 hover:ring-gray-400";
}

export default async function HomePage() {
  const session = await auth();

  let events: IftarEvent[] = [];
  let allHosts: Host[] = [];
  try {
    events = await getEvents();
    allHosts = await db.query.hosts.findMany();
  } catch (error) {
    console.error("Database fetch error:", error);
  }

  const hostMap = new Map(allHosts.map(h => [h.id, h.name]));
  const ramadanDates = getRamadanDates();

  let userEventCount = 0;
  let currentHost = null;
  const isGuestGroup = session?.user?.name && GUEST_GROUPS.some(g => g.name === session.user?.name);
  const guestGroupName = isGuestGroup ? session.user?.name : null;

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

  // Host View Data
  const bookedDatesByGroup = new Map<string, Set<string>>();
  events.forEach((event) => {
    if (event.status !== "rejected") {
      if (!bookedDatesByGroup.has(event.guestGroupName)) {
        bookedDatesByGroup.set(event.guestGroupName, new Set());
      }
      bookedDatesByGroup.get(event.guestGroupName)!.add(event.date);
    }
  });

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

        <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {ramadanDates.map((date, index) => {
            const dateStr = formatDate(date);

            // GUEST GROUP LOGIC
            if (isGuestGroup) {
              const myEvent = events.find(e =>
                e.guestGroupName === guestGroupName &&
                e.date === dateStr &&
                e.status !== 'rejected'
              );

              const colorClass = myEvent ? getGroupColor(myEvent.guestGroupName) : statusColors.empty;

              return (
                <div
                  key={dateStr}
                  className={cn(
                    "border-2 rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 flex flex-col justify-between min-h-[140px]",
                    colorClass,
                    myEvent ? "shadow-md cursor-pointer hover:-translate-y-1 ring-offset-2 hover:ring-2" : "opacity-60 grayscale"
                  )}
                >
                  <div className="w-full">
                    <div className="text-sm font-bold opacity-60 uppercase tracking-widest mb-1">Ram. {index + 1}</div>
                    <div className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                      {formatDateLong(date).split(" ")[0]}
                      <br />
                      {formatDateLong(date).split(" ")[1]}
                    </div>
                  </div>

                  {myEvent ? (
                    <div className="mt-3 bg-white/40 rounded-lg p-2 backdrop-blur-sm">
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-0.5">Davet Sahibi</div>
                      <div className="text-xs font-black truncate leading-tight">
                        {hostMap.get(myEvent.hostId) || 'Host'}
                      </div>
                      <div className="text-xs font-black truncate">
                        {myEvent.status === 'pending' ? 'Bekliyor' : 'Kabul Edildi'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] sm:text-xs font-black mt-4 uppercase tracking-tighter bg-gray-100 py-1.5 rounded-full inline-block text-gray-400">
                      Boş
                    </div>
                  )}
                </div>
              );
            }

            // HOST / ADMIN LOGIC (Existing)
            const bookedGroups = Array.from(bookedDatesByGroup.entries())
              .filter(([_, dates]) => dates.has(dateStr))
              .map(([group]) => group);

            const isFullyBooked = bookedGroups.length >= GUEST_GROUPS.length;
            const isPartiallyBooked = bookedGroups.length > 0;

            let status: keyof typeof statusColors;
            let statusLabel: string;

            if (isFullyBooked) {
              status = "fullyBooked";
              statusLabel = statusLabels.fullyBooked;
            } else if (isPartiallyBooked) {
              status = "partiallyBooked";
              statusLabel = `${statusLabels.partiallyBooked} (${bookedGroups.length})`;
            } else {
              status = "empty";
              statusLabel = statusLabels.empty;
            }

            return (
              <Link
                key={dateStr}
                href={isFullyBooked ? "#" : `/host?date=${dateStr}`}
                className={cn(
                  "border-2 rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 flex flex-col justify-between min-h-[140px]",
                  statusColors[status],
                  isFullyBooked ? "cursor-default grayscale opacity-70" : "cursor-pointer hover:shadow-xl hover:shadow-primary-600/10 hover:-translate-y-1 active:scale-95 ring-offset-2 hover:ring-2 hover:ring-primary-400"
                )}
              >
                <div>
                  <div className="text-sm font-bold opacity-60 uppercase tracking-widest mb-1">Ram. {index + 1}</div>
                  <div className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                    {formatDateLong(date).split(" ")[0]}
                    <br />
                    {formatDateLong(date).split(" ")[1]}
                  </div>
                </div>
                <div className="text-[10px] sm:text-xs font-black mt-4 uppercase tracking-tighter bg-white/50 py-1.5 rounded-full inline-block">
                  {statusLabel}
                </div>
              </Link>
            );
          })}
        </div>

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
    </div>
  );
}
