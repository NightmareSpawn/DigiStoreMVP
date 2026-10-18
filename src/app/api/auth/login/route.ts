import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAndSendOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  if (!phone || !/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "شماره موبایل معتبر نیست." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { phone } });
  if (!user) {
    return NextResponse.json({ error: "حسابی با این شماره یافت نشد. ابتدا ثبت‌نام کنید." }, { status: 400 });
  }

  await createAndSendOtp(phone, "login");
  return NextResponse.json({ ok: true });
}
