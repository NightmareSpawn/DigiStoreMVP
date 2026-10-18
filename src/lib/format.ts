export function toman(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
}

export function faNumber(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function finalPrice(price: number, discountPercent: number) {
  return Math.round(price * (1 - discountPercent / 100));
}
