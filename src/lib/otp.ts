import { db } from "./db";

/**
 * OTP sending is pluggable. In dev (no SMS_PROVIDER_API_KEY set), the code
 * is just printed to the server console so you can test the full flow
 * without a real SMS account. To go live, implement `sendRealSms` below
 * with an Iranian provider (Kavenegar, ippanel, Farapayamak, ...).
 */
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createAndSendOtp(phone: string, purpose: "signup" | "login") {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

  await db.otpCode.create({
    data: { phone, code, purpose, expiresAt },
  });

  if (process.env.SMS_PROVIDER_API_KEY) {
    await sendRealSms(phone, code);
  } else {
    // --- DEV MODE: no SMS provider configured ---
    console.log(`\n[OTP] ${phone} → ${code}  (purpose: ${purpose}, expires in 2 min)\n`);
  }

  return { expiresAt };
}

export async function verifyOtp(phone: string, purpose: "signup" | "login", code: string) {
  const record = await db.otpCode.findFirst({
    where: { phone, purpose, code, consumed: false },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return false;
  if (record.expiresAt < new Date()) return false;

  await db.otpCode.update({ where: { id: record.id }, data: { consumed: true } });
  return true;
}

// Implement this when you have a real SMS provider account.
async function sendRealSms(phone: string, code: string) {
  // Example shape for Kavenegar-style REST APIs — adjust to your provider's docs.
  // await fetch(`https://api.kavenegar.com/v1/${process.env.SMS_PROVIDER_API_KEY}/sms/send.json`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //   body: new URLSearchParams({ receptor: phone, message: `کد ورود شما: ${code}` }),
  // });
  console.log(`[OTP] (sendRealSms not implemented yet) ${phone} → ${code}`);
}
