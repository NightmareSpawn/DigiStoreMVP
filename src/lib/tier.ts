import type { CustomerTier } from "./enums";

/**
 * Customer tier thresholds, exactly as specified in the project brief
 * (amounts are cumulative Toman spent):
 *   BRONZE   : 7M  - 15M
 *   SILVER   : 15M - 30M
 *   ROSE_GOLD: 30M - 60M
 *   GOLD     : 60M - 90M+
 */
export function computeTier(totalSpent: number): CustomerTier {
  if (totalSpent >= 60_000_000) return "GOLD";
  if (totalSpent >= 30_000_000) return "ROSE_GOLD";
  if (totalSpent >= 15_000_000) return "SILVER";
  if (totalSpent >= 7_000_000) return "BRONZE";
  return "NONE";
}
