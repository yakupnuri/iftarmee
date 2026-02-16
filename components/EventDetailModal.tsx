"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventDetailModalProps {
    date: string;
    dateLabel: string;
    events: any[];
    hostMap: Map<string, string>;
    guestGroups: any[];
    onClose: () => void;
}

export function EventDetailModal({
    date,
    dateLabel,
    events,
    hostMap,
    guestGroups,
    onClose
}: EventDetailModalProps) {
    const dayEvents = events.filter(e => e.date === date);

    const statusLabels: Record<string, string> = {
        pending: "Bekliyor",
        accepted: "Kabul Edildi",
        rejected: "Reddedildi",
        no_show: "Katılmadı",
    };

    function getGroupColor(groupName: string) {
        const group = guestGroups.find(g => g.name === groupName);
        return group?.color || "bg-slate-100 border-slate-300 text-slate-800";
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                        {dateLabel}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
                        aria-label="Kapat"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 bg-white overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-2.5 font-semibold text-slate-700">Davet Eden</th>
                                <th className="px-4 py-2.5 font-semibold text-slate-700">Davet Edilen</th>
                                <th className="px-4 py-2.5 font-semibold text-slate-700">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dayEvents.length > 0 ? (
                                dayEvents.map((event) => (
                                    <tr key={event.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 text-slate-600">
                                            {hostMap.get(event.hostId) || 'Bilinmiyor'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border",
                                                getGroupColor(event.guestGroupName)
                                            )}>
                                                {event.guestGroupName}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "font-medium",
                                                event.status === 'accepted' ? "text-emerald-600" :
                                                    event.status === 'pending' ? "text-amber-600" :
                                                        "text-rose-600"
                                            )}>
                                                {statusLabels[event.status] || event.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-4 py-12 text-center text-slate-400 italic">
                                        Bu tarih için kayıtlı davet bulunmuyor.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-all shadow-sm active:scale-[0.98]"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
}
