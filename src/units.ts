import { PLANS, roomArea, type PlanId } from "./plans";

export type UnitType = "suite" | "dos" | "tres" | "ph";
export type Status = "disponible" | "reservado" | "vendido";

export type Typology = {
  type: UnitType;
  name: string;
  short: string;
  bedrooms: string;
  baths: string;
  parking: string;
  storage: boolean;
};

export const TYPOLOGIES: Record<UnitType, Typology> = {
  suite: { type: "suite", name: "Suite", short: "Suite", bedrooms: "1 dormitorio", baths: "1 baño", parking: "Parqueadero opcional", storage: false },
  dos: { type: "dos", name: "Departamento de 2 dormitorios", short: "2 dorm.", bedrooms: "2 dormitorios", baths: "2 baños", parking: "1 parqueadero", storage: false },
  tres: { type: "tres", name: "Departamento de 3 dormitorios", short: "3 dorm.", bedrooms: "3 dormitorios", baths: "2 baños", parking: "2 parqueaderos", storage: true },
  ph: { type: "ph", name: "Penthouse", short: "PH", bedrooms: "2 dormitorios", baths: "2 baños", parking: "2 parqueaderos", storage: true },
};

type PlanInfo = { type: UnitType; side: string; view: string; premium: number; outdoor: number; outdoorName: "Balcón" | "Terraza" };

export const PLAN_INFO: Record<PlanId, PlanInfo> = {
  A: { type: "dos", side: "Noroeste", view: "Vista al Pichincha desde el dormitorio y a la ciudad desde la sala", premium: 1.03, outdoor: 4.8, outdoorName: "Balcón" },
  B: { type: "suite", side: "Noreste", view: "Vista a la ciudad y a los amaneceres", premium: 1, outdoor: 3.4, outdoorName: "Balcón" },
  C: { type: "dos", side: "Sureste", view: "Vista al parque y, en días despejados, al Cotopaxi", premium: 1.02, outdoor: 4.4, outdoorName: "Balcón" },
  D: { type: "tres", side: "Suroeste", view: "Vista al parque y al Pichincha", premium: 1.05, outdoor: 6.7, outdoorName: "Balcón" },
  PH1: { type: "ph", side: "Oeste", view: "Terraza privada y vista de frente al Pichincha", premium: 1.04, outdoor: 36.4, outdoorName: "Terraza" },
  PH2: { type: "ph", side: "Este", view: "Terraza privada y vista al valle y a los volcanes", premium: 1, outdoor: 36.4, outdoorName: "Terraza" },
};

export const FLOORS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const TOP_FLOOR = 12;

export const BASE_PRICE_M2 = 1390;
export const STEP_PER_FLOOR = 12;
export const PH_PRICE_M2 = 1650;
export const OUTDOOR_FACTOR = 0.5;

export type Unit = {
  id: string;
  floor: number;
  plan: PlanId;
  type: UnitType;
  area: number;
  outdoor: number;
  price: number;
  status: Status;
};

export const planArea = (plan: PlanId) => Math.round(PLANS[plan].rooms.reduce((sum, r) => sum + roomArea(r), 0));

export const pricePerM2 = (floor: number) => (floor === TOP_FLOOR ? PH_PRICE_M2 : BASE_PRICE_M2 + (floor - 2) * STEP_PER_FLOOR);

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(): Unit[] {
  const random = rng(2850);
  const units: Unit[] = [];
  for (const floor of FLOORS) {
    const plans: PlanId[] = floor === TOP_FLOOR ? ["PH1", "PH2"] : ["A", "B", "C", "D"];
    plans.forEach((plan, i) => {
      const info = PLAN_INFO[plan];
      const area = planArea(plan);
      const price = Math.round(((area + info.outdoor * OUTDOOR_FACTOR) * pricePerM2(floor) * info.premium) / 100) * 100;
      const r = random();
      const sold = 0.46 + (info.premium - 1) * 3 - (floor - 2) * 0.012;
      const status: Status = r < sold ? "vendido" : r < sold + 0.13 ? "reservado" : "disponible";
      units.push({ id: `${floor}${String(i + 1).padStart(2, "0")}`, floor, plan, type: info.type, area, outdoor: info.outdoor, price, status });
    });
  }
  const fix = (id: string, status: Status) => {
    const unit = units.find((u) => u.id === id);
    if (unit) unit.status = status;
  };
  fix("1201", "reservado");
  fix("1202", "disponible");
  return units;
}

export const UNITS = build();
export const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]));
export const unitsOnFloor = (floor: number) => UNITS.filter((u) => u.floor === floor);

export type TypeFilter = UnitType | "todos";

export const matches = (unit: Unit, filter: TypeFilter, onlyAvailable: boolean) =>
  (filter === "todos" || unit.type === filter) && (!onlyAvailable || unit.status === "disponible");

export const available = (list: Unit[] = UNITS) => list.filter((u) => u.status === "disponible");

export function fromPrice(type?: UnitType) {
  const list = available(type ? UNITS.filter((u) => u.type === type) : UNITS);
  return list.length ? Math.min(...list.map((u) => u.price)) : 0;
}

export const unitTitle = (unit: Unit) => (unit.type === "ph" ? `Penthouse ${unit.id}` : `Departamento ${unit.id}`);

export const STATUS_LABEL: Record<Status, string> = { disponible: "Disponible", reservado: "Reservado", vendido: "Vendido" };
