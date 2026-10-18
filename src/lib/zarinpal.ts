/**
 * Zarinpal sandbox integration.
 * The sandbox merchant ID "00000000-0000-0000-0000-000000000000" works for
 * everyone without registration — perfect for an MVP demo. Swap in a real
 * merchant ID (from https://next.zarinpal.com) and set ZARINPAL_SANDBOX=false
 * for production.
 */

const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || "00000000-0000-0000-0000-000000000000";
const SANDBOX = process.env.ZARINPAL_SANDBOX !== "false";

const BASE = SANDBOX
  ? "https://sandbox.zarinpal.com/pg/v4/payment"
  : "https://payment.zarinpal.com/pg/v4/payment";

const STARTPAY_BASE = SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay"
  : "https://www.zarinpal.com/pg/StartPay";

export async function zarinpalRequest(opts: {
  amountToman: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
}) {
  const res = await fetch(`${BASE}/request.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      amount: opts.amountToman * 10, // Zarinpal expects Rial
      description: opts.description,
      callback_url: opts.callbackUrl,
      metadata: opts.mobile ? { mobile: opts.mobile } : undefined,
    }),
  });
  const data = await res.json();
  if (data?.data?.code === 100) {
    return {
      ok: true as const,
      authority: data.data.authority as string,
      payUrl: `${STARTPAY_BASE}/${data.data.authority}`,
    };
  }
  return { ok: false as const, error: data?.errors || data };
}

export async function zarinpalVerify(opts: { amountToman: number; authority: string }) {
  const res = await fetch(`${BASE}/verify.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      amount: opts.amountToman * 10,
      authority: opts.authority,
    }),
  });
  const data = await res.json();
  if (data?.data?.code === 100 || data?.data?.code === 101) {
    return { ok: true as const, refId: String(data.data.ref_id) };
  }
  return { ok: false as const, error: data?.errors || data };
}
