export type Rect = readonly [x0: number, z0: number, x1: number, z1: number];
export type Seg = readonly [axis: "x" | "z", c: number, a: number, b: number];

export type RoomKind = "social" | "cocina" | "dorm" | "bano" | "circ" | "servicio";
export type FurnKind =
  | "bed"
  | "single"
  | "sofa"
  | "armchair"
  | "coffee"
  | "tv"
  | "dining"
  | "diningSmall"
  | "counter"
  | "island"
  | "wc"
  | "vanity"
  | "shower"
  | "tub"
  | "desk"
  | "wardrobe"
  | "washer"
  | "plant"
  | "console"
  | "rug"
  | "lounger"
  | "planter";
export type Furn = { k: FurnKind; x: number; z: number; r?: number; len?: number };
export type Room = { name: string; kind: RoomKind; rects: readonly Rect[]; furn?: readonly Furn[] };
export type PlanId = "A" | "B" | "C" | "D" | "PH1" | "PH2";

export type Plan = {
  id: PlanId;
  rooms: readonly Room[];
  gaps: readonly Seg[];
  entrance: Seg;
  balconies: readonly Rect[];
  solid: readonly Seg[];
  terrace?: { rect: Rect; furn: readonly Furn[] };
  eye: { x: number; z: number; dir: number };
};

export const PLATE: Rect = [-9, -9, 9, 9];
export const HALF = 9;
export const CORE: Rect = [-2.6, -0.6, 2.6, 2];
export const HALL: readonly Rect[] = [
  [-5, -2, 5, -0.6],
  [-5, -0.6, -2.6, 2],
  [2.6, -0.6, 5, 2],
];
export const PH_LOBBY: Rect = [-2.6, -2, 2.6, -0.6];

const A: Plan = {
  id: "A",
  rooms: [
    { name: "Dormitorio principal", kind: "dorm", rects: [[-9, -9, -5.2, -5]], furn: [{ k: "bed", x: -6.225, z: -7, r: 270 }, { k: "plant", x: -8.55, z: -8.55 }] },
    { name: "Dormitorio 2", kind: "dorm", rects: [[-5.2, -9, -2.2, -5]], furn: [{ k: "single", x: -4.2, z: -7.6, r: 90 }, { k: "desk", x: -2.5, z: -7.8, r: 270 }] },
    {
      name: "Sala y comedor",
      kind: "social",
      rects: [[-2.2, -9, 2, -5]],
      furn: [
        { k: "rug", x: 0.6, z: -7.6 },
        { k: "sofa", x: 1.55, z: -7.6, r: 270 },
        { k: "coffee", x: 0.55, z: -7.6 },
        { k: "tv", x: -2.02, z: -7.6, r: 90 },
        { k: "diningSmall", x: -0.3, z: -5.75 },
        { k: "plant", x: -1.75, z: -8.55 },
      ],
    },
    { name: "Cocina", kind: "cocina", rects: [[-2.2, -5, 0.6, -2]], furn: [{ k: "counter", x: -0.9, z: -2.31, r: 180, len: 2.4 }, { k: "island", x: -0.75, z: -3.75, len: 1.2 }] },
    { name: "Ingreso", kind: "circ", rects: [[0.6, -5, 2, -2]], furn: [{ k: "console", x: 1.82, z: -3.7, r: 270, len: 1 }, { k: "plant", x: 1.62, z: -4.65 }] },
    { name: "Pasillo", kind: "circ", rects: [[-6.8, -5, -2.2, -3.9]] },
    { name: "Baño principal", kind: "bano", rects: [[-9, -5, -6.8, -2]], furn: [{ k: "shower", x: -8.4, z: -2.5, r: 180 }, { k: "wc", x: -8.67, z: -3.7, r: 90 }, { k: "vanity", x: -7.04, z: -4.1, r: 270 }] },
    { name: "Baño 2", kind: "bano", rects: [[-6.8, -3.9, -4.4, -2]], furn: [{ k: "shower", x: -4.85, z: -2.5, r: 180 }, { k: "wc", x: -6, z: -2.33, r: 180 }, { k: "vanity", x: -6.56, z: -3.25, r: 90 }] },
    { name: "Lavandería", kind: "servicio", rects: [[-4.4, -3.9, -2.2, -2]], furn: [{ k: "washer", x: -3, z: -2.3, r: 180 }] },
  ],
  gaps: [
    ["x", -2.2, -4.9, -4],
    ["z", -5, -6.6, -5.8],
    ["z", -5, -4.4, -3.6],
    ["z", -3.9, -6.4, -5.6],
    ["z", -3.9, -3.8, -3],
    ["z", -5, -8.6, -7.8],
    ["z", -5, -2.2, 0.6],
    ["z", -5, 0.6, 2],
    ["x", 0.6, -5, -3.4],
  ],
  entrance: ["z", -2, 0.85, 1.75],
  balconies: [[-1.8, -10.4, 1.6, -9]],
  solid: [],
  eye: { x: -9.6, z: -7, dir: Math.PI },
};

const B: Plan = {
  id: "B",
  rooms: [
    {
      name: "Sala y comedor",
      kind: "social",
      rects: [[2, -9, 5.6, -4.6]],
      furn: [
        { k: "rug", x: 3.4, z: -7.4 },
        { k: "sofa", x: 2.45, z: -7.4, r: 90 },
        { k: "coffee", x: 3.45, z: -7.4 },
        { k: "tv", x: 5.4, z: -7.6, r: 270 },
        { k: "diningSmall", x: 3.5, z: -5.5 },
      ],
    },
    { name: "Dormitorio", kind: "dorm", rects: [[5.6, -9, 9, -4.6]], furn: [{ k: "bed", x: 6.625, z: -7.6, r: 90 }, { k: "plant", x: 8.6, z: -5 }] },
    { name: "Cocina", kind: "cocina", rects: [[2, -4.6, 4.4, -2]], furn: [{ k: "counter", x: 2.31, z: -3.3, r: 90, len: 2 }] },
    { name: "Baño", kind: "bano", rects: [[4.4, -4.6, 6.8, -2]], furn: [{ k: "shower", x: 6.35, z: -2.45, r: 180 }, { k: "wc", x: 5.3, z: -2.33, r: 180 }, { k: "vanity", x: 4.64, z: -3.5, r: 90 }] },
    { name: "Vestidor", kind: "servicio", rects: [[6.8, -4.6, 9, -2]], furn: [{ k: "wardrobe", x: 7.1, z: -3.3, r: 90, len: 1.8 }, { k: "wardrobe", x: 8.2, z: -2.3, r: 180, len: 1.4 }] },
  ],
  gaps: [
    ["z", -4.6, 2, 4.4],
    ["z", -4.6, 4.6, 5.4],
    ["x", 5.6, -6.2, -5.4],
    ["z", -4.6, 7.4, 8.2],
  ],
  entrance: ["z", -2, 3.2, 4.1],
  balconies: [[2.4, -10.2, 5.2, -9]],
  solid: [],
  eye: { x: 9.6, z: -6.8, dir: -0.35 },
};

const C: Plan = {
  id: "C",
  rooms: [
    { name: "Dormitorio 2", kind: "dorm", rects: [[5, -2, 9, 1.4]], furn: [{ k: "single", x: 7.2, z: -1, r: 0 }, { k: "desk", x: 5.3, z: 0.1, r: 90 }] },
    { name: "Pasillo", kind: "circ", rects: [[5, 1.4, 6.2, 2], [4.4, 2, 6.2, 5]] },
    { name: "Baño 2", kind: "bano", rects: [[6.2, 1.4, 9, 3]], furn: [{ k: "shower", x: 8.55, z: 2.2, r: 270 }, { k: "wc", x: 7.4, z: 1.73, r: 0 }, { k: "vanity", x: 7.5, z: 2.76, r: 180 }] },
    { name: "Baño principal", kind: "bano", rects: [[6.2, 3, 9, 4.6]], furn: [{ k: "shower", x: 8.55, z: 3.8, r: 270 }, { k: "wc", x: 7.3, z: 3.33, r: 0 }, { k: "vanity", x: 6.44, z: 3.9, r: 90 }] },
    { name: "Cocina", kind: "cocina", rects: [[2, 2, 4.4, 5]], furn: [{ k: "counter", x: 2.31, z: 3.5, r: 90, len: 2.4 }] },
    {
      name: "Sala y comedor",
      kind: "social",
      rects: [[2, 5, 6.2, 9]],
      furn: [
        { k: "rug", x: 3.4, z: 7.4 },
        { k: "sofa", x: 2.45, z: 7.4, r: 90 },
        { k: "coffee", x: 3.45, z: 7.4 },
        { k: "tv", x: 6.02, z: 7.6, r: 270 },
        { k: "diningSmall", x: 3.8, z: 5.65 },
      ],
    },
    { name: "Dormitorio principal", kind: "dorm", rects: [[6.2, 4.6, 9, 9]], furn: [{ k: "bed", x: 7.225, z: 7.6, r: 90 }] },
  ],
  gaps: [
    ["z", 5, 2, 4.4],
    ["x", 4.4, 2.2, 5],
    ["z", 5, 4.4, 6.2],
    ["z", 1.4, 5.2, 6],
    ["x", 6.2, 2, 2.8],
    ["x", 6.2, 5.4, 6.2],
    ["z", 4.6, 7, 7.8],
  ],
  entrance: ["z", 2, 3, 3.9],
  balconies: [[2.4, 9, 5.8, 10.3]],
  solid: [],
  eye: { x: 4, z: 10.9, dir: Math.PI / 2 },
};

const D: Plan = {
  id: "D",
  rooms: [
    { name: "Dormitorio 3", kind: "dorm", rects: [[-9, -2, -5, 2]], furn: [{ k: "single", x: -7.2, z: -1, r: 0 }, { k: "desk", x: -5.3, z: 0, r: 270 }] },
    { name: "Dormitorio 2", kind: "dorm", rects: [[-9, 2, -6.2, 5.4]], furn: [{ k: "single", x: -7.6, z: 4.4, r: 180 }] },
    { name: "Pasillo", kind: "circ", rects: [[-6.2, 2, -1, 3.2]] },
    { name: "Cocina", kind: "cocina", rects: [[-1, 2, 2, 4.6]], furn: [{ k: "counter", x: 0.6, z: 2.31, r: 0, len: 2.4 }, { k: "counter", x: 1.69, z: 3.5, r: 270, len: 1.6 }] },
    { name: "Baño principal", kind: "bano", rects: [[-6.2, 3.2, -3.6, 5.4]], furn: [{ k: "shower", x: -5.75, z: 3.65, r: 90 }, { k: "wc", x: -4.6, z: 3.53, r: 0 }, { k: "vanity", x: -3.84, z: 4.5, r: 270 }] },
    { name: "Baño 2", kind: "bano", rects: [[-3.6, 3.2, -1, 4.6]], furn: [{ k: "shower", x: -1.45, z: 3.9, r: 270 }, { k: "wc", x: -2.4, z: 4.27, r: 180 }, { k: "vanity", x: -3.36, z: 3.9, r: 90 }] },
    {
      name: "Sala y comedor",
      kind: "social",
      rects: [[-3.6, 4.6, 2, 9]],
      furn: [
        { k: "rug", x: 0.6, z: 7.3 },
        { k: "sofa", x: 1.55, z: 7.3, r: 270 },
        { k: "coffee", x: 0.5, z: 7.3 },
        { k: "tv", x: -3.38, z: 7.6, r: 90 },
        { k: "dining", x: -1.4, z: 5.7 },
        { k: "plant", x: -3.15, z: 8.55 },
      ],
    },
    { name: "Dormitorio principal", kind: "dorm", rects: [[-9, 5.4, -3.6, 9]], furn: [{ k: "bed", x: -7.4, z: 6.43, r: 0 }, { k: "wardrobe", x: -3.9, z: 8, r: 270, len: 1.6 }] },
  ],
  gaps: [
    ["z", 2, -6.05, -5.25],
    ["x", -6.2, 2.2, 3],
    ["x", -1, 2, 3.2],
    ["z", 3.2, -3, -2.2],
    ["z", 4.6, -1, 2],
    ["x", -3.6, 5.8, 6.6],
    ["z", 5.4, -5.4, -4.6],
  ],
  entrance: ["z", 2, -4.4, -3.5],
  balconies: [[-3.2, 9, 1.6, 10.4]],
  solid: [],
  eye: { x: -9.6, z: 7.2, dir: Math.PI - 0.45 },
};

const PH1: Plan = {
  id: "PH1",
  rooms: [
    {
      name: "Sala y comedor",
      kind: "social",
      rects: [[-9, -9, -2.6, -3.6]],
      furn: [
        { k: "rug", x: -4.4, z: -7.2 },
        { k: "sofa", x: -3.1, z: -7.2, r: 270, len: 2.6 },
        { k: "coffee", x: -4.3, z: -7.2 },
        { k: "armchair", x: -5.6, z: -7.2, r: 90 },
        { k: "dining", x: -6.6, z: -5.4, r: 90 },
        { k: "plant", x: -8.5, z: -8.5 },
        { k: "plant", x: -3.05, z: -8.6 },
      ],
    },
    { name: "Cocina", kind: "cocina", rects: [[-9, -3.6, -4.2, -0.6]], furn: [{ k: "counter", x: -6.6, z: -0.91, r: 180, len: 3.6 }, { k: "island", x: -6.6, z: -2.3, len: 2 }] },
    { name: "Ingreso", kind: "circ", rects: [[-4.2, -3.6, -2.6, -0.6]], furn: [{ k: "plant", x: -2.95, z: -3.2 }] },
    { name: "Pasillo", kind: "circ", rects: [[-4.6, -0.6, -2.6, 6.2]], furn: [{ k: "console", x: -2.78, z: 3, r: 270, len: 1.6 }] },
    { name: "Dormitorio 2", kind: "dorm", rects: [[-9, -0.6, -4.6, 2.6], [-9, 2.6, -6.6, 4.6]], furn: [{ k: "bed", x: -7.2, z: 0.43, r: 0 }, { k: "wardrobe", x: -7.8, z: 4.3, r: 180, len: 2.2 }] },
    { name: "Baño 2", kind: "bano", rects: [[-6.6, 2.6, -4.6, 4.6]], furn: [{ k: "shower", x: -6.15, z: 3.05, r: 90 }, { k: "wc", x: -5.9, z: 4.27, r: 180 }, { k: "vanity", x: -5.1, z: 2.84, r: 0 }] },
    { name: "Dormitorio principal", kind: "dorm", rects: [[-9, 4.6, -4.6, 9]], furn: [{ k: "bed", x: -6.8, z: 5.63, r: 0 }, { k: "armchair", x: -8.35, z: 8.3, r: 135 }, { k: "plant", x: -5, z: 8.6 }] },
    { name: "Baño principal", kind: "bano", rects: [[-4.6, 6.2, -2.6, 9]], furn: [{ k: "tub", x: -3.6, z: 8.5, r: 180 }, { k: "wc", x: -3, z: 6.53, r: 0 }, { k: "vanity", x: -2.84, z: 7.5, r: 270 }] },
  ],
  gaps: [
    ["z", -3.6, -9, -4.2],
    ["z", -3.6, -4.2, -2.6],
    ["x", -4.2, -3.6, -0.6],
    ["z", -0.6, -4.2, -2.6],
    ["x", -4.6, 0.4, 1.2],
    ["x", -4.6, 3, 3.8],
    ["x", -4.6, 5, 5.8],
    ["x", -4.6, 7, 7.8],
  ],
  entrance: ["x", -2.6, -1.9, -1],
  balconies: [],
  solid: [["x", -2.6, -0.6, 9]],
  terrace: {
    rect: [-2.6, -9, 2.6, -2],
    furn: [
      { k: "lounger", x: -1.2, z: -7.4, r: 180 },
      { k: "lounger", x: 0.2, z: -7.4, r: 180 },
      { k: "coffee", x: 1.5, z: -6.2 },
      { k: "planter", x: 0, z: -2.35, r: 180, len: 4.6 },
      { k: "plant", x: 2.1, z: -8.5 },
    ],
  },
  eye: { x: -9.6, z: -6.5, dir: Math.PI },
};

const flip = (r: Rect): Rect => [-r[2], -r[3], -r[0], -r[1]];
const flipSeg = ([axis, c, a, b]: Seg): Seg => [axis, -c, -b, -a];
const flipFurn = (f: Furn): Furn => ({ ...f, x: -f.x, z: -f.z, r: ((f.r ?? 0) + 180) % 360 });

const PH2: Plan = {
  id: "PH2",
  rooms: PH1.rooms.map((room) => ({ ...room, rects: room.rects.map(flip), furn: room.furn?.map(flipFurn) })),
  gaps: PH1.gaps.map(flipSeg),
  entrance: ["x", 2.6, -1.8, -0.9],
  balconies: [],
  solid: PH1.solid.map(flipSeg),
  terrace: { rect: flip(PH1.terrace!.rect), furn: PH1.terrace!.furn.map(flipFurn) },
  eye: { x: 9.6, z: 6.5, dir: 0 },
};

export const PLANS: Record<PlanId, Plan> = { A, B, C, D, PH1, PH2 };
export const TYPICAL: readonly PlanId[] = ["A", "B", "C", "D"];
export const PENTHOUSE: readonly PlanId[] = ["PH1", "PH2"];

type Cell = { rect: Rect; owner: string; room: number };

export function floorCells(ph: boolean): Cell[] {
  const cells: Cell[] = [];
  for (const id of ph ? PENTHOUSE : TYPICAL) PLANS[id].rooms.forEach((room, i) => room.rects.forEach((rect) => cells.push({ rect, owner: id, room: i })));
  if (ph) {
    cells.push({ rect: PH_LOBBY, owner: "hall", room: -1 });
    for (const id of PENTHOUSE) cells.push({ rect: PLANS[id].terrace!.rect, owner: `terrace-${id}`, room: -1 });
  } else HALL.forEach((rect) => cells.push({ rect, owner: "hall", room: -1 }));
  cells.push({ rect: CORE, owner: "core", room: -1 });
  return cells;
}

const inside = (r: Rect, x: number, z: number) => x > r[0] && x < r[2] && z > r[1] && z < r[3];
const cellAt = (cells: Cell[], x: number, z: number) => cells.find((c) => inside(c.rect, x, z));

const cellsByKind = { typical: floorCells(false), ph: floorCells(true) };

export const ownerAt = (ph: boolean, x: number, z: number) => cellAt(ph ? cellsByKind.ph : cellsByKind.typical, x, z)?.owner ?? null;

export function outward(id: PlanId, wall: { axis: "x" | "z"; c: number; a: number; b: number }) {
  const m = (wall.a + wall.b) / 2;
  const ph = id.startsWith("PH");
  const plus = wall.axis === "x" ? ownerAt(ph, wall.c + 0.05, m) : ownerAt(ph, m, wall.c + 0.05);
  return plus === id ? -1 : 1;
}

export type WallKind = "interior" | "party" | "facade" | "solid";
export type Wall = { axis: "x" | "z"; c: number; a: number; b: number; kind: WallKind };

function subtract(spans: [number, number][], a: number, b: number) {
  const out: [number, number][] = [];
  for (const [s, e] of spans) {
    if (b <= s || a >= e) out.push([s, e]);
    else {
      if (a > s) out.push([s, a]);
      if (b < e) out.push([b, e]);
    }
  }
  return out;
}

const cache = new Map<PlanId, Wall[]>();

export function planWalls(id: PlanId): Wall[] {
  const hit = cache.get(id);
  if (hit) return hit;
  const plan = PLANS[id];
  const cells = floorCells(id.startsWith("PH"));
  const lines = new Map<string, { axis: "x" | "z"; c: number; points: Set<number> }>();
  const addLine = (axis: "x" | "z", c: number, a: number, b: number) => {
    const key = `${axis}${c.toFixed(3)}`;
    const line = lines.get(key) ?? { axis, c, points: new Set<number>() };
    line.points.add(a).add(b);
    lines.set(key, line);
  };
  for (const { rect } of cells) {
    addLine("z", rect[1], rect[0], rect[2]);
    addLine("z", rect[3], rect[0], rect[2]);
    addLine("x", rect[0], rect[1], rect[3]);
    addLine("x", rect[2], rect[1], rect[3]);
  }
  const eps = 0.02;
  const walls: Wall[] = [];
  for (const { axis, c, points } of lines.values()) {
    const sorted = [...points].sort((p, q) => p - q);
    const classified: { a: number; b: number; kind: WallKind | null }[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      const m = (a + b) / 2;
      const one = axis === "x" ? cellAt(cells, c - eps, m) : cellAt(cells, m, c - eps);
      const two = axis === "x" ? cellAt(cells, c + eps, m) : cellAt(cells, m, c + eps);
      const mineOne = one?.owner === id;
      const mineTwo = two?.owner === id;
      let kind: WallKind | null = null;
      if (mineOne || mineTwo) {
        if (mineOne && mineTwo) kind = one!.room === two!.room ? null : "interior";
        else {
          const other = mineOne ? two : one;
          kind = !other || other.owner.startsWith("terrace") ? "facade" : "party";
        }
      }
      classified.push({ a, b, kind });
    }
    for (const kind of ["interior", "party", "facade"] as const) {
      let spans: [number, number][] = [];
      for (const s of classified) {
        if (s.kind !== kind) continue;
        const last = spans[spans.length - 1];
        if (last && Math.abs(last[1] - s.a) < 1e-6) last[1] = s.b;
        else spans.push([s.a, s.b]);
      }
      for (const [gAxis, gc, ga, gb] of [...plan.gaps, plan.entrance]) {
        if (gAxis === axis && Math.abs(gc - c) < 1e-6) spans = subtract(spans, ga, gb);
      }
      for (const [a, b] of spans) {
        if (b - a < 0.05) continue;
        if (kind === "facade") {
          let glass: [number, number][] = [[a, b]];
          for (const [sAxis, sc, sa, sb] of plan.solid) {
            if (sAxis !== axis || Math.abs(sc - c) > 1e-6) continue;
            const lo = Math.max(a, sa);
            const hi = Math.min(b, sb);
            if (hi > lo) {
              walls.push({ axis, c, a: lo, b: hi, kind: "solid" });
              glass = subtract(glass, lo, hi);
            }
          }
          for (const [ga, gb] of glass) if (gb - ga > 0.05) walls.push({ axis, c, a: ga, b: gb, kind });
        } else walls.push({ axis, c, a, b, kind });
      }
    }
  }
  cache.set(id, walls);
  return walls;
}

export function planBounds(id: PlanId): Rect {
  let x0 = Infinity;
  let z0 = Infinity;
  let x1 = -Infinity;
  let z1 = -Infinity;
  const plan = PLANS[id];
  const rects = [...plan.rooms.flatMap((r) => r.rects), ...plan.balconies, ...(plan.terrace ? [plan.terrace.rect] : [])];
  for (const r of rects) {
    x0 = Math.min(x0, r[0]);
    z0 = Math.min(z0, r[1]);
    x1 = Math.max(x1, r[2]);
    z1 = Math.max(z1, r[3]);
  }
  return [x0, z0, x1, z1];
}

export const roomArea = (room: Room) => room.rects.reduce((sum, r) => sum + (r[2] - r[0]) * (r[3] - r[1]), 0);
export const rectCenter = (r: Rect) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2] as const;
