import { auth } from "@/lib/auth";
import { ADMIN_EMAILS } from "@/lib/admin-emails";
import { loginAction, logoutAction } from "@/app/actions/auth";
import { db } from "@/db/index";
import { groupAssignments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "./ui/button";
import Link from "next/link";
import { Home, PlusCircle, Calendar, Shield, LogOut, User } from "lucide-react";

export async function Header() {
  const session = await auth();
  const isAdmin = session?.user?.email ? ADMIN_EMAILS.includes(session.user.email.toLowerCase()) : false;

  // Bir gruba atanmış mı kontrol et
  const assignment = session?.user?.email ? await db.query.groupAssignments.findFirst({
    where: eq(groupAssignments.email, session.user.email)
  }) : null;

  return (
    <>
      {/* Desktop Top Header & Mobile Only Logo Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sm:sticky sm:top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-primary-800 tracking-tighter hover:opacity-80 transition-opacity">
            Iftar Match
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2">
            {session ? (
              <>
                {!assignment && (
                  <Link href="/host">
                    <Button variant="ghost" size="md" className="font-bold text-slate-600">Davet Oluştur</Button>
                  </Link>
                )}
                <Link href={!assignment ? "/host" : "/my-invitations"}>
                  <Button variant="ghost" size="md" className="font-bold text-slate-600">Benim Davetlerim</Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="md" className="text-primary-700 font-black">Yönetim Paneli</Button>
                  </Link>
                )}
                <form action={logoutAction} className="ml-2">
                  <Button variant="outline" type="submit" size="md" className="border-slate-200 text-slate-500 font-bold hover:bg-slate-50">
                    Çıkış Yap
                  </Button>
                </form>
              </>
            ) : (
              <form action={loginAction}>
                <Button type="submit" size="md" className="font-black uppercase tracking-widest px-8">Google ile Giriş Yap</Button>
              </form>
            )}
          </div>

          {/* Mobile Profile Icon (Optional if not logged in) */}
          {!session && (
            <form action={loginAction} className="sm:hidden">
              <button type="submit" className="rounded-full w-10 h-10 p-0 shadow-lg shadow-primary-100 bg-primary-600 hover:bg-primary-700 transition-colors flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Mobile Bottom Sticky Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 pb-8 z-50 flex justify-between items-center shadow-[0_-8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
        {session ? (
          <>
            <Link href="/" className="flex flex-col items-center gap-1 group">
              <div className="p-2 group-active:scale-95 transition-transform rounded-2xl group-hover:bg-slate-50">
                <Home className="w-6 h-6 text-slate-400 group-hover:text-primary-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Ana Sayfa</span>
            </Link>

            <Link href="/host" className="flex flex-col items-center gap-1 group">
              <div className="p-2 group-active:scale-95 transition-transform rounded-2xl group-hover:bg-slate-50">
                <PlusCircle className="w-6 h-6 text-slate-400 group-hover:text-primary-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Oluştur</span>
            </Link>

            <Link href="/my-invitations" className="flex flex-col items-center gap-1 group">
              <div className="relative p-2 group-active:scale-95 transition-transform rounded-2xl group-hover:bg-slate-50">
                <Calendar className="w-6 h-6 text-slate-400 group-hover:text-primary-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                {isAdmin ? "Tüm Davetler" : "Davetlerim"}
              </span>
            </Link>

            {isAdmin && (
              <Link href="/admin" className="flex flex-col items-center gap-1 group">
                <div className="p-2 group-active:scale-95 transition-transform rounded-2xl group-hover:bg-slate-50">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter text-primary-600">Admin</span>
              </Link>
            )}

            <form action={logoutAction}>
              <button type="submit" className="flex flex-col items-center gap-1 group active:scale-95 transition-transform">
                <div className="p-2 rounded-2xl group-hover:bg-red-50">
                  <LogOut className="w-6 h-6 text-red-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter text-red-400">Çıkış</span>
              </button>
            </form>
          </>
        ) : (
          <form action={loginAction} className="w-full">
            <Button type="submit" className="w-full py-6 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary-100 rounded-2xl">
              Google ile Giriş Yap
            </Button>
          </form>
        )}
      </nav>
    </>
  );
}
