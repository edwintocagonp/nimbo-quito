import * as THREE from "three";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function rand(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

export function cloudTexture() {
  const [c, ctx] = canvas(512, 192);
  const random = rand(11);
  for (let i = 0; i < 46; i++) {
    const x = 70 + random() * 372;
    const y = 80 + (random() - 0.5) * 60 - Math.sin(((x - 70) / 372) * Math.PI) * 30;
    const r = 26 + random() * 48;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.32)");
    g.addColorStop(0.55, "rgba(255,255,255,0.16)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const SITE = 1600;
export const BLOCK = 96;
export const STREET = 16;
export const PARK: [number, number, number, number] = [-264, 62, 264, 418];
export const AVENUE: [number, number] = [40, 62];
export const GROUND_COLOR = "#a19d92";

export function siteTexture() {
  const size = 2048;
  const [c, ctx] = canvas(size, size);
  const s = size / SITE;
  const X = (x: number) => (x + SITE / 2) * s;
  const Z = (z: number) => (z + SITE / 2) * s;
  const rect = (x0: number, z0: number, x1: number, z1: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(X(x0), Z(z0), (x1 - x0) * s, (z1 - z0) * s);
  };
  const random = rand(5);
  rect(-SITE / 2, -SITE / 2, SITE / 2, SITE / 2, "#6c6b67");
  const tones = ["#b9b3a6", "#b2ada1", "#bdb8ad", "#aea99d", "#c2bcb0"];
  for (let i = -9; i <= 9; i++) {
    for (let j = -9; j <= 9; j++) {
      const cx = i * BLOCK;
      const cz = j * BLOCK;
      const h = (BLOCK - STREET) / 2;
      rect(cx - h - 3, cz - h - 3, cx + h + 3, cz + h + 3, "#cbc6bb");
      rect(cx - h, cz - h, cx + h, cz + h, tones[Math.floor(random() * tones.length)]);
    }
  }
  rect(-SITE / 2, AVENUE[0], SITE / 2, AVENUE[1], "#5f5e5a");
  rect(-SITE / 2, (AVENUE[0] + AVENUE[1]) / 2 - 2, SITE / 2, (AVENUE[0] + AVENUE[1]) / 2 + 2, "#7f9a5d");
  ctx.strokeStyle = "rgba(240,236,226,0.55)";
  ctx.setLineDash([3 * s, 4 * s]);
  ctx.lineWidth = 0.3 * s;
  for (const z of [AVENUE[0] + 5, AVENUE[1] - 5]) {
    ctx.beginPath();
    ctx.moveTo(X(-SITE / 2), Z(z));
    ctx.lineTo(X(SITE / 2), Z(z));
    ctx.stroke();
  }
  ctx.setLineDash([]);
  const [px0, pz0, px1, pz1] = PARK;
  rect(px0 - 4, pz0, px1 + 4, pz1 + 4, "#cbc6bb");
  rect(px0, pz0 + 3, px1, pz1, "#7d9a59");
  for (let i = 0; i < 2600; i++) {
    const x = px0 + random() * (px1 - px0);
    const z = pz0 + random() * (pz1 - pz0);
    ctx.fillStyle = `rgba(${60 + random() * 40},${100 + random() * 40},${50 + random() * 20},0.35)`;
    ctx.beginPath();
    ctx.arc(X(x), Z(z), (2 + random() * 6) * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#d9d2c1";
  ctx.lineCap = "round";
  ctx.lineWidth = 4 * s;
  const path = (points: [number, number][]) => {
    ctx.beginPath();
    points.forEach(([x, z], i) => (i ? ctx.lineTo(X(x), Z(z)) : ctx.moveTo(X(x), Z(z))));
    ctx.stroke();
  };
  path([[px0 + 10, pz0 + 30], [-120, 120], [-20, 160], [90, 140], [px1 - 10, pz0 + 40]]);
  path([[-200, pz1 - 10], [-150, 260], [-40, 230], [60, 300], [200, pz1 - 20]]);
  path([[0, pz0 + 6], [10, 120], [-20, 220], [0, pz1 - 6]]);
  ctx.fillStyle = "#6f9cb0";
  ctx.beginPath();
  ctx.ellipse(X(120), Z(250), 46 * s, 28 * s, 0.3, 0, Math.PI * 2);
  ctx.fill();
  rect(-190, 300, -110, 350, "#8db267");
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 0.6 * s;
  ctx.strokeRect(X(-188), Z(302), 76 * s, 46 * s);
  rect(-44, -44, 44, 40, "#d7d1c4");
  ctx.strokeStyle = "rgba(160,150,135,0.45)";
  ctx.lineWidth = 0.15 * s;
  for (let x = -44; x <= 44; x += 2) {
    ctx.beginPath();
    ctx.moveTo(X(x), Z(-44));
    ctx.lineTo(X(x), Z(40));
    ctx.stroke();
  }
  rect(-40, 26, -14, 36, "#7f9a5d");
  rect(14, 26, 40, 36, "#7f9a5d");
  rect(-40, -40, -20, -30, "#7f9a5d");
  const fade = ctx.createRadialGradient(size / 2, size / 2, size * 0.36, size / 2, size / 2, size * 0.5);
  fade.addColorStop(0, "rgba(161,157,146,0)");
  fade.addColorStop(1, GROUND_COLOR);
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function signTexture(text: string) {
  const [c, ctx] = canvas(1024, 192);
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 128px 'Manrope Variable', Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const letters = text.split("");
  const spacing = 70;
  const start = 512 - ((letters.length - 1) * spacing) / 2;
  letters.forEach((l, i) => ctx.fillText(l, start + i * spacing, 100));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export type Label = { texture: THREE.CanvasTexture; aspect: number };

const labelCache = new Map<string, Label>();

export function labelTexture(title: string, subtitle: string, dot?: string, tone: "light" | "dark" = "light"): Label {
  const key = [title, subtitle, dot, tone].join("|");
  const hit = labelCache.get(key);
  if (hit) return hit;
  const scale = 2;
  const [measure] = canvas(1, 1);
  const m = measure.getContext("2d")!;
  m.font = `700 ${30 * scale}px 'Manrope Variable', Manrope, sans-serif`;
  const tw = m.measureText(title).width;
  m.font = `500 ${21 * scale}px 'Manrope Variable', Manrope, sans-serif`;
  const sw = subtitle ? m.measureText(subtitle).width : 0;
  const pad = 22 * scale;
  const dotSpace = dot ? 26 * scale : 0;
  const w = Math.ceil(Math.max(tw + dotSpace, sw) + pad * 2);
  const h = (subtitle ? 92 : 60) * scale;
  const [c, ctx] = canvas(w, h);
  const r = 18 * scale;
  ctx.fillStyle = tone === "light" ? "rgba(250,248,244,0.94)" : "rgba(22,24,26,0.86)";
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, r);
  ctx.fill();
  ctx.fillStyle = tone === "light" ? "#1d1f1b" : "#f4f1ea";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${30 * scale}px 'Manrope Variable', Manrope, sans-serif`;
  const ty = subtitle ? 32 * scale : h / 2 + scale;
  if (dot) {
    ctx.save();
    ctx.fillStyle = dot;
    ctx.beginPath();
    ctx.arc(pad + 8 * scale, ty, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillText(title, pad + dotSpace, ty);
  if (subtitle) {
    ctx.font = `500 ${21 * scale}px 'Manrope Variable', Manrope, sans-serif`;
    ctx.fillStyle = tone === "light" ? "#5b5d55" : "#c9c6bd";
    ctx.fillText(subtitle, pad, 64 * scale);
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const label = { texture, aspect: w / h };
  labelCache.set(key, label);
  return label;
}
