import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import NewCategoryForm from "./NewCategoryForm";
import CategoryRow from "./CategoryRow";

export default async function AdminCategoriesPage() {
  const session = getSession()!;
  if (session.role !== "SUPER_ADMIN") redirect("/admin");

  const categories = await db.category.findMany({
    include: { parent: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">دسته‌بندی‌ها</h1>

      <NewCategoryForm categories={categories} />

      <div className="bg-white border rounded-xl overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-right p-3">نام</th>
              <th className="text-right p-3">نامک</th>
              <th className="text-right p-3">زیرمجموعه‌ی</th>
              <th className="text-right p-3">تعداد محصول</th>
              <th className="text-right p-3">محدودیت موبایل اختصاصی</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <CategoryRow
                key={c.id}
                category={{
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                  parentName: c.parent?.name,
                  productCount: c._count.products,
                  requiresOwnMobile: c.requiresOwnMobile,
                }}
                allCategories={categories.map((x) => ({ id: x.id, name: x.name }))}
              />
            ))}
          </tbody>
        </table>
        {categories.length === 0 && <p className="p-4 text-sm text-gray-500">دسته‌بندی‌ای ثبت نشده.</p>}
      </div>
    </div>
  );
}
