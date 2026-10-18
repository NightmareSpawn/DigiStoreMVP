import { getMarketPrices } from "@/lib/marketPrices";
import { faNumber } from "@/lib/format";

export default async function PriceBox() {
  const prices = await getMarketPrices();

  const rows = [
    { label: "دلار آزاد", value: prices.usdFree, unit: "تومان" },
    { label: "دلار دولتی (نیمایی)", value: prices.usdNima, unit: "تومان" },
    { label: "اونس جهانی طلا", value: prices.goldOunce, unit: "دلار" },
    { label: "طلای ۱۸ عیار", value: prices.gold18k, unit: "تومان" },
    { label: "مثقال طلا", value: prices.goldMesghal, unit: "تومان" },
    { label: "بیت‌کوین", value: prices.btc, unit: "دلار" },
    { label: "تتر", value: prices.usdt, unit: "تومان" },
  ];

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">قیمت‌های لحظه‌ای بازار</h3>
        {prices.isPlaceholder && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
            داده نمونه — راهنمای اتصال API واقعی در README
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rows.map((r) => (
          <div key={r.label} className="text-center bg-gray-50 rounded-lg py-2 px-1">
            <div className="text-xs text-gray-500">{r.label}</div>
            <div className="font-bold text-gray-800 text-sm">
              {faNumber(r.value)} <span className="text-[10px] text-gray-400">{r.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
