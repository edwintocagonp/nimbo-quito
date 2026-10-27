import * as THREE from "three";

export type TimeOfDay = "dia" | "atardecer" | "noche";

type Preset = {
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  sunGlow: string;
  fog: string;
  fogDensity: number;
  sunDir: [number, number, number];
  sunColor: string;
  sunIntensity: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  night: number;
  stars: number;
  ridgeNear: string;
  ridgeFar: string;
  snow: string;
  cloud: string;
  cloudOpacity: number;
  envIntensity: number;
  glow: number;
};

export const PRESETS: Record<TimeOfDay, Preset> = {
  dia: {
    skyTop: "#3f83d0",
    skyMid: "#8cbde6",
    skyHorizon: "#dde9ef",
    sunGlow: "#fff3dc",
    fog: "#c9d8e2",
    fogDensity: 0.000105,
    sunDir: [0.62, 0.72, -0.31],
    sunColor: "#fff2de",
    sunIntensity: 3.1,
    hemiSky: "#cfe3ff",
    hemiGround: "#8c826f",
    hemiIntensity: 1.15,
    night: 0,
    stars: 0,
    ridgeNear: "#6c805f",
    ridgeFar: "#93a7b6",
    snow: "#f5f8fb",
    cloud: "#ffffff",
    cloudOpacity: 0.9,
    envIntensity: 1,
    glow: 0.35,
  },
  atardecer: {
    skyTop: "#1f3268",
    skyMid: "#b5627a",
    skyHorizon: "#ffad66",
    sunGlow: "#ffc779",
    fog: "#c99383",
    fogDensity: 0.00009,
    sunDir: [-0.9, 0.24, 0.36],
    sunColor: "#ffad6b",
    sunIntensity: 2.3,
    hemiSky: "#ffc3a0",
    hemiGround: "#4f4148",
    hemiIntensity: 0.8,
    night: 0.6,
    stars: 0.08,
    ridgeNear: "#3d3049",
    ridgeFar: "#87677f",
    snow: "#ffc6a3",
    cloud: "#ffbf9a",
    cloudOpacity: 0.95,
    envIntensity: 0.8,
    glow: 1,
  },
  noche: {
    skyTop: "#03060d",
    skyMid: "#0a1326",
    skyHorizon: "#1b2a46",
    sunGlow: "#9fb4e8",
    fog: "#18213a",
    fogDensity: 0.0001,
    sunDir: [0.35, 0.74, 0.57],
    sunColor: "#a6bcff",
    sunIntensity: 0.42,
    hemiSky: "#364772",
    hemiGround: "#141219",
    hemiIntensity: 0.38,
    night: 1,
    stars: 1,
    ridgeNear: "#0b1019",
    ridgeFar: "#161e30",
    snow: "#4c5878",
    cloud: "#27324c",
    cloudOpacity: 0.7,
    envIntensity: 0.32,
    glow: 0.25,
  },
};

const color = (hex: string) => new THREE.Color(hex);

export const env = {
  skyTop: color(PRESETS.dia.skyTop),
  skyMid: color(PRESETS.dia.skyMid),
  skyHorizon: color(PRESETS.dia.skyHorizon),
  sunGlow: color(PRESETS.dia.sunGlow),
  fog: color(PRESETS.dia.fog),
  fogDensity: PRESETS.dia.fogDensity,
  sunDir: new THREE.Vector3(...PRESETS.dia.sunDir).normalize(),
  sunColor: color(PRESETS.dia.sunColor),
  sunIntensity: PRESETS.dia.sunIntensity,
  hemiSky: color(PRESETS.dia.hemiSky),
  hemiGround: color(PRESETS.dia.hemiGround),
  hemiIntensity: PRESETS.dia.hemiIntensity,
  night: 0,
  stars: 0,
  ridgeNear: color(PRESETS.dia.ridgeNear),
  ridgeFar: color(PRESETS.dia.ridgeFar),
  snow: color(PRESETS.dia.snow),
  cloud: color(PRESETS.dia.cloud),
  cloudOpacity: PRESETS.dia.cloudOpacity,
  envIntensity: 1,
  glow: PRESETS.dia.glow,
};

const targetDir = new THREE.Vector3();
const scratch = new THREE.Color();

export function jumpEnv(time: TimeOfDay) {
  stepEnv(time, 1000);
}

export function stepEnv(time: TimeOfDay, dt: number) {
  const p = PRESETS[time];
  const k = 1 - Math.exp(-dt * 1.8);
  const mix = (c: THREE.Color, hex: string) => c.lerp(scratch.set(hex), k);
  const num = (a: number, b: number) => a + (b - a) * k;
  mix(env.skyTop, p.skyTop);
  mix(env.skyMid, p.skyMid);
  mix(env.skyHorizon, p.skyHorizon);
  mix(env.sunGlow, p.sunGlow);
  mix(env.fog, p.fog);
  mix(env.sunColor, p.sunColor);
  mix(env.hemiSky, p.hemiSky);
  mix(env.hemiGround, p.hemiGround);
  mix(env.ridgeNear, p.ridgeNear);
  mix(env.ridgeFar, p.ridgeFar);
  mix(env.snow, p.snow);
  mix(env.cloud, p.cloud);
  env.fogDensity = num(env.fogDensity, p.fogDensity);
  env.sunIntensity = num(env.sunIntensity, p.sunIntensity);
  env.hemiIntensity = num(env.hemiIntensity, p.hemiIntensity);
  env.night = num(env.night, p.night);
  env.stars = num(env.stars, p.stars);
  env.cloudOpacity = num(env.cloudOpacity, p.cloudOpacity);
  env.envIntensity = num(env.envIntensity, p.envIntensity);
  env.glow = num(env.glow, p.glow);
  env.sunDir.lerp(targetDir.set(...p.sunDir).normalize(), k).normalize();
}
