import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import NewAdminForm from "./NewAdminForm";
import AdminRow from "./AdminRow";

export default async function AdminAdminsPage() {
  const session = getSession()!;
  if (session.role !== "SUPER_ADMIN") redirect("/admin");

  const [admins, categories] = await Promise.all([
    db.user.findMany({
      where: { role: "ADMIN" },
      include: { categoryAccess: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-2">مدیریت ادمین‌ها</h1>
      <p className="text-sm text-gray-500 mb-6">
        ادمین جدید با شماره موبایلش ساخته می‌شود؛ خودش با همان شماره و کد پیامکی وارد می‌شود (نیازی به رمز عبور نیست).
      </p>

      <NewAdminForm categories={categories} />

      <div className="bg-white border rounded-xl overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-right p-3">نام</th>
              <th className="text-right p-3">موبایل</th>
              <th className="text-right p-3">دسته‌بندی‌های تحت کنترل</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <AdminRow
                key={a.id}
                admin={{
                  id: a.id,
                  name: a.name,
                  phone: a.phone,
                  categoryIds: a.categoryAccess.map((ca) => ca.categoryId),
                }}
                allCategories={categories.map((c) => ({ id: c.id, name: c.name }))}
              />
            ))}
          </tbody>
        </table>
        {admins.length === 0 && <p className="p-4 text-sm text-gray-500">ادمین محدودی ثبت نشده.</p>}
      </div>
    </div>
  );
}
