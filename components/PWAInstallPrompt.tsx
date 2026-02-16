"use client";

import { useState, useEffect } from "react";
import { ShareIcon, PlusSquareIcon, XIcon, DownloadIcon } from "lucide-react";

export function PWAInstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [platform, setPlatform] = useState<"android" | "ios" | "other" | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showiOSGuide, setShowiOSGuide] = useState(false);

    useEffect(() => {
        // Detect platform
        const ua = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
            setPlatform("ios");
        } else if (/android/.test(ua)) {
            setPlatform("android");
        } else {
            setPlatform("other");
        }

        // Check if already installed
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches
            || (window.navigator as any).standalone
            || document.referrer.includes("android-app://");

        if (!isStandalone) {
            // Show prompt after a delay
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }

        // Capture Android install prompt
        const handler = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleAndroidInstall = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === "accepted") {
            setInstallPrompt(null);
            setIsVisible(false);
        }
    };

    const closePrompt = () => setIsVisible(false);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="bg-white rounded-2xl shadow-2xl border border-primary-100 p-5 relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -mr-12 -mt-12 opacity-50" />

                <button
                    onClick={closePrompt}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <XIcon size={20} />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                        <DevicePhoneMobileIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 leading-tight text-lg">Uygulamayı Yükle</h4>
                        <p className="text-sm text-gray-500 font-medium">Ana ekranına ekle ve hızlıca ulaş!</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Android Button */}
                    {(platform === "android" || platform === "other") && (
                        <button
                            onClick={platform === "android" && installPrompt ? handleAndroidInstall : () => { }}
                            className="flex items-center justify-center gap-2 bg-primary-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-primary-700 transition-all active:scale-95 shadow-lg shadow-primary-200 w-full"
                        >
                            <DownloadIcon size={18} />
                            Android Ekrana Kaydet
                        </button>
                    )}

                    {/* iOS Button / Guide Trigger */}
                    {(platform === "ios" || platform === "other") && (
                        <button
                            onClick={() => setShowiOSGuide(true)}
                            className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border-2 border-emerald-600 font-bold py-3.5 px-4 rounded-xl hover:bg-emerald-100 transition-all active:scale-95 w-full"
                        >
                            <PlusSquareIcon size={18} />
                            iOS Ekrana Ekle
                        </button>
                    )}
                </div>

                {/* iOS Guide Overlay */}
                {showiOSGuide && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in zoom-in-95 duration-200">
                        <h5 className="font-bold text-slate-800 text-sm mb-3 border-b border-slate-200 pb-2 flex items-center gap-2">
                            <PlusSquareIcon size={16} className="text-emerald-600" />
                            iOS için Kurulum Adımları
                        </h5>
                        <ol className="text-xs text-slate-600 space-y-3 font-medium">
                            <li className="flex items-start gap-2">
                                <span className="bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                                <span>Tarayıcının alt kısmındaki <strong>Paylaş</strong> simgesine (<ShareIcon className="inline-block w-3 h-3 text-blue-500" />) dokunun.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                                <span>Menüyü yukarı kaydırarak <strong>Ana Ekana Ekle</strong> seçeneğini bulun ve dokunun.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="bg-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                                <span>Sağ üstteki <strong>Ekle</strong> butonuna basarak işlemi tamamlayın.</span>
                            </li>
                        </ol>
                        <button
                            onClick={() => setShowiOSGuide(false)}
                            className="mt-4 w-full text-xs font-bold text-primary-600 hover:underline"
                        >
                            Anladım, Kapat
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Icons for Lucide as they are named differently sometimes or need explicit re-import check
function DevicePhoneMobileIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
}
