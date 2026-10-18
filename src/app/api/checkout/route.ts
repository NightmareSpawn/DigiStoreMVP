import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { zarinpalRequest } from "@/lib/zarinpal";

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });
  }

  const body = await req.json();
  const { items, address, discountCode, paymentMethod } = body as {
    items: { productId: string; variantId?: string; quantity: number }[];
    address: { fullName: string; city: string; province: string; line1: string; phone: string; postalCode?: string };
    discountCode?: string;
    paymentMethod: "CARD_TO_CARD" | "ZARINPAL";
  };

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "سبد خرید خالی است." }, { status: 400 });
  }

  // Re-fetch authoritative prices from DB (never trust client-sent prices)
  const products = await db.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    include: { variants: true, category: true },
  });

  // Enforce "own mobile only" restriction (Shahkar-gated categories)
  const restrictedCategory = products.find((p) => p.category.requiresOwnMobile);
  if (restrictedCategory) {
    const buyer = await db.user.findUnique({ where: { id: session.userId } });
    if (!buyer?.ownMobileVerified) {
      return NextResponse.json(
        {
          error: `خرید از دسته‌بندی «${restrictedCategory.category.name}» فقط با موبایل احراز‌شده به نام خودتان مجاز است. ابتدا از صفحه حساب کاربری، احراز هویت را انجام دهید.`,
          requiresOwnMobileVerification: true,
        },
        { status: 403 }
      );
    }
  }

  let subtotal = 0;
  let taxTotal = 0;
  let shippingTotal = 0;
  const orderItemsData: {
    productId: string;
    variantId?: string;
    titleSnapshot: string;
    unitPrice: number;
    quantity: number;
  }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const variant = product.variants.find((v) => v.id === item.variantId);
    const base = Math.round(product.price * (1 - product.discountPercent / 100));
    const unitPrice = base + (variant?.priceDelta || 0);

    subtotal += unitPrice * item.quantity;
    taxTotal += Math.round(unitPrice * item.quantity * (product.taxPercent / 100));
    shippingTotal += product.shippingCost;

    orderItemsData.push({
      productId: product.id,
      variantId: variant?.id,
      titleSnapshot: product.title,
      unitPrice,
      quantity: item.quantity,
    });
  }

  let discountTotal = 0;
  let discountRecord = null;
  if (discountCode) {
    discountRecord = await db.discountCode.findUnique({ where: { code: discountCode } });
    if (
      discountRecord &&
      discountRecord.active &&
      (!discountRecord.maxUses || discountRecord.usedCount < discountRecord.maxUses) &&
      (!discountRecord.expiresAt || discountRecord.expiresAt > new Date())
    ) {
      if (discountRecord.percent) discountTotal = Math.round(subtotal * (discountRecord.percent / 100));
      else if (discountRecord.amount) discountTotal = discountRecord.amount;
    } else {
      discountRecord = null;
    }
  }

  const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal + shippingTotal);

  const addressRecord = await db.address.create({
    data: { ...address, userId: session.userId },
  });

  const order = await db.order.create({
    data: {
      userId: session.userId,
      addressId: addressRecord.id,
      subtotal,
      discountTotal,
      taxTotal,
      shippingTotal,
      grandTotal,
      items: { create: orderItemsData },
    },
  });

  if (discountRecord) {
    await db.$transaction([
      db.discountCodeUsage.create({
        data: { discountCodeId: discountRecord.id, userId: session.userId, orderId: order.id },
      }),
      db.discountCode.update({ where: { id: discountRecord.id }, data: { usedCount: { increment: 1 } } }),
    ]);
  }

  if (paymentMethod === "CARD_TO_CARD") {
    await db.payment.create({
      data: { orderId: order.id, method: "CARD_TO_CARD", status: "PENDING_REVIEW" },
    });
    return NextResponse.json({ ok: true, orderId: order.id, method: "CARD_TO_CARD" });
  }

  // ZARINPAL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const result = await zarinpalRequest({
    amountToman: grandTotal,
    description: `سفارش #${order.id}`,
    callbackUrl: `${baseUrl}/api/payment/zarinpal/callback?orderId=${order.id}`,
    mobile: session.phone,
  });

  if (!result.ok) {
    return NextResponse.json({ error: "اتصال به درگاه پرداخت ناموفق بود." }, { status: 502 });
  }

  await db.payment.create({
    data: {
      orderId: order.id,
      method: "ZARINPAL",
      status: "AWAITING_GATEWAY",
      zarinpalAuthority: result.authority,
    },
  });

  return NextResponse.json({ ok: true, orderId: order.id, method: "ZARINPAL", payUrl: result.payUrl });
}
