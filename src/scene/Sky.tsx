import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { env } from "./env";
import { cloudTexture } from "./textures";

const SKY_VERTEX = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

const SKY_FRAGMENT = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uHorizon;
uniform vec3 uGlow;
uniform vec3 uSunDir;
uniform float uGlowStrength;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float e = d.y;
  vec3 col = mix(uHorizon, uMid, smoothstep(-0.03, 0.24, e));
  col = mix(col, uTop, smoothstep(0.2, 0.9, e));
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  col += uGlow * (pow(s, 5.0) * 0.4 * uGlowStrength + pow(s, 60.0) * 0.45 + smoothstep(0.99935, 0.99965, s) * 1.8);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

function SkyDome() {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({
      uTop: { value: env.skyTop },
      uMid: { value: env.skyMid },
      uHorizon: { value: env.skyHorizon },
      uGlow: { value: env.sunGlow },
      uSunDir: { value: env.sunDir },
      uGlowStrength: { value: env.glow },
    }),
    [],
  );
  useFrame(({ camera }) => {
    mesh.current?.position.copy(camera.position);
    uniforms.uGlowStrength.value = env.glow;
  });
  return (
    <mesh ref={mesh} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[1000, 48, 24]} />
      <shaderMaterial vertexShader={SKY_VERTEX} fragmentShader={SKY_FRAGMENT} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
}

function Stars() {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const geometry = useMemo(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < count; i++) {
      const y = 0.06 + rand() * 0.94;
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - y * y);
      positions.set([Math.cos(a) * r * 900, y * 900, Math.sin(a) * r * 900], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);
  useFrame(({ camera }) => {
    points.current?.position.copy(camera.position);
    if (material.current) {
      material.current.opacity = env.stars * 0.9;
      if (points.current) points.current.visible = env.stars > 0.02;
    }
  });
  return (
    <points ref={points} geometry={geometry} renderOrder={-9} frustumCulled={false}>
      <pointsMaterial ref={material} size={1.6} sizeAttenuation={false} color="#dfe7ff" transparent depthWrite={false} fog={false} />
    </points>
  );
}

const TAU = Math.PI * 2;
const PICHINCHA = Math.PI - 0.36;

function wave(b: number) {
  return Math.sin(b * 37) * 45 + Math.sin(b * 91 + 1.3) * 24 + Math.sin(b * 173 + 2.1) * 11 + Math.sin(b * 311 + 0.7) * 5;
}

const gauss = (b: number, center: number, width: number) => Math.exp(-(((b - center) / width) ** 2));

function ridge(radius: number, from: number, to: number, steps: number, height: (b: number) => number, base = -60) {
  const positions: number[] = [];
  const colors: number[] = [];
  const index: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const b = from + ((to - from) * i) / steps;
    const r = radius * (1 + Math.sin(b * 23) * 0.015);
    const x = Math.cos(b) * r;
    const z = -Math.sin(b) * r;
    positions.push(x, base, z, x, height(b), z);
    colors.push(0.62, 0.62, 0.62, 1, 1, 1);
    if (i < steps) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setIndex(index);
  return g;
}

type Volcano = { b: number; height: number; width: number; snow: number };

const VOLCANOES: Volcano[] = [
  { b: -1.48, height: 760, width: 0.075, snow: 0.6 },
  { b: -0.72, height: 640, width: 0.09, snow: 0.55 },
  { b: 0.42, height: 680, width: 0.12, snow: 0.58 },
];

function volcanoes(radius: number) {
  const rock: THREE.BufferGeometry[] = [];
  const snow: THREE.BufferGeometry[] = [];
  for (const v of VOLCANOES) {
    const profile = (b: number) => {
      const t = Math.max(0, 1 - Math.abs(b - v.b) / v.width);
      return v.height * Math.pow(t, 1.25) * (1 + Math.sin(b * 410) * 0.02) + 40;
    };
    const line = v.height * v.snow;
    rock.push(ridge(radius, v.b - v.width, v.b + v.width, 90, (b) => Math.min(profile(b), line + Math.sin(b * 260) * 18)));
    const cap = ridge(radius * 0.999, v.b - v.width, v.b + v.width, 90, profile, 0);
    const pos = cap.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i += 2) {
      const top = pos.getY(i + 1);
      pos.setY(i, Math.min(top, line + Math.sin(i * 0.9) * 14));
    }
    snow.push(cap);
  }
  return { rock, snow };
}

function Mountains() {
  const near = useRef<THREE.MeshBasicMaterial>(null);
  const far = useRef<THREE.MeshBasicMaterial>(null);
  const peaks = useMemo(() => new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false }), []);
  const snowMat = useMemo(() => new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, fog: false }), []);
  const { pichincha, ring, rock, snow } = useMemo(() => {
    const pichincha = ridge(
      9000,
      PICHINCHA - 0.95,
      PICHINCHA + 0.85,
      420,
      (b) =>
        220 +
        1260 * gauss(b, PICHINCHA, 0.2) +
        360 * gauss(b, PICHINCHA + 0.17, 0.07) +
        150 * gauss(b, PICHINCHA - 0.3, 0.1) +
        wave(b) * (0.45 + gauss(b, PICHINCHA, 0.25)),
    );
    const ring = ridge(12500, 0, TAU, 720, (b) => 230 + 150 * Math.sin(b * 3 + 0.4) + 100 * Math.sin(b * 7 + 2) + 300 * gauss(b, -0.35, 0.12) + wave(b) * 0.7);
    const { rock, snow } = volcanoes(17000);
    return { pichincha, ring, rock, snow };
  }, []);
  useFrame(() => {
    near.current?.color.copy(env.ridgeNear);
    far.current?.color.copy(env.ridgeFar).lerp(env.ridgeNear, 0.35);
    peaks.color.copy(env.ridgeFar).lerp(env.skyHorizon, 0.4);
    snowMat.color.copy(env.snow).lerp(env.skyHorizon, 0.22);
  });
  return (
    <group>
      <mesh geometry={pichincha} renderOrder={-6}>
        <meshBasicMaterial ref={near} vertexColors side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={ring} renderOrder={-7}>
        <meshBasicMaterial ref={far} vertexColors side={THREE.DoubleSide} />
      </mesh>
      {rock.map((g, i) => (
        <mesh key={`r${i}`} geometry={g} material={peaks} renderOrder={-8} />
      ))}
      {snow.map((g, i) => (
        <mesh key={`s${i}`} geometry={g} material={snowMat} renderOrder={-8} />
      ))}
    </group>
  );
}

const CLOUDS: [number, number, number, number][] = [
  [PICHINCHA + 0.12, 5600, 1500, 2400],
  [PICHINCHA - 0.2, 6100, 1750, 2600],
  [PICHINCHA + 0.34, 6900, 1300, 2000],
  [PICHINCHA - 0.45, 7600, 1500, 2300],
  [PICHINCHA + 0.6, 7800, 1650, 2500],
  [PICHINCHA + 0.02, 7200, 2150, 2900],
  [-0.4, 9000, 1350, 2600],
  [0.6, 9500, 1500, 2700],
  [1.4, 8700, 1600, 2400],
  [-1.2, 9200, 1400, 2800],
  [2.1, 8800, 1700, 2600],
];

function Clouds() {
  const texture = useMemo(() => cloudTexture(), []);
  const materials = useRef<(THREE.SpriteMaterial | null)[]>([]);
  useFrame(() => {
    for (const m of materials.current) {
      if (!m) continue;
      m.color.copy(env.cloud);
      m.opacity = env.cloudOpacity;
    }
  });
  return (
    <group>
      {CLOUDS.map(([b, r, y, s], i) => (
        <sprite key={i} position={[Math.cos(b) * r, y, -Math.sin(b) * r]} scale={[s * 1.9, s * 0.62, 1]} renderOrder={-5}>
          <spriteMaterial ref={(m) => void (materials.current[i] = m)} map={texture} transparent depthWrite={false} fog />
        </sprite>
      ))}
    </group>
  );
}

function CityLights() {
  const material = useRef<THREE.PointsMaterial>(null);
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    let seed = 99;
    const rand = () => ((seed = (seed * 48271) % 2147483647) - 1) / 2147483646;
    const warm = new THREE.Color("#ffad55");
    const white = new THREE.Color("#fff0d2");
    const push = (x: number, y: number, z: number) => {
      positions.push(x, y, z);
      const c = rand() < 0.72 ? warm : white;
      const k = 0.55 + rand() * 0.6;
      colors.push(c.r * k, c.g * k, c.b * k);
    };
    for (let i = 0; i < 9000; i++) {
      const x = (rand() * 2 - 1) * (rand() < 0.75 ? 4200 : 5600);
      const z = (rand() * 2 - 1) * 15000;
      if (Math.hypot(x, z) < 1450) continue;
      if (x > 2600 && rand() < 0.55) continue;
      push(x, 2 + rand() * 6, z);
    }
    for (let i = 0; i < 2600; i++) {
      const b = PICHINCHA + (rand() * 2 - 1) * 0.75;
      const t = rand();
      const r = 4700 + t * 1350;
      push(Math.cos(b) * r, 20 + t * t * 520, -Math.sin(b) * r);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, []);
  useFrame(() => {
    if (material.current) material.current.opacity = Math.min(1, env.night * 1.15);
    if (points.current) points.current.visible = env.night > 0.03;
  });
  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial ref={material} size={2.2} sizeAttenuation={false} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export function Sky() {
  return (
    <>
      <SkyDome />
      <Stars />
      <Mountains />
      <Clouds />
      <CityLights />
    </>
  );
}
