"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { acceptEvent, rejectEvent } from "@/app/actions/events";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function EventActionButtons({ eventId, currentStatus }: { eventId: string, currentStatus: string }) {
    const [status, setStatus] = useState<'idle' | 'confirm-accept' | 'confirm-reject' | 'loading-accept' | 'loading-reject' | 'success'>('idle');

    async function handleConfirm(action: 'accept' | 'reject') {
        setStatus(action === 'accept' ? 'loading-accept' : 'loading-reject');
        const result = action === 'accept' ? await acceptEvent(eventId) : await rejectEvent(eventId);

        if (result.success) {
            setStatus('success');
            toast.success(action === 'accept' ? "Davet onaylandı!" : "Davet reddedildi.");
            // Bir saniye sonra bileşeni tamamen kapatmak yerine sessizce beklesin
        } else {
            setStatus('idle');
            toast.error(result.error || "Bir hata oluştu.");
        }
    }

    if (currentStatus !== 'pending' && status !== 'success') return null;

    if (status === 'success') {
        return (
            <div className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl py-4 px-6 flex items-center justify-center gap-3 animate-in fade-in zoom-in duration-300">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-black uppercase text-xs tracking-widest">İşlem Tamamlandı</span>
            </div>
        );
    }

    if (status === 'confirm-accept' || status === 'confirm-reject') {
        const isAccept = status === 'confirm-accept';
        return (
            <div className="w-full bg-white border-2 border-slate-100 rounded-3xl p-4 space-y-4 animate-in slide-in-from-bottom-2 duration-300 shadow-xl shadow-slate-100/50">
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Onay Gerekli</p>
                    <p className="text-sm font-bold text-slate-800">
                        {isAccept ? "Bu daveti kabul ediyorsunuz, emin misiniz?" : "Bu daveti reddediyorsunuz, emin misiniz?"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleConfirm(isAccept ? 'accept' : 'reject')}
                        className={cn(
                            "flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest text-white transition-all shadow-lg",
                            isAccept ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-red-600 hover:bg-red-700 shadow-red-100"
                        )}
                    >
                        Evet, Eminim
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setStatus('idle')}
                        className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50"
                    >
                        Vazgeç
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-2 w-full mt-2">
            <Button
                onClick={() => setStatus('confirm-accept')}
                disabled={status !== 'idle'}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest py-6 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
                {status === 'loading-accept' ? "İşleniyor..." : (
                    <>
                        <Check className="w-4 h-4 mr-2" />
                        Onayla
                    </>
                )}
            </Button>
            <Button
                onClick={() => setStatus('confirm-reject')}
                disabled={status !== 'idle'}
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest py-6 rounded-xl transition-all active:scale-95"
            >
                {status === 'loading-reject' ? "İşleniyor..." : (
                    <>
                        <X className="w-4 h-4 mr-2" />
                        Reddet
                    </>
                )}
            </Button>
        </div>
    );
}
