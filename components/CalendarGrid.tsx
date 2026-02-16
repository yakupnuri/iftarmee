"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDate, formatDateLong } from "@/lib/ramadan-dates";
import { EventDetailModal } from "./EventDetailModal";

interface CalendarGridProps {
    events: any[];
    allHosts: any[];
    guestGroups: any[];
    unavailability: any[];
    ramadanDates: Date[];
    isGuestGroup: boolean;
    guestGroupName: string | null;
}

export function CalendarGrid({
    events,
    allHosts,
    guestGroups,
    unavailability,
    ramadanDates,
    isGuestGroup,
    guestGroupName
}: CalendarGridProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const hostMap = new Map(allHosts.map(h => [h.id, h.name]));

    function getGroupColor(groupName: string) {
        const group = guestGroups.find(g => g.name === groupName);
        return group?.color || "bg-gray-100 border-gray-300 text-gray-800 hover:ring-gray-400";
    }

    const bookedDatesByGroup = new Map<string, Set<string>>();
    events.forEach((event) => {
        if (event.status !== "rejected") {
            if (!bookedDatesByGroup.has(event.guestGroupName)) {
                bookedDatesByGroup.set(event.guestGroupName, new Set());
            }
            bookedDatesByGroup.get(event.guestGroupName)!.add(event.date);
        }
    });

    unavailability.forEach((un) => {
        if (!bookedDatesByGroup.has(un.guestGroupName)) {
            bookedDatesByGroup.set(un.guestGroupName, new Set());
        }
        bookedDatesByGroup.get(un.guestGroupName)!.add(un.date);
    });

    const statusColors = {
        empty: "bg-white hover:bg-gray-50 border-gray-200 text-gray-400 opacity-60",
        hasEvents: "bg-amber-50 border-amber-300 text-amber-800 shadow-sm",
        fullyBooked: "bg-emerald-50 border-emerald-400 text-emerald-800 shadow-md ring-1 ring-emerald-400/20",
    };

    const statusLabels = {
        empty: "Boş",
        fullyBooked: "Tüm Gruplar Dolu",
    };

    const handleDateClick = (dateStr: string) => {
        setSelectedDate(dateStr);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {ramadanDates.map((date, index) => {
                    const dateStr = formatDate(date);

                    if (isGuestGroup) {
                        const myEvent = events.find(e =>
                            e.guestGroupName === guestGroupName &&
                            e.date === dateStr &&
                            e.status !== 'rejected'
                        );

                        const colorClass = myEvent ? getGroupColor(myEvent.guestGroupName) : statusColors.empty;

                        return (
                            <div
                                key={dateStr}
                                onClick={() => handleDateClick(dateStr)}
                                className={cn(
                                    "border-2 rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 flex flex-col justify-between min-h-[140px]",
                                    colorClass,
                                    myEvent ? "shadow-md cursor-pointer hover:-translate-y-1 ring-offset-2 hover:ring-2" : "opacity-60 grayscale"
                                )}
                            >
                                <div className="text-sm font-bold opacity-60 uppercase tracking-widest mb-1">Ram. {index + 1}</div>
                                <div className="text-lg sm:text-xl font-black tracking-tight leading-tight" suppressHydrationWarning>
                                    {isMounted && (
                                        <>
                                            {formatDateLong(date).split(" ")[0]}
                                            <br />
                                            {formatDateLong(date).split(" ")[1]}
                                        </>
                                    )}
                                </div>

                                {myEvent ? (
                                    <div className="mt-3 bg-white/40 rounded-lg p-2 backdrop-blur-sm">
                                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-0.5">Davet Sahibi</div>
                                        <div className="text-xs font-black truncate leading-tight">
                                            {hostMap.get(myEvent.hostId) || 'Host'}
                                        </div>
                                        <div className="text-xs font-black truncate">
                                            {myEvent.status === 'pending' ? 'Bekliyor' : 'Kabul Edildi'}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-[10px] sm:text-xs font-black mt-4 uppercase tracking-tighter bg-gray-100 py-1.5 rounded-full inline-block text-gray-400">
                                        Boş
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const bookedGroups = Array.from(bookedDatesByGroup.entries())
                        .filter(([_, dates]) => dates.has(dateStr))
                        .map(([group]) => group);

                    const isFullyBooked = bookedGroups.length >= guestGroups.length;

                    // Gerçek etkinlik sayısını hesapla (reddedilmemişler)
                    const actualEventsForDate = events.filter(e =>
                        e.date === dateStr &&
                        e.status !== "rejected"
                    ).length;

                    const hasEvents = actualEventsForDate > 0;

                    let status: keyof typeof statusColors;
                    let statusLabel: string;

                    if (isFullyBooked) {
                        status = "fullyBooked";
                        statusLabel = statusLabels.fullyBooked;
                    } else if (hasEvents) {
                        status = "hasEvents";
                        statusLabel = `${actualEventsForDate} davet bulunuyor`;
                    } else {
                        status = "empty";
                        statusLabel = statusLabels.empty;
                    }

                    const isClickable = hasEvents || !isFullyBooked;

                    return (
                        <div key={dateStr} className="relative group/card">
                            <div
                                onClick={() => handleDateClick(dateStr)}
                                className={cn(
                                    "border-2 rounded-xl p-3 sm:p-4 text-center transition-all duration-300 flex flex-col justify-between min-h-[110px] w-full",
                                    statusColors[status],
                                    hasEvents ? "cursor-pointer hover:shadow-xl hover:shadow-primary-600/10 hover:-translate-y-1 ring-offset-2 hover:ring-2" : "",
                                    isFullyBooked && !hasEvents ? "grayscale opacity-70" : ""
                                )}
                            >
                                <div suppressHydrationWarning>
                                    <div className="text-sm font-bold opacity-60 uppercase tracking-widest mb-1">Ram. {index + 1}</div>
                                    <div className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                                        {isMounted && (
                                            <>
                                                {formatDateLong(date).split(" ")[0]}
                                                <br />
                                                {formatDateLong(date).split(" ")[1]}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-[10px] sm:text-xs font-black mt-4 uppercase tracking-tighter bg-white/50 py-1.5 rounded-full inline-block">
                                    {statusLabel}
                                </div>
                            </div>

                            {!isFullyBooked && (
                                <Link
                                    href={`/host?date=${dateStr}`}
                                    className="absolute -top-2 -right-2 bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover/card:scale-100 transition-transform hover:bg-primary-700 z-10"
                                    title="Davet Oluştur"
                                >
                                    <span className="text-xl font-bold">+</span>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            {isModalOpen && selectedDate && (
                <EventDetailModal
                    date={selectedDate}
                    dateLabel={formatDateLong(new Date(parseInt(selectedDate.split('-')[0]), parseInt(selectedDate.split('-')[1]) - 1, parseInt(selectedDate.split('-')[2])))}
                    events={events.filter(e => e.status !== "rejected")}
                    hostMap={hostMap}
                    guestGroups={guestGroups}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}
