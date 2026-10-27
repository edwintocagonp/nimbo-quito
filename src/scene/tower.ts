import * as THREE from "three";

import { CORE, HALF, HALL, PH_LOBBY, PLANS, outward, planWalls, type PlanId, type Rect, type RoomKind } from "../plans";
import { TOP_FLOOR } from "../units";
import { C, furnish } from "./furniture";
import { Parts, SHAPES, wallBox } from "./geometry";

export const GROUND_H = 4.5;
export const FLOOR_H = 3;
export const SLAB = 0.3;
export const GLASS_H = FLOOR_H - SLAB;
export const floorBase = (floor: number) => GROUND_H + (floor - 2) * FLOOR_H;
export const ROOF_Y = floorBase(TOP_FLOOR + 1);
export const DRAWER = 27;

export const B = {
  concrete: "#ece9e2",
  shade: "#d8d3c9",
  wood: "#a8744a",
  metal: "#2b2f33",
  stone: "#cbc2b2",
  deck: "#9f7150",
  poche: "#2e302d",
  wall: "#f7f5f0",
};

export const plansOn = (floor: number): PlanId[] => (floor === TOP_FLOOR ? ["PH1", "PH2"] : ["A", "B", "C", "D"]);

function railing(solid: Parts, glass: Parts, axis: "x" | "z", c: number, a: number, b: number, y = 0) {
  wallBox(glass, axis, c, a, b, 0.03, y, y + 1.05, "#d5e5ec");
  wallBox(solid, axis, c, a, b, 0.07, y + 1.03, y + 1.1, B.metal);
}

function rectEdges(r: Rect) {
  return [
    ["z", r[1], r[0], r[2]],
    ["z", r[3], r[0], r[2]],
    ["x", r[0], r[1], r[3]],
    ["x", r[2], r[1], r[3]],
  ] as const;
}

const onPlate = (axis: "x" | "z", c: number) => Math.abs(Math.abs(c) - HALF) < 1e-6 && (axis === "x" || axis === "z");

export type FloorGeometry = {
  slab: THREE.BufferGeometry;
  facade: THREE.BufferGeometry;
  railGlass: THREE.BufferGeometry;
  units: { id: PlanId; glass: THREE.BufferGeometry }[];
};

export function floorGeometry(floor: number): FloorGeometry {
  const slab = new Parts();
  const facade = new Parts();
  const railGlass = new Parts();
  const ph = floor === TOP_FLOOR;
  slab.box(HALF * 2 + 0.5, SLAB, HALF * 2 + 0.5, 0, -SLAB / 2, 0, B.concrete);
  const units = plansOn(floor).map((id) => {
    const plan = PLANS[id];
    const glass = new Parts();
    for (const wall of planWalls(id)) {
      if (wall.kind !== "facade" && wall.kind !== "solid") continue;
      const n = outward(id, wall);
      const len = wall.b - wall.a;
      if (wall.kind === "solid") {
        wallBox(facade, wall.axis, wall.c - n * 0.12, wall.a, wall.b, 0.24, 0, GLASS_H, B.stone, undefined, 0.12);
        continue;
      }
      wallBox(glass, wall.axis, wall.c - n * 0.08, wall.a, wall.b, 0.05, 0, GLASS_H, "#ffffff");
      const count = Math.max(1, Math.round(len / 1.5));
      for (let i = 0; i <= count; i++) {
        const t = wall.a + (len * i) / count;
        if (wall.axis === "z") facade.box(0.07, GLASS_H, 0.12, t, GLASS_H / 2, wall.c, B.metal);
        else facade.box(0.12, GLASS_H, 0.07, wall.c, GLASS_H / 2, t, B.metal);
      }
      facade.box(wall.axis === "z" ? len : 0.1, 0.12, wall.axis === "z" ? 0.1 : len, wall.axis === "z" ? (wall.a + wall.b) / 2 : wall.c, 0.9, wall.axis === "z" ? wall.c : (wall.a + wall.b) / 2, B.metal);
      if (wall.axis === "x" && onPlate(wall.axis, wall.c)) {
        for (let t = wall.a + 0.6; t < wall.b - 0.3; t += 1.2) facade.box(0.46, GLASS_H, 0.07, wall.c + n * 0.25, GLASS_H / 2, t, B.wood);
      }
    }
    for (const balcony of plan.balconies) {
      slab.box(balcony[2] - balcony[0], 0.22, balcony[3] - balcony[1], (balcony[0] + balcony[2]) / 2, -0.11, (balcony[1] + balcony[3]) / 2, B.concrete);
      for (const [axis, c, a, b] of rectEdges(balcony)) {
        if (onPlate(axis, c)) continue;
        railing(slab, railGlass, axis, c + (axis === "z" ? Math.sign(c) * -0.03 : (c > (balcony[0] + balcony[2]) / 2 ? -0.03 : 0.03)), a, b);
      }
    }
    if (plan.terrace) {
      const r = plan.terrace.rect;
      slab.box(r[2] - r[0], 0.05, r[3] - r[1], (r[0] + r[2]) / 2, 0.025, (r[1] + r[3]) / 2, B.deck);
      for (const [axis, c, a, b] of rectEdges(r)) if (onPlate(axis, c)) railing(slab, railGlass, axis, c - Math.sign(c) * 0.06, a, b);
      plan.terrace.furn.forEach((f, i) => furnish(slab, railGlass, f, i, 0.05));
    }
    return { id, glass: glass.merge() };
  });
  if (!ph) slab.box(HALF * 2 + 0.5, 0.08, 0.06, 0, -0.04, HALF + 0.25, B.shade);
  return { slab: slab.merge(), facade: facade.merge(), railGlass: railGlass.merge(), units };
}

const FLOOR_COLOR: Record<RoomKind, string> = {
  social: "#c9a47c",
  dorm: "#cfae88",
  circ: "#c7a885",
  cocina: "#dcd7cd",
  bano: "#d6dadb",
  servicio: "#d9d4c9",
};

export type Dollhouse = { solid: THREE.BufferGeometry; glass: THREE.BufferGeometry };

const dollCache = new Map<string, Dollhouse>();

export function dollhouse(id: PlanId): Dollhouse {
  const hit = dollCache.get(id);
  if (hit) return hit;
  const solid = new Parts();
  const glass = new Parts();
  const plan = PLANS[id];
  plan.rooms.forEach((room, i) => {
    for (const r of room.rects) solid.box(r[2] - r[0], 0.03, r[3] - r[1], (r[0] + r[2]) / 2, 0.015, (r[1] + r[3]) / 2, FLOOR_COLOR[room.kind]);
    room.furn?.forEach((f, j) => furnish(solid, glass, f, i * 7 + j, 0.03));
  });
  for (const wall of planWalls(id)) {
    const n = wall.kind === "facade" || wall.kind === "solid" ? outward(id, wall) : 0;
    const c = wall.c - n * 0.08;
    if (wall.kind === "interior") wallBox(solid, wall.axis, wall.c, wall.a, wall.b, 0.1, 0, 1.1, B.wall, B.poche, 0.05);
    else if (wall.kind === "party") wallBox(solid, wall.axis, wall.c, wall.a, wall.b, 0.22, 0, 1.15, B.wall, B.poche, 0.11);
    else if (wall.kind === "solid") wallBox(solid, wall.axis, c, wall.a, wall.b, 0.22, 0, 1.15, B.wall, B.poche, 0.11);
    else {
      wallBox(solid, wall.axis, c, wall.a, wall.b, 0.16, 0, 0.42, B.wall, B.poche, 0.08);
      wallBox(glass, wall.axis, c, wall.a, wall.b, 0.03, 0.42, 1.15, "#d4e6ee");
      wallBox(solid, wall.axis, c, wall.a, wall.b, 0.1, 1.13, 1.17, B.metal);
    }
  }
  const result = { solid: solid.merge(), glass: glass.merge() };
  dollCache.set(id, result);
  return result;
}

const coreCache = new Map<boolean, THREE.BufferGeometry>();

export function coreDollhouse(ph: boolean) {
  const hit = coreCache.get(ph);
  if (hit) return hit;
  const parts = new Parts();
  for (const r of ph ? [PH_LOBBY] : HALL) parts.box(r[2] - r[0], 0.03, r[3] - r[1], (r[0] + r[2]) / 2, 0.015, (r[1] + r[3]) / 2, "#d2cdc3");
  parts.box(CORE[2] - CORE[0], 1.15, CORE[3] - CORE[1], (CORE[0] + CORE[2]) / 2, 0.575, (CORE[1] + CORE[3]) / 2, "#a3a39f", B.poche);
  for (const x of [0.5, 1.9]) parts.box(0.9, 0.02, 0.05, x, 1.16, CORE[1] - 0.01, "#d9b97f");
  for (let i = 0; i < 8; i++) parts.box(0.08, 0.02, 2.2, -2.3 + i * 0.28, 1.16, 0.7, "#c9c6bf");
  const g = parts.merge();
  coreCache.set(ph, g);
  return g;
}

export function unitOverlay(id: PlanId) {
  const parts = new Parts();
  for (const room of PLANS[id].rooms) for (const r of room.rects) parts.box(r[2] - r[0], 0.02, r[3] - r[1], (r[0] + r[2]) / 2, 0.06, (r[1] + r[3]) / 2, "#ffffff");
  return parts.merge();
}

export function groundFloorGeometry() {
  const solid = new Parts();
  const glass = new Parts();
  const h = GROUND_H - SLAB;
  solid.box(HALF * 2 + 0.5, 0.12, HALF * 2 + 0.5, 0, 0.06, 0, B.shade);
  for (const t of [-9, -3, 3, 9]) {
    for (const s of [-9, 9]) {
      solid.box(0.55, h, 0.55, t, h / 2, s, B.concrete);
      solid.box(0.55, h, 0.55, s, h / 2, t, B.concrete);
    }
  }
  wallBox(glass, "x", 7.9, -7.9, 7.9, 0.06, 0.1, h, "#ffffff");
  wallBox(glass, "z", 7.9, -7.9, 7.9, 0.06, 0.1, h, "#ffffff");
  wallBox(solid, "x", -8.4, -8.4, 8.4, 0.3, 0, h, B.stone);
  wallBox(solid, "z", -8.4, -8.4, 8.4, 0.3, 0, h, B.stone);
  solid.box(5.5, 2.7, 0.05, -2.5, 1.35, -8.58, "#3b3d3f");
  for (const t of [-6, -2, 2, 6]) {
    solid.box(0.08, h, 0.08, 7.9, h / 2, t, B.metal);
    solid.box(0.08, h, 0.08, t, h / 2, 7.9, B.metal);
  }
  solid.box(1.6, 3.6, 7.5, -0.5, 1.8, 0, B.wood);
  solid.box(2.4, 1.05, 0.7, 4.2, 0.53, -3.6, "#e6e1d7");
  solid.box(3.6, 0.28, 7.6, HALF + 1.8, 3.72, 0, B.concrete);
  solid.box(0.12, 3.6, 0.12, HALF + 3.3, 1.8, -3.5, B.metal);
  solid.box(0.12, 3.6, 0.12, HALF + 3.3, 1.8, 3.5, B.metal);
  for (const [x, z] of [[11.5, -6.5], [11.5, 6.5], [6.5, 11.5], [-6.5, 11.5]] as const) {
    solid.box(1.6, 0.55, 1.6, x, 0.275, z, "#d9d4c9");
    solid.shape(SHAPES.blob, x, 1.05, z, C.green, 0.75, 0.6, 0.75);
  }
  return { solid: solid.merge(), glass: glass.merge() };
}

export function roofGeometry() {
  const solid = new Parts();
  const glass = new Parts();
  const roofs: Rect[] = [
    [-HALF, -HALF, -2.6, HALF],
    [2.6, -HALF, HALF, HALF],
    [-2.6, -2, 2.6, 2],
  ];
  for (const r of roofs) solid.box(r[2] - r[0] + 0.5, SLAB, r[3] - r[1] + 0.5, (r[0] + r[2]) / 2, -SLAB / 2, (r[1] + r[3]) / 2, B.concrete);
  solid.box(5.2, 3.2, 4, 0, 1.6, 0, B.wood);
  solid.box(5.4, 0.2, 4.2, 0, 3.3, 0, B.metal);
  solid.box(0.04, 2.1, 1.6, 2.62, 1.05, 0.9, "#3b3d3f");
  solid.box(0.04, 2.1, 1.6, -2.62, 1.05, -0.9, "#3b3d3f");
  const deck = (x0: number, z0: number, x1: number, z1: number) => solid.box(x1 - x0, 0.06, z1 - z0, (x0 + x1) / 2, 0.03, (z0 + z1) / 2, B.deck);
  deck(-8.6, -8.6, -3, 8.6);
  deck(3, -8.6, 8.6, 8.6);
  for (let z = -6; z <= 6; z += 1.1) solid.box(5.4, 0.12, 0.12, -5.8, 2.7, z, B.metal);
  for (const z of [-6.2, 6.2]) for (const x of [-8.3, -3.3]) solid.box(0.14, 2.7, 0.14, x, 1.35, z, B.metal);
  const items: { k: "lounger" | "planter" | "plant" | "dining" | "counter" | "sofa" | "coffee"; x: number; z: number; r?: number; len?: number }[] = [
    { k: "lounger", x: -7.4, z: -3, r: 270 },
    { k: "lounger", x: -7.4, z: -1.6, r: 270 },
    { k: "lounger", x: -7.4, z: -0.2, r: 270 },
    { k: "lounger", x: -7.4, z: 1.2, r: 270 },
    { k: "sofa", x: -4.6, z: 4.6, r: 270, len: 2.6 },
    { k: "coffee", x: -5.8, z: 4.6 },
    { k: "planter", x: -5.8, z: -7.8, len: 4.6 },
    { k: "planter", x: -5.8, z: 7.8, r: 180, len: 4.6 },
    { k: "counter", x: 7.9, z: -5.2, r: 270, len: 3.2 },
    { k: "dining", x: 5.6, z: -2.6 },
    { k: "dining", x: 5.6, z: 2.4 },
    { k: "planter", x: 5.8, z: 7.8, r: 180, len: 4.6 },
    { k: "plant", x: 3.6, z: -7.9 },
    { k: "plant", x: 8, z: 6.2 },
  ];
  items.forEach((f, i) => furnish(solid, glass, f, i, 0.06));
  const edges: [axis: "x" | "z", c: number, a: number, b: number][] = [
    ["x", -HALF, -HALF, HALF],
    ["x", HALF, -HALF, HALF],
    ["z", -HALF, -HALF, -2.6],
    ["z", -HALF, 2.6, HALF],
    ["z", HALF, -HALF, -2.6],
    ["z", HALF, 2.6, HALF],
    ["x", -2.6, -HALF, -2],
    ["x", 2.6, -HALF, -2],
    ["x", -2.6, 2, HALF],
    ["x", 2.6, 2, HALF],
  ];
  for (const [axis, c, a, b] of edges) {
    wallBox(solid, axis, c, a, b, 0.25, 0, 0.35, B.concrete);
    railing(solid, glass, axis, c, a, b, 0.35);
  }
  return { solid: solid.merge(), glass: glass.merge(), edges };
}
