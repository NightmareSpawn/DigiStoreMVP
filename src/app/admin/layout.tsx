import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    redirect("/auth/login");
  }

  const isSuperAdmin = session.role === "SUPER_ADMIN";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[200px_1fr] gap-6">
      <aside className="space-y-1 text-sm">
        <Link href="/admin" className="block px-3 py-2 rounded-lg hover:bg-white">
          داشبورد
        </Link>
        <Link href="/admin/products" className="block px-3 py-2 rounded-lg hover:bg-white">
          محصولات
        </Link>
        <Link href="/admin/orders" className="block px-3 py-2 rounded-lg hover:bg-white">
          سفارش‌ها
        </Link>
        <Link href="/admin/discounts" className="block px-3 py-2 rounded-lg hover:bg-white">
          کدهای تخفیف
        </Link>
        {isSuperAdmin && (
          <>
            <Link href="/admin/categories" className="block px-3 py-2 rounded-lg hover:bg-white">
              دسته‌بندی‌ها
            </Link>
            <Link href="/admin/admins" className="block px-3 py-2 rounded-lg hover:bg-white">
              مدیریت ادمین‌ها
            </Link>
          </>
        )}
      </aside>
      <div>{children}</div>
    </div>
  );
}
