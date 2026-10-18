import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { toman } from "@/lib/format";
import OrderActions from "./OrderActions";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { items: true, user: true, payment: true, address: true },
  });
  if (!order) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">سفارش #{order.id.slice(-6)}</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4">
          <h2 className="font-medium text-gray-700 mb-2">مشتری</h2>
          <p className="text-sm">{order.user.name || "—"}</p>
          <p className="text-sm text-gray-500">{order.user.phone}</p>
        </div>
        {order.address && (
          <div className="bg-white border rounded-xl p-4">
            <h2 className="font-medium text-gray-700 mb-2">آدرس تحویل</h2>
            <p className="text-sm">
              {order.address.city}، {order.address.province}
            </p>
            <p className="text-sm text-gray-500">{order.address.line1}</p>
            <p className="text-sm text-gray-500">{order.address.phone}</p>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <h2 className="font-medium text-gray-700 mb-2">اقلام سفارش</h2>
        <ul className="text-sm space-y-1">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between">
              <span>
                {it.titleSnapshot} × {it.quantity}
              </span>
              <span>{toman(it.unitPrice * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t mt-3 pt-3 text-sm space-y-1">
          <div className="flex justify-between text-gray-500">
            <span>جمع جزء</span>
            <span>{toman(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>تخفیف</span>
            <span>-{toman(order.discountTotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>مالیات</span>
            <span>{toman(order.taxTotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>هزینه ارسال</span>
            <span>{toman(order.shippingTotal)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900">
            <span>جمع کل</span>
            <span>{toman(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {order.payment && (
        <div className="bg-white border rounded-xl p-4 mb-6">
          <h2 className="font-medium text-gray-700 mb-2">پرداخت</h2>
          <p className="text-sm">روش: {order.payment.method === "CARD_TO_CARD" ? "کارت به کارت" : "زرین‌پال"}</p>
          <p className="text-sm">وضعیت: {order.payment.status}</p>
          {order.payment.cardTrackingCode && (
            <p className="text-sm">کد رهگیری واریز: {order.payment.cardTrackingCode}</p>
          )}
          {order.payment.zarinpalRefId && <p className="text-sm">کد پیگیری زرین‌پال: {order.payment.zarinpalRefId}</p>}
        </div>
      )}

      <OrderActions
        orderId={order.id}
        currentStatus={order.status}
        paymentMethod={order.payment?.method}
        paymentStatus={order.payment?.status}
      />
    </div>
  );
}
