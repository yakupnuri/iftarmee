"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GUEST_GROUPS } from "@/lib/guest-groups";
import { assignEmailToGroup } from "@/app/actions/admin";

export function GroupMailModal({ currentAssignments }: { currentAssignments: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const result = await assignEmailToGroup(selectedGroup, email);
        setLoading(false);
        if (result.success) {
            setIsOpen(false);
            setSelectedGroup("");
            setEmail("");
        } else {
            alert(result.error);
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-black px-8 py-6 rounded-2xl shadow-xl shadow-primary-100 uppercase tracking-widest text-sm"
            >
                ✉ Mail Tanımla
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mail Tanımla</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <p className="text-slate-500 text-sm font-medium">Bir misafir grubuna sorumlu e-posta adresi atayın. Bu e-posta ile giriş yapanlar o grubun tüm davetlerini yönetebilir.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Misafir Grubu</label>
                                <select
                                    required
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-primary-500 outline-none transition-all text-sm font-bold bg-slate-50"
                                >
                                    <option value="">Grup Seçin...</option>
                                    {GUEST_GROUPS.map(group => (
                                        <option key={group.name} value={group.name}>{group.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Sorumlu E-posta</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="sorumlu@gmail.com"
                                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:border-primary-500 outline-none transition-all text-sm font-bold bg-slate-50"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-7 text-base font-black uppercase tracking-widest shadow-lg shadow-primary-100 rounded-2xl"
                            >
                                {loading ? "Kaydediliyor..." : "Atamayı Tamamla"}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
