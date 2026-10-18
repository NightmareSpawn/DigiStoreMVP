import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "ابتدا وارد شوید." }, { status: 401 });

  const { productId, rating, comment } = await req.json();
  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "اطلاعات نظر معتبر نیست." }, { status: 400 });
  }

  // Only customers who actually received this product may review it.
  const deliveredItem = await db.orderItem.findFirst({
    where: {
      productId,
      order: { userId: session.userId, status: "DELIVERED" },
    },
  });

  if (!deliveredItem) {
    return NextResponse.json(
      { error: "فقط خریدارانی که سفارششان تحویل داده شده می‌توانند نظر ثبت کنند." },
      { status: 403 }
    );
  }

  const existing = await db.review.findFirst({ where: { productId, userId: session.userId } });
  if (existing) {
    return NextResponse.json({ error: "شما قبلاً برای این محصول نظر ثبت کرده‌اید." }, { status: 400 });
  }

  await db.review.create({
    data: { productId, userId: session.userId, rating, comment: comment || null, verifiedPurchase: true },
  });

  return NextResponse.json({ ok: true });
}
