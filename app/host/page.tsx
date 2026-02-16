import { Header } from "@/components/Header";
import { getEvents, markAsNoShow } from "@/app/actions/events";
import { ADMIN_EMAILS } from "@/lib/admin-emails";
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

  const isRegisteredHost = await db.query.hosts.findFirst({
    where: or(
      eq(hosts.email, session.user.email),
      ...ADMIN_EMAILS.map(email => eq(hosts.email, email))
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

        <WarningBanner />

        {/* Yeni Davet Formu */}
        <div className="bg-slate-100 rounded-3xl p-6 sm:p-8 mt-8">
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
