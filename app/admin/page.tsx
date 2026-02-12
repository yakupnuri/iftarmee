import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isAdmin, getGroupAssignments } from "@/app/actions/admin";
import { getEvents } from "@/app/actions/events";
import { Header } from "@/components/Header";
import { GroupMailModal } from "@/components/GroupMailModal";
import { GUEST_GROUPS } from "@/lib/guest-groups";

export default async function AdminPage() {
    const session = await auth();
    const admin = session?.user?.email === "vahidnuri@gmail.com";

    if (!admin) {
        redirect("/");
    }

    const assignments = await getGroupAssignments();
    const allEvents = await getEvents();

    // -- Statistics Calculation --
    const totalAccepted = allEvents.filter(e => e.status === 'accepted').length;
    const totalRejected = allEvents.filter(e => e.status === 'rejected').length;
    const totalNoShow = allEvents.filter(e => e.status === 'no_show').length;
    const totalPending = allEvents.filter(e => e.status === 'pending').length;

    // Calculate total people served (only accepted events)
    const totalPeopleServed = allEvents
        .filter(e => e.status === 'accepted')
        .reduce((sum, e) => sum + (e.participantCount || 0), 0);

    // Unique hosts who have at least one event (any status)
    const uniqueHosts = new Set(allEvents.map(e => e.hostId)).size;

    // Group-wise stats
    const groupStats = GUEST_GROUPS.map(group => {
        const groupEvents = allEvents.filter(e => e.guestGroupName === group.name);
        return {
            name: group.name,
            accepted: groupEvents.filter(e => e.status === 'accepted').length,
            rejected: groupEvents.filter(e => e.status === 'rejected').length,
            noShow: groupEvents.filter(e => e.status === 'no_show').length,
            pending: groupEvents.filter(e => e.status === 'pending').length,
        };
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-7xl space-y-12">

                {/* 1. Dashboard Overview Cards */}
                <section>
                    <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Genel Bakış</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                        {/* Card 1: Total Iftars (Accepted) */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-emerald-100/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <div className="text-6xl">🍲</div>
                            </div>
                            <div className="text-4xl font-black text-emerald-600 mb-1">{totalAccepted}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kabul Edilen İftar</div>
                        </div>

                        {/* Card New: Total People Served */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-purple-100/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <div className="text-6xl">👥</div>
                            </div>
                            <div className="text-4xl font-black text-purple-600 mb-1">{totalPeopleServed}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ağırlanan Misafir</div>
                        </div>

                        {/* Card 2: Total Hosts */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-blue-100/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <div className="text-6xl">🏡</div>
                            </div>
                            <div className="text-4xl font-black text-blue-600 mb-1">{uniqueHosts}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aktif Davet Sahibi</div>
                        </div>

                        {/* Card 3: Pending */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-amber-100/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <div className="text-6xl">⏳</div>
                            </div>
                            <div className="text-4xl font-black text-amber-500 mb-1">{totalPending}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bekleyen Davet</div>
                        </div>

                        {/* Card 4: Rejected */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-red-100/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <div className="text-6xl">❌</div>
                            </div>
                            <div className="text-4xl font-black text-red-500 mb-1">{totalRejected}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reddedilen</div>
                        </div>

                        {/* Card 5: No Show */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <div className="text-6xl">🚫</div>
                            </div>
                            <div className="text-4xl font-black text-slate-600 mb-1">{totalNoShow}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Katılmadı (No-Show)</div>
                        </div>
                    </div>
                </section>

                {/* 2. Group Performance Grid */}
                <section>
                    <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Grup Performansı</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupStats.map(stat => (
                            <div key={stat.name} className="bg-white rounded-[2rem] border border-slate-100 shadow-lg p-6 flex flex-col gap-4">
                                <div className="border-b border-slate-50 pb-4">
                                    <h3 className="text-lg font-black text-slate-800 leading-tight">{stat.name}</h3>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    <div className="bg-emerald-50 rounded-xl p-2">
                                        <div className="text-xl font-bold text-emerald-700">{stat.accepted}</div>
                                        <div className="text-[8px] font-black uppercase text-emerald-400">Kabul</div>
                                    </div>
                                    <div className="bg-amber-50 rounded-xl p-2">
                                        <div className="text-xl font-bold text-amber-600">{stat.pending}</div>
                                        <div className="text-[8px] font-black uppercase text-amber-400">Bekler</div>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-2">
                                        <div className="text-xl font-bold text-red-600">{stat.rejected}</div>
                                        <div className="text-[8px] font-black uppercase text-red-400">Red</div>
                                    </div>
                                    <div className="bg-slate-100 rounded-xl p-2">
                                        <div className="text-xl font-bold text-slate-600">{stat.noShow}</div>
                                        <div className="text-[8px] font-black uppercase text-slate-400">Yok</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Access Management */}
                <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 font-black"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div className="space-y-3 max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-[1.1]">Erişim ve Mail Tanımlama</h2>
                            <p className="text-slate-500 font-medium text-lg">Hangi misafir grubunun hangi mail adresiyle giriş yapacağını belirleyin.</p>
                        </div>
                        <div>
                            <GroupMailModal currentAssignments={assignments} />
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignments.map(assignment => (
                            <div key={assignment.guestGroupName} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="space-y-1 mb-4">
                                    <div className="text-[10px] font-black uppercase text-primary-600 tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                                        Aktif
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900 tracking-tight">
                                        {assignment.guestGroupName}
                                    </h4>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200/50 text-sm font-bold text-slate-600 truncate">
                                    {assignment.email}
                                </div>
                            </div>
                        ))}
                        {assignments.length === 0 && (
                            <div className="col-span-full py-8 text-center text-slate-400 font-medium italic">
                                Henüz tanımlanmış bir grup yöneticisi yok.
                            </div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
}
