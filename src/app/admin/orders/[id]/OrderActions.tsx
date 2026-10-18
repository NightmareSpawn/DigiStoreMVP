"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderActions({
  orderId,
  currentStatus,
  paymentMethod,
  paymentStatus,
}: {
  orderId: string;
  currentStatus: string;
  paymentMethod?: string;
  paymentStatus?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function call(url: string, body?: object) {
    setLoading(true);
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-white border rounded-xl p-4 space-y-3">
      <h2 className="font-medium text-gray-700">اقدامات</h2>

      {paymentMethod === "CARD_TO_CARD" && paymentStatus === "PENDING_REVIEW" && (
        <div className="flex gap-2">
          <button
            disabled={loading}
            onClick={() => call(`/api/admin/orders/${orderId}/approve`)}
            className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          >
            تأیید پرداخت
          </button>
          <button
            disabled={loading}
            onClick={() => call(`/api/admin/orders/${orderId}/reject`)}
            className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          >
            رد پرداخت
          </button>
        </div>
      )}

      <div>
        <label className="text-sm text-gray-600 block mb-1">تغییر وضعیت سفارش</label>
        <select
          defaultValue={currentStatus}
          onChange={(e) => call(`/api/admin/orders/${orderId}/status`, { status: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="PENDING_PAYMENT">در انتظار پرداخت</option>
          <option value="PAID">پرداخت‌شده</option>
          <option value="PROCESSING">در حال پردازش</option>
          <option value="SHIPPED">ارسال‌شده</option>
          <option value="DELIVERED">تحویل‌داده‌شده</option>
          <option value="CANCELLED">لغوشده</option>
        </select>
      </div>
    </div>
  );
}
