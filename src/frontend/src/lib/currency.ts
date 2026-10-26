/**
 * Currency helpers. Backend prices are integer sen (1 RM = 100 sen).
 */

/** Format an integer sen amount as Malaysian Ringgit, e.g. 890n -> "RM 8.90". */
export function formatSen(sen: bigint | number): string {
  const value = typeof sen === "bigint" ? sen : BigInt(Math.trunc(sen));
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const ringgit = abs / 100n;
  const cents = abs % 100n;
  const centsText = cents.toString().padStart(2, "0");
  return `${negative ? "-" : ""}RM ${ringgit.toString()}.${centsText}`;
}

/** Convert a Ringgit string typed by a user into integer sen. Returns null when invalid. */
export function ringgitToSen(input: string): bigint | null {
  const trimmed = input.trim().replace(/^RM\s*/i, "");
  if (trimmed === "") return null;
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const cents = fraction.padEnd(2, "0").slice(0, 2);
  return BigInt(whole) * 100n + BigInt(cents);
}

/** Render integer sen as a plain Ringgit string for form inputs, e.g. 890n -> "8.90". */
export function senToRinggitInput(sen: bigint): string {
  const ringgit = sen / 100n;
  const cents = sen % 100n;
  return `${ringgit.toString()}.${cents.toString().padStart(2, "0")}`;
}
