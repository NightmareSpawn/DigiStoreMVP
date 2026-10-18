import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAndSendOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const { phone, inviteCode } = await req.json();

  if (!phone || !/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "شماره موبایل معتبر نیست." }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "این شماره قبلاً ثبت‌نام کرده. از صفحه ورود استفاده کنید." }, { status: 400 });
  }

  if (!inviteCode) {
    return NextResponse.json({ error: "کد دعوت الزامی است." }, { status: 400 });
  }
  const invite = await db.inviteCode.findUnique({ where: { code: inviteCode } });
  if (!invite || !invite.active || invite.usedCount >= invite.maxUses) {
    return NextResponse.json({ error: "کد دعوت نامعتبر یا منقضی‌شده است." }, { status: 400 });
  }

  await createAndSendOtp(phone, "signup");
  return NextResponse.json({ ok: true });
}
