/**
 * Live gold/currency prices for the homepage ticker.
 *
 * This ships with placeholder numbers so the UI works out of the box.
 * To make it live, sign up for a market-data API (e.g. navasan.tech,
 * brsapi.ir, or any similar Iranian price API — most have a free tier)
 * and fill in MARKET_PRICE_API_URL + MARKET_PRICE_API_KEY in .env, then
 * replace the body of fetchFromProvider() below with that API's actual
 * request/response shape.
 */

export type MarketPrices = {
  usdFree: number;
  usdNima: number;
  goldOunce: number;
  gold18k: number;
  goldMesghal: number;
  btc: number;
  usdt: number;
  isPlaceholder: boolean;
};

const PLACEHOLDER: MarketPrices = {
  usdFree: 705000,
  usdNima: 420000,
  goldOunce: 2650,
  gold18k: 42500000,
  goldMesghal: 184000000,
  btc: 97000,
  usdt: 706000,
  isPlaceholder: true,
};

export async function getMarketPrices(): Promise<MarketPrices> {
  const apiUrl = process.env.MARKET_PRICE_API_URL;
  const apiKey = process.env.MARKET_PRICE_API_KEY;

  if (!apiUrl || !apiKey) {
    return PLACEHOLDER;
  }

  try {
    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 60 }, // refresh every minute
    });
    if (!res.ok) return PLACEHOLDER;
    const data = await res.json();

    // --- Adjust this mapping to match your chosen provider's response ---
    return {
      usdFree: data.usd_free ?? PLACEHOLDER.usdFree,
      usdNima: data.usd_nima ?? PLACEHOLDER.usdNima,
      goldOunce: data.gold_ounce ?? PLACEHOLDER.goldOunce,
      gold18k: data.gold_18k ?? PLACEHOLDER.gold18k,
      goldMesghal: data.gold_mesghal ?? PLACEHOLDER.goldMesghal,
      btc: data.btc ?? PLACEHOLDER.btc,
      usdt: data.usdt ?? PLACEHOLDER.usdt,
      isPlaceholder: false,
    };
  } catch {
    return PLACEHOLDER;
  }
}
