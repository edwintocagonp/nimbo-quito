export const RESERVE = 2000;
export const DELIVERY = new Date(2028, 11, 15);
export const PRESALE = new Date(2026, 9, 1);
export const INCOME_SHARE = 0.35;

export const RATES = [
  { id: "banco", label: "Banca privada", rate: 8.5 },
  { id: "biess", label: "BIESS", rate: 6.9 },
] as const;

export const EXTRAS = {
  parking: { label: "Parqueadero adicional", price: 9500 },
  storage: { label: "Bodega", price: 2800 },
} as const;

export function monthsUntilDelivery(now: Date) {
  const months = (DELIVERY.getFullYear() - now.getFullYear()) * 12 + (DELIVERY.getMonth() - now.getMonth());
  return Math.max(6, months);
}

export type Simulation = {
  price: number;
  down: number;
  installments: number;
  monthlyDown: number;
  months: number;
  loan: number;
  monthly: number;
  income: number;
};

export function simulate(price: number, downPct: number, rate: number, years: number, months: number): Simulation {
  const down = Math.round(price * downPct);
  const installments = Math.max(0, down - RESERVE);
  const loan = price - down;
  const r = rate / 100 / 12;
  const n = years * 12;
  const monthly = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
  return { price, down, installments, monthlyDown: installments / months, months, loan, monthly, income: monthly / INCOME_SHARE };
}

const usd = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("es-EC", { maximumFractionDigits: 1 });

export const money = (value: number) => usd.format(Math.round(value));
export const decimal = (value: number) => num.format(value);
export const deliveryLabel = () => DELIVERY.toLocaleDateString("es-EC", { month: "long", year: "numeric" });
