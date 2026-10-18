import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getManageableCategoryIds } from "@/lib/permissions";
import { toman } from "@/lib/format";

export default async function AdminDashboard() {
  const session = getSession()!;
  const categoryIds = await getManageableCategoryIds(session);
  const productWhere = categoryIds === null ? {} : { categoryId: { in: categoryIds } };

  const [productCount, orderCount, pendingReview, revenueAgg] = await Promise.all([
    db.product.count({ where: productWhere }),
    categoryIds === null
      ? db.order.count()
      : db.order.count({ where: { items: { some: { product: { categoryId: { in: categoryIds } } } } } }),
    db.payment.count({ where: { status: "PENDING_REVIEW" } }),
    db.order.aggregate({
      where: { status: "PAID", ...(categoryIds === null ? {} : { items: { some: { product: { categoryId: { in: categoryIds } } } } }) },
      _sum: { grandTotal: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        داشبورد {session.role === "SUPER_ADMIN" ? "سوپر ادمین" : "ادمین"}
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="تعداد محصولات" value={String(productCount)} />
        <Stat label="تعداد سفارش‌ها" value={String(orderCount)} />
        <Stat label="در انتظار تأیید پرداخت" value={String(pendingReview)} />
        <Stat label="مجموع فروش موفق" value={toman(revenueAgg._sum.grandTotal || 0)} />
      </div>
      {session.role === "ADMIN" && (
        <p className="text-xs text-gray-400 mt-4">
          شما فقط به دسته‌بندی‌های اختصاص‌داده‌شده به خودتان دسترسی دارید.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="font-bold text-lg text-gray-900">{value}</div>
    </div>
  );
}
