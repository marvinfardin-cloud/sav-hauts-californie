import Link from "next/link";
import Footer from "@/components/Footer";
import { SHOP_NAME, SHOP_PHONE, SHOP_EMAIL } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-800 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              HC
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{SHOP_NAME}</h1>
            <p className="text-gray-500 mt-1">Service Après-Vente</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-blue-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-900 transition-colors"
            >
              Suivre ma réparation
            </Link>
            <Link
              href="/login?redirect=/client/rdv"
              className="block w-full bg-white text-blue-800 py-3 px-6 rounded-lg font-medium border-2 border-blue-800 hover:bg-blue-50 transition-colors"
            >
              Prendre un rendez-vous
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>
              {SHOP_PHONE} — {SHOP_EMAIL}
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/admin/login"
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Accès atelier
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
