"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { EventActionButtons } from "./EventActionButtons";
import { X, Calendar, User, Users, Package, Trash2 } from "lucide-react";
import { deleteEvent } from "@/app/actions/delete-event";

interface Host {
    id: string;
    name: string;
    email: string | null;
}

interface Event {
    id: string;
    date: string;
    hostId: string;
    guestGroupName: string;
    participantCount: number;
    status: string;
    isDelivery: boolean | null;
    rejectionReason: string | null;
}

interface InvitationsTableProps {
    events: Event[];
    hosts: Host[];
    isAdmin: boolean;
    guestGroups: any[];
}

export function InvitationsTable({ events, hosts, isAdmin, guestGroups }: InvitationsTableProps) {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"accepted" | "pending" | "rejected">("pending");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);
    const [deleteResult, setDeleteResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleDeleteClick = (eventId: string) => {
        setEventToDelete(eventId);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!eventToDelete) return;

        const result = await deleteEvent(eventToDelete);

        if (result.success) {
            setDeleteResult({ success: true, message: "Davet başarıyla silindi!" });
            setTimeout(() => {
                setDeleteResult(null);
                setDeleteModalOpen(false);
                window.location.reload(); // Sayfayı yenile
            }, 1500);
        } else {
            setDeleteResult({ success: false, message: result.error || "Silme işlemi başarısız oldu" });
        }
    };

    // Filter events based on active tab (only for admin)
    const filteredEvents = isAdmin
        ? events.filter(e => e.status === activeTab)
        : events;

    const selectedEvent = events.find(e => e.id === selectedEventId);
    const selectedHost = selectedEvent ? hosts.find(h => h.id === selectedEvent.hostId) : null;

    const statusStyles = {
        pending: "bg-amber-100 border-amber-300 text-amber-800",
        accepted: "bg-emerald-100 border-emerald-300 text-emerald-800",
        rejected: "bg-red-100 border-red-300 text-red-800",
    };

    const statusLabels = {
        pending: "Bekliyor",
        accepted: "Kabul Edildi",
        rejected: "Reddedildi",
    };

    const formatDateDisplay = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            weekday: "short"
        });
    };

    function getGroupColor(groupName: string) {
        const group = guestGroups.find(g => g.name === groupName);
        return group?.color || "bg-slate-100 border-slate-300 text-slate-800";
    }

    const tabCounts = {
        accepted: events.filter(e => e.status === "accepted").length,
        pending: events.filter(e => e.status === "pending").length,
        rejected: events.filter(e => e.status === "rejected").length,
    };

    return (
        <>
            {/* Tabs - Only for Admin */}
            {isAdmin && (
                <div className="bg-white rounded-t-2xl border-x border-t border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={cn(
                                "flex-1 px-6 py-4 text-sm font-bold transition-colors relative",
                                activeTab === "pending"
                                    ? "bg-amber-50 text-amber-900 border-b-2 border-amber-500"
                                    : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            Bekleyen
                            <span className={cn(
                                "ml-2 px-2 py-0.5 rounded-full text-xs font-black",
                                activeTab === "pending" ? "bg-amber-200 text-amber-900" : "bg-slate-200 text-slate-600"
                            )}>
                                {tabCounts.pending}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("accepted")}
                            className={cn(
                                "flex-1 px-6 py-4 text-sm font-bold transition-colors relative",
                                activeTab === "accepted"
                                    ? "bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500"
                                    : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            Kabul Edilen
                            <span className={cn(
                                "ml-2 px-2 py-0.5 rounded-full text-xs font-black",
                                activeTab === "accepted" ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-600"
                            )}>
                                {tabCounts.accepted}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("rejected")}
                            className={cn(
                                "flex-1 px-6 py-4 text-sm font-bold transition-colors relative",
                                activeTab === "rejected"
                                    ? "bg-red-50 text-red-900 border-b-2 border-red-500"
                                    : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            Reddedilen
                            <span className={cn(
                                "ml-2 px-2 py-0.5 rounded-full text-xs font-black",
                                activeTab === "rejected" ? "bg-red-200 text-red-900" : "bg-slate-200 text-slate-600"
                            )}>
                                {tabCounts.rejected}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            <div className={cn(
                "bg-white border border-slate-200 overflow-hidden shadow-sm",
                isAdmin ? "rounded-b-2xl border-t-0" : "rounded-2xl"
            )}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-wider">Davet Bilgileri</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-wider">Kişi</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-wider hidden sm:table-cell">Durum</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-wider">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEvents.map(event => {
                                const host = hosts.find(h => h.id === event.hostId);
                                const status = event.status as keyof typeof statusStyles;

                                return (
                                    <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                                            <div className="space-y-1">
                                                {/* Tarih */}
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400 hidden sm:block" />
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900">{formatDateDisplay(event.date)}</span>
                                                </div>
                                                {/* Davet Eden */}
                                                <div className="flex items-center gap-2 pl-0 sm:pl-6">
                                                    <User className="w-3 h-3 text-slate-400 hidden sm:block" />
                                                    <span className="text-[10px] sm:text-xs text-slate-500">Davet Eden:</span>
                                                    <span className="text-xs sm:text-sm font-medium text-slate-700">{host?.name || "Bilinmeyen"}</span>
                                                </div>
                                                {/* Davet Edilen (Grup) */}
                                                <div className="flex items-center gap-2 pl-0 sm:pl-6">
                                                    <Users className="w-3 h-3 text-slate-400 hidden sm:block" />
                                                    <span className="text-[10px] sm:text-xs text-slate-500">Davet Edilen:</span>
                                                    <span className={cn(
                                                        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border",
                                                        getGroupColor(event.guestGroupName)
                                                    )}>
                                                        {event.guestGroupName}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-xs sm:text-sm font-bold text-slate-900">{event.participantCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden sm:table-cell">
                                            <span className={cn(
                                                "inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border",
                                                statusStyles[status]
                                            )}>
                                                {statusLabels[status]}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedEventId(event.id)}
                                                    className="text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline"
                                                >
                                                    Detay
                                                </button>
                                                {isAdmin && event.status === "rejected" && (
                                                    <button
                                                        onClick={() => handleDeleteClick(event.id)}
                                                        className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                                                    >
                                                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        Sil
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEventId(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900">Davet Detayları</h3>
                            <button
                                onClick={() => setSelectedEventId(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Date */}
                            <div className="bg-slate-50 rounded-xl p-6 text-center">
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Tarih</div>
                                <div className="text-3xl font-black text-slate-900">{formatDateDisplay(selectedEvent.date)}</div>
                            </div>

                            {/* Host Info */}
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-slate-400 mt-1" />
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Davet Eden</div>
                                        <div className="text-lg font-bold text-slate-900">{selectedHost?.name || "Bilinmeyen"}</div>
                                        {selectedHost?.email && (
                                            <div className="text-sm text-slate-600 mt-1">{selectedHost.email}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Users className="w-5 h-5 text-slate-400 mt-1" />
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kişi Sayısı</div>
                                        <div className="text-lg font-bold text-slate-900">{selectedEvent.participantCount} Kişi</div>
                                    </div>
                                </div>

                                {selectedEvent.isDelivery && (
                                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl border border-blue-200">
                                        <Package className="w-5 h-5" />
                                        <span className="text-sm font-bold">Teslimat Mevcut</span>
                                    </div>
                                )}

                                {isAdmin && (
                                    <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
                                        <div className="text-xs font-bold text-primary-600 uppercase tracking-wider">Grup</div>
                                        <div className="text-sm font-bold text-primary-900">{selectedEvent.guestGroupName}</div>
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Durum</div>
                                <span className={cn(
                                    "inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border",
                                    statusStyles[selectedEvent.status as keyof typeof statusStyles]
                                )}>
                                    {statusLabels[selectedEvent.status as keyof typeof statusLabels]}
                                </span>
                            </div>

                            {/* Rejection/Acceptance Message */}
                            {selectedEvent.rejectionReason && (
                                <div className={cn(
                                    "p-4 rounded-xl border",
                                    selectedEvent.status === 'accepted'
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-red-50 border-red-200"
                                )}>
                                    <div className={cn(
                                        "text-xs font-bold uppercase tracking-wider mb-2",
                                        selectedEvent.status === 'accepted' ? "text-emerald-700" : "text-red-700"
                                    )}>
                                        {selectedEvent.status === 'accepted' ? 'Onay Mesajı' : 'Red Mesajı'}
                                    </div>
                                    <div className={cn(
                                        "text-sm font-medium",
                                        selectedEvent.status === 'accepted' ? "text-emerald-900" : "text-red-900"
                                    )}>
                                        &quot;{selectedEvent.rejectionReason}&quot;
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons - Only for non-admin users */}
                            {!isAdmin && (
                                <div className="pt-4 border-t border-slate-200">
                                    <EventActionButtons eventId={selectedEvent.id} currentStatus={selectedEvent.status} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
                        {!deleteResult ? (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-black text-slate-900">Daveti Sil</h3>
                                    <button
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                <p className="text-slate-600 mb-6">
                                    Bu daveti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className={cn(
                                    "w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center",
                                    deleteResult.success ? "bg-emerald-100" : "bg-red-100"
                                )}>
                                    {deleteResult.success ? (
                                        <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <X className="w-8 h-8 text-red-600" />
                                    )}
                                </div>
                                <h3 className={cn(
                                    "text-xl font-black mb-2",
                                    deleteResult.success ? "text-emerald-900" : "text-red-900"
                                )}>
                                    {deleteResult.success ? "Başarılı!" : "Hata!"}
                                </h3>
                                <p className="text-slate-600">{deleteResult.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
