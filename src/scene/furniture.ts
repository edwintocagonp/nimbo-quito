import type { Furn } from "../plans";
import { Local, Parts, SHAPES } from "./geometry";

export const C = {
  linen: "#f3efe7",
  mattress: "#ebe6dc",
  wood: "#9f7652",
  oak: "#c7a57f",
  pale: "#ddc7a6",
  fabric: "#d1c8b8",
  fabricDark: "#8e897e",
  dark: "#2a2c2f",
  white: "#f5f3ee",
  stone: "#bab3a7",
  sage: "#a3b096",
  clay: "#c48a66",
  green: "#5b7c4b",
  greenDark: "#4b6a3f",
  pot: "#b5735a",
  grey: "#8f959a",
};

const THROWS = [C.sage, C.clay, "#9fb3c2", "#c9b27a"];

function chair(l: Local, x: number, z: number, backTo: 0 | 90 | 180 | 270) {
  const back = backTo === 0 ? [0, -0.2] : backTo === 180 ? [0, 0.2] : backTo === 90 ? [-0.2, 0] : [0.2, 0];
  const wide = backTo === 0 || backTo === 180;
  l.box(0.44, 0.46, 0.44, x, 0.23, z, C.pale);
  l.box(wide ? 0.44 : 0.05, 0.42, wide ? 0.05 : 0.44, x + back[0], 0.67, z + back[1], C.wood);
}

export function furnish(parts: Parts, glass: Parts, f: Furn, seed: number, y = 0) {
  const l = new Local(parts, f.x, f.z, f.r ?? 0, y);
  const g = new Local(glass, f.x, f.z, f.r ?? 0, y);
  const len = f.len;
  switch (f.k) {
    case "bed":
    case "single": {
      const w = f.k === "bed" ? 1.6 : 1.05;
      const d = f.k === "bed" ? 2.05 : 2;
      l.box(w + 0.04, 0.3, d, 0, 0.15, 0.025, C.oak);
      l.box(w - 0.06, 0.17, d - 0.1, 0, 0.385, 0.05, C.mattress);
      l.box(w, 0.06, d * 0.5, 0, 0.5, d * 0.24, THROWS[seed % THROWS.length]);
      if (f.k === "bed") {
        l.box(0.6, 0.1, 0.34, -0.36, 0.52, -d / 2 + 0.3, C.white);
        l.box(0.6, 0.1, 0.34, 0.36, 0.52, -d / 2 + 0.3, C.white);
      } else l.box(0.7, 0.1, 0.34, 0, 0.52, -d / 2 + 0.3, C.white);
      l.box(w + 0.2, 0.95, 0.08, 0, 0.475, -d / 2 - 0.02, C.wood);
      const stand = w / 2 + 0.35;
      l.box(0.45, 0.48, 0.4, stand, 0.24, -d / 2 + 0.24, C.wood);
      if (f.k === "bed") l.box(0.45, 0.48, 0.4, -stand, 0.24, -d / 2 + 0.24, C.wood);
      break;
    }
    case "sofa": {
      const w = len ?? 2.2;
      l.box(w, 0.42, 0.9, 0, 0.21, 0, C.fabric);
      l.box(w, 0.4, 0.22, 0, 0.62, -0.34, C.fabric);
      l.box(0.18, 0.58, 0.9, w / 2 - 0.09, 0.29, 0, C.fabricDark);
      l.box(0.18, 0.58, 0.9, -w / 2 + 0.09, 0.29, 0, C.fabricDark);
      l.box(0.42, 0.12, 0.42, -w / 4, 0.5, 0.05, THROWS[(seed + 1) % THROWS.length]);
      break;
    }
    case "armchair":
      l.box(0.86, 0.42, 0.86, 0, 0.21, 0, C.fabricDark);
      l.box(0.86, 0.4, 0.2, 0, 0.62, -0.33, C.fabricDark);
      break;
    case "coffee":
      l.box(1, 0.36, 0.56, 0, 0.18, 0, C.wood);
      break;
    case "rug":
      l.box(2.4, 0.012, 1.7, 0, 0.006, 0, "#d8ccba");
      break;
    case "tv":
      l.box(1.8, 0.45, 0.4, 0, 0.225, 0, C.wood);
      l.box(1.3, 0.74, 0.05, 0, 0.84, -0.1, C.dark);
      break;
    case "dining":
    case "diningSmall": {
      const big = f.k === "dining";
      const w = big ? 1.6 : 1.2;
      const d = big ? 0.9 : 0.8;
      l.box(w, 0.05, d, 0, 0.74, 0, C.oak);
      l.box(w - 0.3, 0.7, 0.1, 0, 0.36, 0, C.wood);
      const xs = big ? [-0.45, 0.45] : [-0.3, 0.3];
      for (const x of xs) {
        chair(l, x, -d / 2 - 0.26, 0);
        chair(l, x, d / 2 + 0.26, 180);
      }
      if (big) {
        chair(l, -w / 2 - 0.3, 0, 90);
        chair(l, w / 2 + 0.3, 0, 270);
      }
      break;
    }
    case "counter": {
      const w = len ?? 2.4;
      l.box(w, 0.88, 0.62, 0, 0.44, 0, C.white);
      l.box(w + 0.02, 0.04, 0.64, 0, 0.9, 0, C.stone);
      l.box(0.56, 0.012, 0.4, -w / 4, 0.926, 0.02, C.grey);
      l.box(0.58, 0.012, 0.5, w / 4, 0.926, 0.02, C.dark);
      break;
    }
    case "island": {
      const w = len ?? 1.2;
      l.box(w, 0.88, 0.8, 0, 0.44, 0, C.wood);
      l.box(w + 0.06, 0.04, 0.86, 0, 0.9, 0, C.stone);
      const n = Math.max(2, Math.round(w / 0.62));
      for (let i = 0; i < n; i++) l.box(0.36, 0.66, 0.36, -w / 2 + (w / n) * (i + 0.5), 0.33, -0.66, C.dark);
      break;
    }
    case "wc":
      l.box(0.38, 0.4, 0.6, 0, 0.2, 0.05, C.white);
      l.box(0.4, 0.75, 0.18, 0, 0.375, -0.22, C.white);
      break;
    case "vanity": {
      const w = len ?? 0.9;
      l.box(w, 0.8, 0.48, 0, 0.4, 0, C.oak);
      l.box(Math.min(0.55, w - 0.2), 0.08, 0.38, 0, 0.84, 0.02, C.white);
      break;
    }
    case "shower":
      l.box(0.9, 0.06, 0.9, 0, 0.03, 0, C.white);
      l.box(0.06, 0.012, 0.06, 0, 0.065, 0, C.grey);
      g.box(0.9, 1.9, 0.02, 0, 0.95, 0.44, "#cfe2ea");
      break;
    case "tub":
      l.box(1.62, 0.56, 0.78, 0, 0.28, 0, C.white);
      l.box(1.4, 0.02, 0.56, 0, 0.555, 0, "#cfe2ea");
      break;
    case "desk":
      l.box(1.2, 0.04, 0.6, 0, 0.74, 0, C.oak);
      l.box(1.1, 0.7, 0.04, 0, 0.36, -0.26, C.wood);
      l.box(0.5, 0.46, 0.5, 0, 0.23, 0.55, C.dark);
      l.box(0.5, 0.42, 0.06, 0, 0.67, 0.78, C.dark);
      l.box(0.35, 0.22, 0.04, -0.25, 0.87, -0.2, C.dark);
      break;
    case "wardrobe": {
      const w = len ?? 1.6;
      l.box(w, 2, 0.6, 0, 1, 0, C.pale);
      for (let i = 1; i < Math.round(w / 0.5); i++) l.box(0.01, 1.9, 0.02, -w / 2 + (w / Math.round(w / 0.5)) * i, 1, 0.3, C.wood);
      break;
    }
    case "washer":
      l.box(0.6, 0.85, 0.6, 0, 0.425, 0, C.white);
      l.box(0.6, 0.85, 0.6, 0, 1.275, 0, C.white);
      l.box(0.34, 0.34, 0.02, 0, 0.45, 0.3, C.grey);
      l.box(0.34, 0.34, 0.02, 0, 1.3, 0.3, C.grey);
      break;
    case "plant":
      l.shape(SHAPES.cylinder, 0, 0.19, 0, C.pot, 0.2, 0.38, 0.2);
      l.shape(SHAPES.blob, 0, 0.78, 0, seed % 2 ? C.green : C.greenDark, 0.4, 0.46, 0.4);
      break;
    case "console": {
      const w = len ?? 1;
      l.box(w, 0.8, 0.35, 0, 0.4, 0, C.wood);
      l.shape(SHAPES.blob, w / 2 - 0.2, 0.95, 0, C.green, 0.16, 0.18, 0.16);
      break;
    }
    case "lounger":
      l.box(0.72, 0.28, 1.9, 0, 0.14, 0, C.wood);
      l.box(0.66, 0.08, 1.3, 0, 0.32, 0.25, C.white);
      l.box(0.66, 0.36, 0.1, 0, 0.46, -0.6, C.white);
      break;
    case "planter": {
      const w = len ?? 2;
      l.box(w, 0.6, 0.5, 0, 0.3, 0, "#d9d4c9");
      l.box(w - 0.12, 0.18, 0.4, 0, 0.66, 0, C.greenDark);
      for (let x = -w / 2 + 0.35; x < w / 2 - 0.2; x += 0.7) l.shape(SHAPES.blob, x, 0.85, 0, C.green, 0.3, 0.32, 0.26);
      break;
    }
  }
}
