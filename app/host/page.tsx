import { Header } from "@/components/Header";
import { getEvents, markAsNoShow } from "@/app/actions/events";
import { getRamadanDates, formatDateLong } from "@/lib/ramadan-dates";
import { GUEST_GROUPS } from "@/lib/guest-groups";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HostForm } from "@/components/HostForm";
import Link from "next/link";
import { db } from "@/db/index";
import { hosts } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { getGroups } from "@/app/actions/groups";
import { WarningBanner } from "@/components/WarningBanner";

export default async function HostPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Check if user is a registered host or admin
  const isRegisteredHost = await db.query.hosts.findFirst({
    where: or(
      eq(hosts.email, session.user.email),
      eq(hosts.email, "vahidnuri@gmail.com") // Admin self-check
    ),
  });

  if (!isRegisteredHost) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="container mx-auto px-4 py-12 flex justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900">Yetki Gerekli</h2>
            <p className="text-gray-600">
              Davet oluşturma yetkiniz bulunmuyor. Lütfen yönetici tarafından davet listesine eklenmeyi bekleyin.
            </p>
            <Link href="/" className="inline-block pt-4 text-primary-600 font-bold hover:underline">
              Ana Sayfaya Dön
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const events = await getEvents();
  const ramadanDates = getRamadanDates();
  const dbGroups = await getGroups();
  const guestGroups = dbGroups.length > 0 ? dbGroups : GUEST_GROUPS;
  const unavailability = await db.query.groupUnavailability.findMany();
  const hostUnavailableDates = unavailability.map(u => ({
    date: u.date,
    guestGroupName: u.guestGroupName
  }));

  // Host'un kendi eventlerini filtrele
  const myEvents = events.filter(e => e.hostId === isRegisteredHost.id);

  // Sıralama: Kabul Edilenler > Bekleyenler > Reddedilenler. Tarih ise artan.
  myEvents.sort((a, b) => {
    const statusOrder = { accepted: 0, pending: 1, rejected: 2 };
    const statusDiff = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Basitleştirilmiş event verisi props olarak gönderiliyor (Form için)
  const bookedEvents = events.map(e => ({
    date: e.date,
    guestGroupName: e.guestGroupName,
    status: e.status
  }));

  // İstatistikler
  const totalIftars = myEvents.filter(e => e.status === 'accepted').length;
  const pendingIftars = myEvents.filter(e => e.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Üst Bilgi Kartı */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-2xl">🌙</div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">İftar Davetlerim</h1>
              <p className="text-slate-500 font-medium text-sm">Verdiğiniz iftarları ve durumlarını buradan takip edebilirsiniz.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600 leading-none">{totalIftars}</div>
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mt-1">Kabul Edilen</div>
            </div>
            <div className="text-center bg-amber-50 px-5 py-3 rounded-xl border border-amber-100">
              <div className="text-2xl font-black text-amber-600 leading-none">{pendingIftars}</div>
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mt-1">Bekleyen</div>
            </div>
          </div>
        </div>

        <WarningBanner />

        {/* Davet Listesi */}
        <div className="space-y-4 mb-12">
          {myEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">Henüz bir davet oluşturmadınız.</p>
            </div>
          ) : (
            myEvents.map((event) => {
              const group = guestGroups.find(g => g.name === event.guestGroupName);
              const isAccepted = event.status === 'accepted';
              const isRejected = event.status === 'rejected';
              const isPending = event.status === 'pending';
              const isNoShow = event.status === 'no_show';

              const statusColor = isAccepted ? 'border-l-emerald-500' : isRejected ? 'border-l-red-500' : isNoShow ? 'border-l-slate-400' : 'border-l-amber-400';
              const badgeClass = isAccepted ? 'bg-emerald-100 text-emerald-800' : isRejected ? 'bg-red-100 text-red-800' : isNoShow ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800';
              const statusText = isAccepted ? 'Kabul Edildi' : isRejected ? 'Reddedildi' : isNoShow ? 'Katılmadı' : 'Bekliyor';

              return (
                <div key={event.id} className={`bg-white rounded-xl shadow-sm border border-slate-100 p-5 border-l-4 ${statusColor} transition-all hover:shadow-md`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                    {/* Sol: Tarih ve Grup */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{formatDateLong(new Date(event.date))}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${badgeClass}`}>
                          {statusText}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {event.guestGroupName}
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {group?.count || '?'} Kişi
                        </span>
                      </h3>
                    </div>

                    {/* Sağ: Aksiyon/Durum Bilgisi */}
                    <div className="text-right">
                      {isAccepted && (
                        <form action={async () => {
                          "use server";
                          await markAsNoShow(event.id);
                        }}>
                          <button type="submit" className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200">
                            Gelmedi 🚫
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Alt: Mesajlar */}
                  {event.rejectionReason && (
                    <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${isAccepted ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-900'}`}>
                      <div className="flex items-center gap-2 mb-1 opacity-70">
                        <span className="text-[10px] font-black uppercase">
                          {isAccepted ? '💬 Onay Mesajı' : '💬 Red Sebebi'}
                        </span>
                      </div>
                      &quot;{event.rejectionReason}&quot;
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-200 my-8"></div>

        <WarningBanner />

        {/* Yeni Davet Formu */}
        <div className="bg-slate-100 rounded-3xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Yeni Davet Oluştur</h2>
            <p className="text-slate-500 text-sm">Müsait olduğunuz bir günü seçerek yeni bir iftar daveti ekleyin.</p>
          </div>

          <HostForm
            ramadanDates={ramadanDates}
            bookedEvents={bookedEvents}
            userName={session.user?.name || ""}
            userEmail={session.user?.email || ""}
            guestGroups={guestGroups}
            unavailableDates={hostUnavailableDates}
          />
        </div>

      </main>
    </div>
  );
}
