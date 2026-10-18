import Link from "next/link";
import { getSession } from "@/lib/auth";
import CartIcon from "./CartIcon";

export default async function Header() {
  const session = getSession();

  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-brand-600">
          دیجی‌استور
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <Link href="/category/electronics">الکترونیک</Link>
          <Link href="/category/home-appliances">لوازم خانگی</Link>
          <Link href="/category/fashion">پوشاک</Link>
          <Link href="/category/courses">آموزش</Link>
        </nav>

        <div className="flex items-center gap-4">
          <CartIcon />
          {session ? (
            <div className="flex items-center gap-3 text-sm">
              {(session.role === "ADMIN" || session.role === "SUPER_ADMIN") && (
                <Link href="/admin" className="text-brand-600 font-medium">
                  پنل ادمین
                </Link>
              )}
              <Link href="/account" className="text-gray-700">
                حساب من
              </Link>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm bg-brand-500 text-white px-4 py-1.5 rounded-lg hover:bg-brand-600"
            >
              ورود / ثبت‌نام
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
