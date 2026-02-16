"use client";

import { toggleUnavailability } from "@/app/actions/unavailability";
import { cn } from "@/lib/utils";
import { formatDate, formatDateLong } from "@/lib/ramadan-dates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UnavailabilityCalendarProps {
    ramadanDates: Date[];
    unavailableDates: string[];
    guestGroupName: string;
    bookedDates: string[];
}

export function UnavailabilityCalendar({
    ramadanDates,
    unavailableDates,
    guestGroupName,
    bookedDates
}: UnavailabilityCalendarProps) {
    const router = useRouter();

    async function handleToggle(date: string) {
        if (bookedDates.includes(date)) {
            toast.error("Bu tarihte zaten bir davetiniz var.");
            return;
        }

        try {
            const res = await toggleUnavailability(date, guestGroupName);
            if (res.success) {
                toast.success(unavailableDates.includes(date) ? "Gün müsait olarak işaretlendi" : "Gün dolu olarak işaretlendi");
                router.refresh();
            } else {
                toast.error(res.error || "Bir hata oluştu");
            }
        } catch (error) {
            toast.error("İşlem başarısız oldu");
        }
    }

    return (
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">Takvim Planlaması</h3>
                <p className="text-slate-500 text-sm mt-1">
                    Dışarıda olduğunuz veya davet kabul edemeyeceğiniz günleri üzerine tıklayarak kırmızı (dolu) işaretleyebilirsiniz.
                </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {ramadanDates.map((date, index) => {
                    const dateStr = formatDate(date);
                    const isUnavailable = unavailableDates.includes(dateStr);
                    const isBooked = bookedDates.includes(dateStr);

                    return (
                        <button
                            key={dateStr}
                            type="button"
                            onClick={() => handleToggle(dateStr)}
                            disabled={isBooked}
                            className={cn(
                                "p-3 rounded-2xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 min-h-[90px]",
                                isBooked
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700 opacity-60 cursor-not-allowed"
                                    : isUnavailable
                                        ? "bg-red-50 border-red-200 text-red-600 shadow-sm scale-[0.98]"
                                        : "bg-white border-slate-50 text-slate-600 hover:border-slate-200 hover:bg-slate-50 active:scale-95"
                            )}
                        >
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Ram. {index + 1}</span>
                            <span className="text-sm font-black tracking-tight">{formatDateLong(date).split(" ")[0]} {formatDateLong(date).split(" ")[1]}</span>
                            <span className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
                                isBooked ? "bg-emerald-100 text-emerald-800" :
                                    isUnavailable ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-500"
                            )}>
                                {isBooked ? "Davet Var" : isUnavailable ? "Dolu" : "Müsait"}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-3 h-3 bg-white border border-slate-200 rounded-sm"></div>
                    Müsait
                </div>
                <div className="flex items-center gap-2 text-red-500">
                    <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div>
                    Kendi Planınız (Dolu)
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                    <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded-sm"></div>
                    Onaylı/Bekleyen Davet
                </div>
            </div>
        </section>
    );
}
