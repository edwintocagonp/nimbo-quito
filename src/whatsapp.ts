import { BRAND } from "./content";
import { EXTRAS, RESERVE, decimal, money, type Simulation } from "./finance";
import { PLAN_INFO, TYPOLOGIES, unitTitle, type Unit } from "./units";

export const waLink = (text: string) => `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;

const describe = (unit: Unit) =>
  `${unitTitle(unit)} · piso ${unit.floor} · ${TYPOLOGIES[unit.type].bedrooms}, ${unit.area} m² + ${PLAN_INFO[unit.plan].outdoorName.toLowerCase()} de ${decimal(unit.outdoor)} m²`;

export function reserveMessage(unit: Unit) {
  return [
    `Hola, Nimbo 👋 Quiero separar este departamento:`,
    `• ${describe(unit)}`,
    `• Precio de preventa: ${money(unit.price)}`,
    `¿Me ayudan con la reserva de ${money(RESERVE)}?`,
  ].join("\n");
}

export function planMessage(unit: Unit, sim: Simulation, rateLabel: string, rate: number, years: number, extras: (keyof typeof EXTRAS)[]) {
  return [
    `Hola, Nimbo 👋 Me interesa este plan de pago:`,
    `• ${describe(unit)}`,
    ...extras.map((e) => `• ${EXTRAS[e].label}: ${money(EXTRAS[e].price)}`),
    `• Total: ${money(sim.price)}`,
    `• Reserva: ${money(RESERVE)}`,
    `• Entrada: ${money(sim.down)} (${sim.months} cuotas de ${money(sim.monthlyDown)})`,
    `• Crédito: ${money(sim.loan)} a ${years} años con ${rateLabel} (${decimal(rate)} %): unos ${money(sim.monthly)} al mes`,
    `¿Me ayudan con la precalificación?`,
  ].join("\n");
}

export function visitMessage(name: string, day: string, slot: string, interest: string) {
  return [`Hola, Nimbo 👋 Soy ${name || "un interesado"}.`, `Quiero agendar una visita a la sala de ventas el ${day} en la ${slot}.`, `Me interesa: ${interest}.`].join("\n");
}

export const infoMessage = () => `Hola, Nimbo 👋 Quiero más información sobre los departamentos en preventa.`;
