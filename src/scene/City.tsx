import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { env } from "./env";
import { HERO_AZ } from "./state";
import { SHAPES } from "./geometry";
import { AVENUE, BLOCK, GROUND_COLOR, PARK, SITE, siteTexture } from "./textures";

function rand(seed: number) {
  return () => ((seed = (seed * 48271) % 2147483647) - 1) / 2147483646;
}

const TONES = ["#e6e1d6", "#ddd6ca", "#d3cec5", "#e9e6df", "#cec6b9", "#c6c1b9", "#b8b1a5", "#d8d2c8", "#c49a7c", "#b88d72", "#d6c3a8"];
const GLASS_TONES = ["#8e9aa3", "#7f8c96", "#9aa7ae"];

type Box = { x: number; z: number; w: number; d: number; h: number; color: string };

function cityLayout(): Box[] {
  const random = rand(42);
  const out: Box[] = [];
  const h = BLOCK / 2 - 8 - 3;
  for (let i = -15; i <= 15; i++) {
    for (let j = -15; j <= 15; j++) {
      const cx = i * BLOCK;
      const cz = j * BLOCK;
      const dist = Math.hypot(cx, cz);
      if (dist > 1420 || (i === 0 && j === 0)) continue;
      if (cx + h > PARK[0] - 6 && cx - h < PARK[2] + 6 && cz + h > PARK[1] - 6 && cz - h < PARK[3] + 6) continue;
      const lots = random() < 0.35 ? 1 : random() < 0.6 ? 2 : 4;
      const cols = lots === 4 ? 2 : lots === 2 && random() < 0.5 ? 2 : 1;
      const rows = lots / cols;
      for (let a = 0; a < cols; a++) {
        for (let b = 0; b < rows; b++) {
          if (random() < 0.12) continue;
          const lw = (h * 2) / cols;
          const ld = (h * 2) / rows;
          let x0 = cx - h + a * lw;
          let z0 = cz - h + b * ld;
          if (z0 < AVENUE[1] + 4 && z0 + ld > AVENUE[0] - 4 && j > 0) {
            const cut = AVENUE[1] + 4 - z0;
            z0 += cut;
            if (ld - cut < 10) continue;
          }
          const w = (lw - 4) * (0.62 + random() * 0.38);
          const d = (ld - 4) * (0.62 + random() * 0.38);
          x0 += 2 + random() * (lw - 4 - w);
          z0 += 2 + random() * (ld - 4 - d);
          const toward = Math.abs(Math.atan2(cz, cx) - HERO_AZ) < 0.55 && dist < 330;
          const near = (Math.abs(i) <= 1 && Math.abs(j) <= 1) || toward;
          const tower = !near && (dist < 560 ? random() < 0.38 : random() < 0.08);
          const height = toward ? 5 + random() * 4 : near ? 7 + random() * 8 : tower ? 30 + random() * (dist < 420 ? 34 : 22) : dist < 700 ? 10 + random() * 16 : 7 + random() * 14;
          const glass = tower && random() < 0.4;
          out.push({ x: x0 + w / 2, z: z0 + d / 2, w, d, h: height, color: glass ? GLASS_TONES[Math.floor(random() * 3)] : TONES[Math.floor(random() * TONES.length)] });
        }
      }
    }
  }
  const far = rand(77);
  for (let n = 0; n < 900; n++) {
    const a = far() * Math.PI * 2;
    const r = 1500 + Math.pow(far(), 0.7) * 2600;
    const x = Math.cos(a) * r * 1.15;
    const z = Math.sin(a) * r * 1.6;
    if (x < -4300) continue;
    const s = 28 + far() * 60;
    out.push({ x, z, w: s, d: s * (0.5 + far()), h: 6 + far() * (far() < 0.1 ? 40 : 16), color: TONES[Math.floor(far() * TONES.length)] });
  }
  return out;
}

const windowUniforms = { uNight: { value: 0 } };

function windowMaterial() {
  const material = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0.02 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uNight = windowUniforms.uNight;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vCityPos;\nvarying vec3 vCityNormal;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vec4 cityWorld = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
cityWorld = instanceMatrix * cityWorld;
vCityNormal = normalize(mat3(instanceMatrix) * objectNormal);
#else
vCityNormal = objectNormal;
#endif
vCityPos = (modelMatrix * cityWorld).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uNight;\nvarying vec3 vCityPos;\nvarying vec3 vCityNormal;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
float citySide = step(abs(vCityNormal.y), 0.5);
vec2 cityCell = vec2((abs(vCityNormal.x) > 0.5 ? vCityPos.z : vCityPos.x) / 2.7, vCityPos.y / 3.1);
vec2 cityF = fract(cityCell);
float cityWin = step(0.16, cityF.x) * step(cityF.x, 0.84) * step(0.22, cityF.y) * step(cityF.y, 0.8) * citySide * step(3.0, vCityPos.y);
float cityHash = fract(sin(dot(floor(cityCell) + floor(vCityPos.xz / 31.0) * 7.0, vec2(12.9898, 78.233))) * 43758.5453);
diffuseColor.rgb *= 1.0 - cityWin * 0.28;
totalEmissiveRadiance += cityWin * step(0.5, cityHash) * uNight * mix(vec3(1.0, 0.68, 0.38), vec3(1.0, 0.9, 0.78), step(0.82, cityHash)) * (0.9 + cityHash);`,
      );
  };
  return material;
}

function Buildings() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const boxes = useMemo(cityLayout, []);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), []);
  const material = useMemo(windowMaterial, []);
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    boxes.forEach((b, i) => {
      matrix.makeScale(b.w, b.h, b.d).setPosition(b.x, 0, b.z);
      m.setMatrixAt(i, matrix);
      m.setColorAt(i, color.set(b.color));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [boxes]);
  useFrame(() => {
    windowUniforms.uNight.value = env.night;
  });
  return <instancedMesh ref={mesh} args={[geometry, material, boxes.length]} receiveShadow />;
}

type Tree = { x: number; z: number; s: number };

function treeLayout(): Tree[] {
  const random = rand(9);
  const out: Tree[] = [];
  const [px0, pz0, px1, pz1] = PARK;
  for (let n = 0; n < 900 && out.length < 560; n++) {
    const x = px0 + 8 + random() * (px1 - px0 - 16);
    const z = pz0 + 10 + random() * (pz1 - pz0 - 16);
    if (((x - 120) / 54) ** 2 + ((z - 250) / 36) ** 2 < 1) continue;
    if (x > -196 && x < -104 && z > 294 && z < 356) continue;
    out.push({ x, z, s: 0.8 + random() * 0.7 });
  }
  for (let x = -700; x <= 700; x += 13) out.push({ x: x + random() * 3, z: (AVENUE[0] + AVENUE[1]) / 2, s: 0.75 + random() * 0.25 });
  const plaza: [number, number][] = [[-30, 30], [-22, 30], [22, 30], [30, 30], [-34, -34], [-26, -36], [34, -34], [26, -36], [-36, -6], [-36, 8], [36, -14], [-36, 20]];
  for (const [x, z] of plaza) out.push({ x, z, s: 0.85 });
  for (let k = -6; k <= 6; k++) {
    for (const side of [-1, 1]) {
      out.push({ x: k * BLOCK + 22 * side, z: -BLOCK / 2 + 4, s: 0.7 + random() * 0.3 });
      if (random() < 0.6) out.push({ x: BLOCK / 2 - 4 + (k % 2) * BLOCK * 2, z: k * BLOCK + 20 * side, s: 0.7 + random() * 0.3 });
    }
  }
  return out;
}

function Trees() {
  const crowns = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const trees = useMemo(treeLayout, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const color = new THREE.Color();
    const greens = ["#5c7a45", "#4f6d3d", "#6b8550", "#59744a"];
    trees.forEach((t, i) => {
      m.makeScale(2.6 * t.s, 3 * t.s, 2.6 * t.s).setPosition(t.x, 4.6 * t.s, t.z);
      crowns.current?.setMatrixAt(i, m);
      crowns.current?.setColorAt(i, color.set(greens[i % greens.length]));
      m.makeScale(0.22 * t.s, 3.6 * t.s, 0.22 * t.s).setPosition(t.x, 1.8 * t.s, t.z);
      trunks.current?.setMatrixAt(i, m);
    });
    for (const mesh of [crowns.current, trunks.current]) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [trees]);
  return (
    <>
      <instancedMesh ref={crowns} args={[SHAPES.blob, undefined, trees.length]} castShadow>
        <meshStandardMaterial roughness={0.95} flatShading />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[SHAPES.cylinder, undefined, trees.length]}>
        <meshStandardMaterial color="#5e4632" roughness={1} />
      </instancedMesh>
    </>
  );
}

function lampLayout() {
  const out: [number, number][] = [];
  for (let x = -460; x <= 460; x += 30) {
    out.push([x, AVENUE[0] + 1.5]);
    out.push([x + 15, AVENUE[1] - 1.5]);
  }
  for (let z = -300; z <= 20; z += 28) {
    out.push([BLOCK / 2 - 7, z]);
    out.push([-BLOCK / 2 + 7, z + 14]);
  }
  return out;
}

function Lamps() {
  const poles = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const pools = useRef<THREE.InstancedMesh>(null);
  const headMat = useRef<THREE.MeshBasicMaterial>(null);
  const poolMat = useRef<THREE.MeshBasicMaterial>(null);
  const lamps = useMemo(lampLayout, []);
  const poolTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,200,140,0.9)");
    g.addColorStop(0.5, "rgba(255,180,110,0.25)");
    g.addColorStop(1, "rgba(255,170,100,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const pool = useMemo(() => new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    lamps.forEach(([x, z], i) => {
      poles.current?.setMatrixAt(i, m.makeScale(0.12, 7, 0.12).setPosition(x, 3.5, z));
      heads.current?.setMatrixAt(i, m.makeScale(0.5, 0.18, 0.5).setPosition(x, 7.05, z));
      pools.current?.setMatrixAt(i, m.makeScale(16, 1, 16).setPosition(x, 0.08, z));
    });
    for (const mesh of [poles.current, heads.current, pools.current]) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [lamps]);
  useFrame(() => {
    if (headMat.current) headMat.current.color.setRGB(0.25 + env.night * 2.6, 0.24 + env.night * 1.9, 0.22 + env.night * 1.2);
    if (poolMat.current) poolMat.current.opacity = env.night * 0.85;
    if (pools.current) pools.current.visible = env.night > 0.05;
  });
  return (
    <>
      <instancedMesh ref={poles} args={[SHAPES.cylinder, undefined, lamps.length]}>
        <meshStandardMaterial color="#3a3d40" roughness={0.6} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[SHAPES.cylinder, undefined, lamps.length]}>
        <meshBasicMaterial ref={headMat} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={pools} args={[pool, undefined, lamps.length]} renderOrder={2}>
        <meshBasicMaterial ref={poolMat} map={poolTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
    </>
  );
}

export function City() {
  const site = useMemo(siteTexture, []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.12}>
        <planeGeometry args={[90000, 90000]} />
        <meshStandardMaterial color={GROUND_COLOR} roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[SITE, SITE]} />
        <meshStandardMaterial map={site} roughness={0.95} />
      </mesh>
      <Buildings />
      <Trees />
      <Lamps />
    </group>
  );
}
