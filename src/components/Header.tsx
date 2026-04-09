"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SHOP_NAME } from "@/lib/constants";

interface HeaderProps {
  type: "client" | "admin";
  userName?: string;
}

export default function Header({ type, userName }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(`/api/auth/logout?admin=${type === "admin"}`, { method: "POST" });
    router.push(type === "admin" ? "/admin/login" : "/");
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={type === "admin" ? "/admin" : "/client/dashboard"} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              HC
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">{SHOP_NAME}</span>
              {type === "admin" && (
                <span className="text-xs text-gray-500 ml-2">Atelier</span>
              )}
            </div>
          </Link>

          {type === "admin" && (
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/admin" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Tableau de bord
              </Link>
              <Link href="/admin/tickets" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Tickets
              </Link>
              <Link href="/admin/planning" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Planning
              </Link>
              <Link href="/admin/clients" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Clients
              </Link>
            </nav>
          )}

          {type === "client" && (
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/client/dashboard" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Mes réparations
              </Link>
              <Link href="/client/rdv" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Rendez-vous
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-sm text-gray-600 hidden sm:block">{userName}</span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {type === "admin" ? (
            <>
              <Link href="/admin" className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md whitespace-nowrap">
                Tableau de bord
              </Link>
              <Link href="/admin/tickets" className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md whitespace-nowrap">
                Tickets
              </Link>
              <Link href="/admin/planning" className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md whitespace-nowrap">
                Planning
              </Link>
              <Link href="/admin/clients" className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md whitespace-nowrap">
                Clients
              </Link>
            </>
          ) : (
            <>
              <Link href="/client/dashboard" className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md whitespace-nowrap">
                Mes réparations
              </Link>
              <Link href="/client/rdv" className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md whitespace-nowrap">
                Rendez-vous
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
