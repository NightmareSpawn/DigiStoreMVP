"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cartStore";
import { toman } from "@/lib/format";
import { IRAN_PROVINCES, PROVINCE_NAMES } from "@/lib/provinces";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [province, setProvince] = useState(PROVINCE_NAMES[0]);
  const [city, setCity] = useState(IRAN_PROVINCES[PROVINCE_NAMES[0]][0]);
  const [line1, setLine1] = useState("");
  const [phone, setPhone] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CARD_TO_CARD" | "ZARINPAL">("ZARINPAL");
  const [error, setError] = useState("");
  const [needsOwnMobileVerification, setNeedsOwnMobileVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsOwnMobileVerification(false);
    setLoading(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
        address: { fullName, city, province, line1, phone },
        discountCode: discountCode || undefined,
        paymentMethod,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "خطایی رخ داد.");
      if (data.requiresOwnMobileVerification) setNeedsOwnMobileVerification(true);
      if (res.status === 401) router.push("/auth/login");
      return;
    }

    clear();

    if (data.method === "ZARINPAL") {
      window.location.href = data.payUrl;
    } else {
      router.push(`/checkout/card-to-card?orderId=${data.orderId}`);
    }
  }

  if (items.length === 0) {
    return <p className="text-center py-16 text-gray-500">سبد خرید خالی است.</p>;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-800 mb-6">تسویه حساب</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-medium text-gray-700">آدرس تحویل</h2>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="نام و نام خانوادگی"
            className="border rounded-lg px-3 py-2 w-full text-sm"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={province}
              onChange={(e) => {
                const newProvince = e.target.value;
                setProvince(newProvince);
                setCity(IRAN_PROVINCES[newProvince][0]); // reset city to match the new province
              }}
              className="border rounded-lg px-3 py-2 w-full text-sm"
            >
              {PROVINCE_NAMES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full text-sm"
            >
              {IRAN_PROVINCES[province].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <input
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="آدرس کامل"
            className="border rounded-lg px-3 py-2 w-full text-sm"
            required
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="شماره تماس گیرنده"
            className="border rounded-lg px-3 py-2 w-full text-sm"
            required
          />
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-medium text-gray-700">کد تخفیف</h2>
          <input
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="کد تخفیف (اختیاری)"
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-2">
          <h2 className="font-medium text-gray-700 mb-2">روش پرداخت</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={paymentMethod === "ZARINPAL"}
              onChange={() => setPaymentMethod("ZARINPAL")}
            />
            پرداخت آنلاین (زرین‌پال)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={paymentMethod === "CARD_TO_CARD"}
              onChange={() => setPaymentMethod("CARD_TO_CARD")}
            />
            کارت به کارت
          </label>
        </div>

        <div className="bg-white border rounded-xl p-4 flex items-center justify-between">
          <span className="text-gray-600">جمع کل (تقریبی)</span>
          <span className="font-bold text-gray-900">{toman(subtotal())}</span>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
            {needsOwnMobileVerification && (
              <>
                {" "}
                <Link href="/account" className="underline">
                  رفتن به صفحه احراز هویت
                </Link>
              </>
            )}
          </div>
        )}

        <button
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-lg py-3 font-medium disabled:opacity-50"
        >
          {loading ? "در حال ثبت سفارش..." : "ثبت سفارش و پرداخت"}
        </button>
      </form>
    </div>
  );
}
