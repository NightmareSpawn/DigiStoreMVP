/**
 * "Shahkar" ownership check — confirms a SIM card belongs to the national ID
 * of the person using it. Required by the brief for certain restricted
 * categories (so only the account holder's own phone can buy).
 *
 * Real Shahkar access is a regulated API (via mobile operators / Shaparak)
 * and requires a registered business + contract — it can't be wired up from
 * here. This is a MOCK that always succeeds, so the rest of the flow
 * (UI, DB field, checkout gate) is fully built and testable today.
 *
 * To go live: replace the body of verifyOwnMobile() with a real call once
 * you have Shahkar API credentials, keeping the same return shape.
 */
export async function verifyOwnMobile(opts: {
  phone: string;
  nationalId: string;
}): Promise<{ ok: boolean; reason?: string }> {
  if (!opts.nationalId || opts.nationalId.length !== 10) {
    return { ok: false, reason: "کد ملی معتبر نیست." };
  }
  // --- MOCK: always approves. Swap in a real Shahkar API call here. ---
  return { ok: true };
}
