import { SHOP_NAME, SHOP_ADDRESS, SHOP_PHONE, SHOP_EMAIL, SHOP_HOURS_TEXT } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{SHOP_NAME}</h3>
            <p>{SHOP_ADDRESS}</p>
            <p className="mt-1">{SHOP_PHONE}</p>
            <p>{SHOP_EMAIL}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Horaires magasin</h3>
            <p>{SHOP_HOURS_TEXT.magasin}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Horaires SAV</h3>
            <p>{SHOP_HOURS_TEXT.sav}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
