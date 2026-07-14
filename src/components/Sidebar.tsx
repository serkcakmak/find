import { auth } from "@/auth";
import { LogOut, Activity, BarChart3, Newspaper } from "lucide-react";
import { signOut } from "@/auth";
import Link from "next/link";

export async function Sidebar() {
  const session = await auth();

  return (
    <aside className="w-64 glass border-y-0 border-l-0 fixed h-full flex flex-col z-50">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <Activity className="text-blue-500" /> Find Platform
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
          <Newspaper className="w-5 h-5" /> Dashboard
        </Link>
        <Link href="/analysis" className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
          <BarChart3 className="w-5 h-5" /> Analizler
        </Link>
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold">
            {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{session?.user?.email}</p>
            <p className="text-xs text-gray-500">Premium Üye</p>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Çıkış Yap
          </button>
        </form>
      </div>
    </aside>
  );
}
