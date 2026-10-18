import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { toman } from "@/lib/format";
import VerifyOwnMobile from "./VerifyOwnMobile";

const statusLabel: Record<string, string> = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل‌داده‌شده",
  CANCELLED: "لغوشده",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-800 mb-2">حساب من</h1>
      <p className="text-sm text-gray-500 mb-6">
        {user.name || "کاربر"} — {user.phone} — سطح مشتری:{" "}
        <span className="font-medium">{tierLabel(user.tier)}</span>
      </p>
      <p className="text-xs text-gray-400 mb-6">
        کد معرف شما: <span className="font-mono">{user.myReferralCode}</span>
      </p>

      <VerifyOwnMobile verified={user.ownMobileVerified} />

      <h2 className="font-bold text-gray-800 mb-3">سفارش‌های من</h2>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">سفارش #{o.id.slice(-6)}</span>
              <span className="text-xs bg-gray-100 rounded px-2 py-0.5">{statusLabel[o.status]}</span>
            </div>
            <ul className="text-sm text-gray-700 mb-2">
              {o.items.map((it) => (
                <li key={it.id}>
                  {it.titleSnapshot} × {it.quantity}
                </li>
              ))}
            </ul>
            <div className="text-sm font-bold text-gray-900">{toman(o.grandTotal)}</div>
            {o.payment?.method === "CARD_TO_CARD" && o.payment.status === "PENDING_REVIEW" && (
              <p className="text-xs text-amber-600 mt-1">در انتظار تأیید پرداخت توسط ادمین</p>
            )}
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-gray-500">هنوز سفارشی ثبت نکرده‌اید.</p>}
      </div>
    </div>
  );
}

function tierLabel(tier: string) {
  const map: Record<string, string> = {
    NONE: "بدون سطح",
    BRONZE: "برنز",
    SILVER: "سیلور",
    ROSE_GOLD: "رزگلد",
    GOLD: "گلد",
  };
  return map[tier] || tier;
}
