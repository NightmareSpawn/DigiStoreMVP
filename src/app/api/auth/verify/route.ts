import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { phone, code, purpose, inviteCode, referrerCode, name } = await req.json();

  if (!phone || !code || !purpose) {
    return NextResponse.json({ error: "اطلاعات ناقص است." }, { status: 400 });
  }

  const valid = await verifyOtp(phone, purpose, code);
  if (!valid) {
    return NextResponse.json({ error: "کد وارد شده نادرست یا منقضی‌شده است." }, { status: 400 });
  }

  let user = await db.user.findUnique({ where: { phone } });

  if (purpose === "signup") {
    if (user) {
      return NextResponse.json({ error: "این شماره قبلاً ثبت‌نام کرده." }, { status: 400 });
    }

    const invite = inviteCode ? await db.inviteCode.findUnique({ where: { code: inviteCode } }) : null;
    if (!invite || !invite.active || invite.usedCount >= invite.maxUses) {
      return NextResponse.json({ error: "کد دعوت نامعتبر است." }, { status: 400 });
    }

    let referrer = null;
    if (referrerCode) {
      referrer = await db.user.findUnique({ where: { myReferralCode: referrerCode } });
    }

    user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          phone,
          name: name || null,
          inviteCodeUsed: inviteCode,
          referredByCode: referrer ? referrerCode : null,
        },
      });
      await tx.inviteCode.update({
        where: { id: invite.id },
        data: { usedCount: { increment: 1 } },
      });
      return created;
    });
  } else {
    if (!user) {
      return NextResponse.json({ error: "حسابی با این شماره یافت نشد." }, { status: 400 });
    }
  }

  const token = signSession({ userId: user.id, role: user.role, phone: user.phone });
  setSessionCookie(token);

  return NextResponse.json({ ok: true, role: user.role });
}
