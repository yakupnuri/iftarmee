export function WarningBanner() {
    return (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight">DİKKAT</h3>
            </div>
            <div className="space-y-3 text-amber-800 font-medium text-sm leading-relaxed">
                <p>
                    Bu platform yalnızca eşleşme altyapısı sunar.
                </p>
                <p>
                    Davet organizasyonu ve iletişim, davet eden ve davet edilen kişiler arasında doğrudan yürütülür.
                </p>
                <p>
                    Programı oluşturan veya teknik süreci yöneten kişiler eşleştirme sonrası herhangi bir iletişim, koordinasyon veya aracılık yapmaz.
                </p>
                <p className="font-bold">
                    Her kullanıcı, kendi davet sürecinden bireysel olarak sorumludur.
                </p>
            </div>
        </div>
    );
}
