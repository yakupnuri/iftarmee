"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createGroup, updateGroup, deleteGroup } from "@/app/actions/groups";
import { type GuestGroup } from "@/db/schema";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Props {
    groups: GuestGroup[];
}

export function GuestGroupManagement({ groups }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GuestGroup | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        count: 5,
        isDelivery: false,
    });

    function openCreate() {
        setEditingGroup(null);
        setFormData({ name: "", email: "", count: 5, isDelivery: false });
        setIsOpen(true);
    }

    function openEdit(group: GuestGroup) {
        setEditingGroup(group);
        setFormData({
            name: group.name,
            email: group.email,
            count: group.count,
            isDelivery: !!group.isDelivery,
        });
        setIsOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingGroup) {
                await updateGroup(editingGroup.id, formData);
            } else {
                await createGroup(formData);
            }
            setIsOpen(false);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu grubu silmek istediğinize emin misiniz?")) return;
        setLoading(true);
        try {
            await deleteGroup(id);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
                <div className="space-y-3">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-[1.1]">Misafir Grupları</h2>
                    <p className="text-slate-500 font-medium text-lg">Sistemdeki aktif grupları yönetin, yeni gruplar tanımlayın.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={async () => {
                            if (confirm("Mevcut statik grupları veritabanına aktarmak istiyor musunuz?")) {
                                const { migrateHardcodedGroups } = await import("@/app/actions/groups");
                                await migrateHardcodedGroups();
                                alert("Aktarım tamamlandı.");
                                window.location.reload();
                            }
                        }}
                        className="font-bold rounded-2xl border-slate-200"
                    >
                        Verileri Aktar
                    </Button>
                    <Button
                        onClick={openCreate}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-6 rounded-2xl shadow-xl shadow-emerald-100 uppercase tracking-widest text-sm flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Yeni Grup Tanımla
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {groups.map((group) => (
                    <div key={group.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${group.color || 'bg-slate-200 text-slate-700'}`}>
                                    {group.count} Kişilik
                                </span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(group)} className="p-2 hover:bg-white rounded-lg text-blue-600 transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(group.id)} className="p-2 hover:bg-white rounded-lg text-red-600 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1">{group.name}</h4>
                            <p className="text-sm font-bold text-slate-500 truncate mb-4">{group.email}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            {group.isDelivery && (
                                <span className="bg-pink-50 text-pink-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-pink-100">
                                    Paket Servis
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {groups.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 font-medium italic bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        Henüz hiç grup tanımlanmamış.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                {editingGroup ? "Grubu Düzenle" : "Yeni Grup Tanımla"}
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Grup Adı</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Örn: Gençlik Grubu"
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-primary-500 outline-none transition-all text-sm font-bold bg-slate-50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Sorumlu E-posta</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="sorumlu@gmail.com"
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-primary-500 outline-none transition-all text-sm font-bold bg-slate-50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Kişi Sayısı</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.count}
                                        onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-primary-500 outline-none transition-all text-sm font-bold bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-1.5 flex flex-col justify-center pt-5">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.isDelivery}
                                            onChange={(e) => setFormData({ ...formData, isDelivery: e.target.checked })}
                                            className="w-5 h-5 rounded-md border-2 border-slate-200 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Paket Servis</span>
                                    </label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-7 text-base font-black uppercase tracking-widest shadow-lg shadow-emerald-100 rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                            >
                                {loading ? "Kaydediliyor..." : (editingGroup ? "Güncelle" : "Grubu Tanımla")}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
