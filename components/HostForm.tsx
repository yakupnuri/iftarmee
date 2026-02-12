"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateLong } from "@/lib/ramadan-dates";
import { createEvent } from "@/app/actions/events";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
interface GuestGroupUI {
    id?: string;
    name: string;
    count: number;
    isDelivery: boolean | null;
    color?: string | null;
}

interface HostFormProps {
    ramadanDates: Date[];
    bookedEvents: { date: string; guestGroupName: string; status: string }[];
    userName: string;
    userEmail: string;
    guestGroups: GuestGroupUI[];
    unavailableDates: { date: string; guestGroupName: string }[];
}

export function HostForm(props: HostFormProps) {
    return (
        <Suspense fallback={<div className="w-full max-w-md p-8 text-center text-gray-500">Form yükleniyor...</div>}>
            <HostFormContent {...props} />
        </Suspense>
    );
}

function HostFormContent({ ramadanDates, bookedEvents, userName, userEmail, guestGroups, unavailableDates }: HostFormProps) {
    const searchParams = useSearchParams();
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const dateParam = searchParams.get("date");
        if (dateParam) {
            setSelectedDate(dateParam);
        }
    }, [searchParams]);

    const getBookedGroupsForDate = (dateStr: string) => {
        const booked = bookedEvents
            .filter((e) => e.date === dateStr && (e.status === "pending" || e.status === "accepted"))
            .map((e) => e.guestGroupName);

        const unavailable = unavailableDates
            .filter((u) => u.date === dateStr)
            .map((u) => u.guestGroupName);

        return Array.from(new Set([...booked, ...unavailable]));
    };

    const bookedGroupsForSelectedDate = selectedDate ? getBookedGroupsForDate(selectedDate) : [];
    const selectedGroupData = guestGroups.find(g => g.name === selectedGroup);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        try {
            const result = await createEvent(formData);
            if (result.success) {
                toast.success("Davet başarıyla oluşturuldu!");
                router.push("/");
                router.refresh();
            } else {
                toast.error(result.error || "Bir hata oluştu");
            }
        } catch (error) {
            toast.error("İşlem sırasında bir hata oluştu");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto md:mx-0">
            <form action={handleSubmit}>
                <div className="bg-white p-5 sm:p-6 rounded-xl shadow-md border border-gray-100 space-y-5 sm:space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Tarih Seçin
                        </label>
                        <select
                            name="date"
                            required
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                if (selectedGroup && getBookedGroupsForDate(e.target.value).includes(selectedGroup)) {
                                    setSelectedGroup("");
                                }
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base bg-gray-50/50"
                        >
                            <option value="">Tarih seçin</option>
                            {ramadanDates.map((date, index) => {
                                const dateStr = formatDate(date);
                                const bookedGroupsCount = getBookedGroupsForDate(dateStr).length;
                                const isFullyBooked = bookedGroupsCount >= guestGroups.length;

                                return (
                                    <option
                                        key={dateStr}
                                        value={dateStr}
                                        disabled={isFullyBooked}
                                    >
                                        Ramazan {index + 1} - {formatDateLong(date)}
                                        {bookedGroupsCount > 0 && !isFullyBooked && ` (${bookedGroupsCount} grup dolu)`}
                                        {isFullyBooked && " (Dolu)"}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Misafir Grubu Seçin
                        </label>
                        <select
                            name="guest_group"
                            required
                            disabled={!selectedDate}
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 sm:px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base disabled:bg-gray-100 disabled:text-gray-400 bg-gray-50/50"
                        >
                            <option value="">{selectedDate ? "Grup seçin" : "Önce tarih seçin"}</option>
                            {guestGroups.map((group) => {
                                const isBooked = bookedGroupsForSelectedDate.includes(group.name);
                                return (
                                    <option
                                        key={group.name}
                                        value={group.name}
                                        disabled={isBooked}
                                    >
                                        {group.name} ({group.count} kişi)
                                        {isBooked && " (Bu tarih için dolu)"}
                                    </option>
                                );
                            })}
                        </select>
                        {selectedGroupData?.isDelivery && (selectedGroupData as any).deliveryMessage && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="text-xs sm:text-sm text-blue-700 font-medium">
                                    ℹ️ {(selectedGroupData as any).deliveryMessage}
                                </p>
                            </div>
                        )}
                        {!selectedDate && (
                            <p className="text-[11px] text-gray-500 italic">Lütfen önce bir tarih belirleyin.</p>
                        )}
                    </div>

                    <div className="pt-2">
                        <div className="bg-primary-50/50 rounded-lg p-3 border border-primary-100">
                            <div className="text-[11px] sm:text-xs text-primary-800 space-y-1">
                                <div className="flex justify-between">
                                    <span className="font-semibold uppercase tracking-wider text-[10px]">Davet Sahibi:</span>
                                    <span>{userName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold uppercase tracking-wider text-[10px]">E-posta:</span>
                                    <span>{userEmail}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 sm:py-4 text-sm sm:text-base font-bold shadow-lg shadow-primary-200"
                        disabled={isSubmitting || !selectedDate || !selectedGroup}
                    >
                        {isSubmitting ? "Davet Oluşturuluyor..." : "Daveti Şimdi Oluştur"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
