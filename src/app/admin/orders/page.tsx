import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getManageableCategoryIds } from "@/lib/permissions";
import { toman } from "@/lib/format";

export default async function AdminOrdersPage() {
  const session = getSession()!;
  const categoryIds = await getManageableCategoryIds(session);

  const orders = await db.order.findMany({
    where:
      categoryIds === null
        ? {}
        : { items: { some: { product: { categoryId: { in: categoryIds } } } } },
    include: { user: true, payment: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">سفارش‌ها</h1>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-right p-3">سفارش</th>
              <th className="text-right p-3">مشتری</th>
              <th className="text-right p-3">مبلغ</th>
              <th className="text-right p-3">روش پرداخت</th>
              <th className="text-right p-3">وضعیت پرداخت</th>
              <th className="text-right p-3">وضعیت سفارش</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">#{o.id.slice(-6)}</td>
                <td className="p-3">{o.user.name || o.user.phone}</td>
                <td className="p-3">{toman(o.grandTotal)}</td>
                <td className="p-3">{o.payment?.method === "CARD_TO_CARD" ? "کارت به کارت" : "زرین‌پال"}</td>
                <td className="p-3">{o.payment?.status}</td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-brand-600">
                    جزئیات
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-4 text-sm text-gray-500">سفارشی یافت نشد.</p>}
      </div>
    </div>
  );
}
