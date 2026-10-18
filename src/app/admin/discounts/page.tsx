import { db } from "@/lib/db";
import { toman } from "@/lib/format";
import NewDiscountForm from "./NewDiscountForm";

export default async function AdminDiscountsPage() {
  const [discounts, categories] = await Promise.all([
    db.discountCode.findMany({ orderBy: { createdAt: "desc" } }),
    db.category.findMany(),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">کدهای تخفیف</h1>

      <NewDiscountForm categories={categories} />

      <div className="bg-white border rounded-xl overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-right p-3">کد</th>
              <th className="text-right p-3">مقدار</th>
              <th className="text-right p-3">تعداد استفاده</th>
              <th className="text-right p-3">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-3 font-mono">{d.code}</td>
                <td className="p-3">{d.percent ? `٪${d.percent}` : d.amount ? toman(d.amount) : "—"}</td>
                <td className="p-3">
                  {d.usedCount} {d.maxUses ? `/ ${d.maxUses}` : ""}
                </td>
                <td className="p-3">{d.active ? "فعال" : "غیرفعال"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {discounts.length === 0 && <p className="p-4 text-sm text-gray-500">کد تخفیفی ثبت نشده.</p>}
      </div>
    </div>
  );
}
