"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CheckoutResultPage() {
  const params = useSearchParams();
  const ok = params.get("ok") === "1";

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {ok ? (
        <>
          <p className="text-green-600 font-medium mb-2 text-lg">پرداخت موفق بود ✅</p>
          <p className="text-sm text-gray-500 mb-6">سفارش شما ثبت و در حال پردازش است.</p>
        </>
      ) : (
        <>
          <p className="text-red-600 font-medium mb-2 text-lg">پرداخت ناموفق بود ❌</p>
          <p className="text-sm text-gray-500 mb-6">در صورت کسر وجه، مبلغ تا ۷۲ ساعت آینده بازگردانده می‌شود.</p>
        </>
      )}
      <Link href="/account" className="text-brand-600 text-sm">
        مشاهده سفارش‌های من
      </Link>
    </div>
  );
}
