import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getManageableCategoryIds } from "@/lib/permissions";
import { toman } from "@/lib/format";
import BulkDiscountForm from "./BulkDiscountForm";

export default async function AdminProductsPage() {
  const session = getSession()!;
  const categoryIds = await getManageableCategoryIds(session);

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: categoryIds === null ? {} : { categoryId: { in: categoryIds } },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      where: categoryIds === null ? {} : { id: { in: categoryIds } },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">محصولات</h1>
        <Link href="/admin/products/new" className="bg-brand-500 text-white rounded-lg px-4 py-2 text-sm">
          + محصول جدید
        </Link>
      </div>

      <BulkDiscountForm categories={categories} />

      <div className="bg-white border rounded-xl overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-right p-3">عنوان</th>
              <th className="text-right p-3">دسته‌بندی</th>
              <th className="text-right p-3">قیمت</th>
              <th className="text-right p-3">تخفیف</th>
              <th className="text-right p-3">وضعیت</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.title}</td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3">{toman(p.price)}</td>
                <td className="p-3">{p.discountPercent}٪</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-brand-600">
                    ویرایش
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-4 text-sm text-gray-500">محصولی یافت نشد.</p>}
      </div>
    </div>
  );
}
