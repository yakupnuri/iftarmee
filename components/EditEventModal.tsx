"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateEvent } from "@/app/actions/events";

interface EditEventModalProps {
    event: {
        id: string;
        participantCount: number;
        isDelivery: boolean | null;
    };
}

export function EditEventModal({ event }: EditEventModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState(event.participantCount);
    const [isDelivery, setIsDelivery] = useState(event.isDelivery || false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const result = await updateEvent(event.id, {
            participantCount: count,
            isDelivery: isDelivery
        });
        setLoading(false);
        if (result.success) {
            setIsOpen(false);
        } else {
            alert(result.error);
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                className="w-full md:w-auto border-primary-200 text-primary-700 hover:bg-primary-50 font-black uppercase text-[10px] tracking-widest px-6 py-4 rounded-xl shadow-sm"
            >
                ✎ Daveti Düzenle
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Daveti Düzenle</h3>
                            <button onClick={() => setIsOpen(false)} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Katılımcı Sayısı</label>
                                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border-2 border-slate-100 focus-within:border-primary-500 transition-all">
                                    <button
                                        type="button"
                                        onClick={() => setCount(Math.max(1, count - 1))}
                                        className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm font-black text-2xl text-slate-600 hover:text-primary-600 transition-colors"
                                    >-</button>
                                    <input
                                        type="number"
                                        readOnly
                                        value={count}
                                        className="flex-1 bg-transparent text-center font-black text-2xl text-slate-900 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setCount(count + 1)}
                                        className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm font-black text-2xl text-slate-600 hover:text-primary-600 transition-colors"
                                    >+</button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 select-none">
                                <div className="space-y-1">
                                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Teslimat Durumu</div>
                                    <div className="text-sm font-black text-slate-700 italic">Yemek eve teslim mi edilecek?</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsDelivery(!isDelivery)}
                                    className={`w-14 h-8 rounded-full transition-all relative ${isDelivery ? 'bg-primary-600' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isDelivery ? 'left-7' : 'left-1 shadow-sm'}`}></div>
                                </button>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-8 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-100 rounded-2xl"
                                >
                                    {loading ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                                >
                                    Vazgeç
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
