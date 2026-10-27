import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode, type BloomEffect } from "postprocessing";
import * as THREE from "three";

import { PLANS, planBounds, rectCenter } from "../plans";
import { UNIT_BY_ID } from "../units";
import { City } from "./City";
import { PRESETS, env, stepEnv, type TimeOfDay } from "./env";
import { Rig, type Shot } from "./Rig";
import { Sky } from "./Sky";
import { HERO_AZ, stage, type Insets, type SceneView } from "./state";
import { Tower } from "./Tower";
import { floorBase } from "./tower";

function TimeDriver({ time }: { time: TimeOfDay }) {
  const scene = useThree((s) => s.scene);
  useMemo(() => {
    scene.fog = new THREE.FogExp2(env.fog.getHex(), env.fogDensity);
  }, [scene]);
  useFrame((_, dt) => {
    stepEnv(time, Math.min(dt, 0.1));
    const fog = scene.fog as THREE.FogExp2;
    fog.color.copy(env.fog);
    fog.density = env.fogDensity;
    scene.environmentIntensity = env.envIntensity;
  });
  return null;
}

function Lights() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  useFrame(() => {
    if (sun.current) {
      sun.current.position.copy(env.sunDir).multiplyScalar(140);
      sun.current.color.copy(env.sunColor);
      sun.current.intensity = env.sunIntensity;
    }
    if (hemi.current) {
      hemi.current.color.copy(env.hemiSky);
      hemi.current.groundColor.copy(env.hemiGround);
      hemi.current.intensity = env.hemiIntensity;
    }
  });
  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight
        ref={sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-52}
        shadow-camera-right={52}
        shadow-camera-top={52}
        shadow-camera-bottom={-52}
        shadow-camera-near={20}
        shadow-camera-far={320}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
      />
    </>
  );
}

const ENV_FRAGMENT = /* glsl */ `
uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uGround; uniform vec3 uSun; uniform vec3 uSunColor;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  vec3 col = d.y > 0.0 ? mix(uHorizon, uTop, smoothstep(0.0, 0.7, d.y)) : mix(uHorizon, uGround, smoothstep(0.0, -0.25, d.y));
  col += uSunColor * pow(max(dot(d, normalize(uSun)), 0.0), 24.0) * 3.0;
  gl_FragColor = vec4(col, 1.0);
}`;

function EnvBackdrop({ time }: { time: TimeOfDay }) {
  const p = PRESETS[time];
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color(p.skyTop) },
      uHorizon: { value: new THREE.Color(p.skyHorizon) },
      uGround: { value: new THREE.Color(p.hemiGround).multiplyScalar(0.6) },
      uSun: { value: new THREE.Vector3(...p.sunDir) },
      uSunColor: { value: new THREE.Color(p.sunColor).multiplyScalar(p.sunIntensity / 3) },
    }),
    [p],
  );
  return (
    <mesh scale={50}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader="varying vec3 vDir; void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"
        fragmentShader={ENV_FRAGMENT}
      />
    </mesh>
  );
}

function Effects({ small }: { small: boolean }) {
  const bloom = useRef<BloomEffect>(null);
  useFrame(() => {
    if (bloom.current) bloom.current.intensity = 0.18 + env.night * 1.0;
  });
  return (
    <EffectComposer multisampling={small ? 0 : 4}>
      <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.82} luminanceSmoothing={0.2} radius={0.72} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <Vignette offset={0.3} darkness={0.42} />
    </EffectComposer>
  );
}

function Ready({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    if (++frames.current === 4) onReady();
  });
  return null;
}

export function shotFor(view: SceneView, compact: boolean): Shot {
  const unit = view.unit ? UNIT_BY_ID.get(view.unit) : undefined;
  if (view.vista && unit) {
    const eye = PLANS[unit.plan].eye;
    return { kind: "eye", position: [eye.x, floorBase(unit.floor) + 1.55, eye.z], dir: eye.dir };
  }
  if (view.mode === "intro") return { kind: "orbit", target: [0, 21, 0], radius: compact ? 21.5 : 26.5, elevation: compact ? 0.12 : 0.06, azimuth: HERO_AZ };
  if (view.floor !== null && unit) {
    const b = planBounds(unit.plan);
    const [x, z] = rectCenter(b);
    return { kind: "orbit", target: [x, floorBase(view.floor) + 0.4, z], radius: Math.hypot(b[2] - b[0], b[3] - b[1]) / 2 + 1, elevation: 1.02, drawer: true };
  }
  if (view.floor !== null) return { kind: "orbit", target: [0, floorBase(view.floor) + 0.4, 0], radius: 13.2, elevation: 0.95, drawer: true };
  return { kind: "orbit", target: [0, 19.5, 0], radius: 26, elevation: 0.3 };
}

type StageProps = {
  view: SceneView;
  time: TimeOfDay;
  insets: Insets;
  onFloor: (floor: number) => void;
  onUnit: (id: string) => void;
  onReady: () => void;
};

export default function Stage({ view, time, insets, onFloor, onUnit, onReady }: StageProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const small = useMemo(() => window.matchMedia("(max-width: 899px)").matches, []);
  const compact = useMemo(() => window.matchMedia("(max-width: 959px)").matches, []);
  const shot = useMemo(() => shotFor(view, compact), [view, compact]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let down: { id: number; x: number; moved: boolean } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      down = { id: e.pointerId, x: e.clientX, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x;
      down.x = e.clientX;
      if (Math.abs(dx) > 0) down.moved = true;
      stage.touched = performance.now() / 1000;
      if (shot.kind === "eye") stage.look = THREE.MathUtils.clamp(stage.look - dx * 0.004, -1.2, 1.2);
      else stage.azTarget -= dx * 0.0062;
    };
    const onUp = () => (down = null);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [shot.kind]);

  return (
    <div className="stage__canvas" ref={wrap}>
      <Canvas
        shadows="percentage"
        dpr={[1, small ? 1.5 : 1.75]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: 30, near: 0.8, far: 90000, position: [120, 30, 60] }}
        frameloop={active ? "always" : "never"}
        onPointerMissed={() => (document.body.style.cursor = "")}
      >
        <TimeDriver time={time} />
        <Lights />
        <Environment key={time} resolution={128} frames={1}>
          <EnvBackdrop time={time} />
        </Environment>
        <Sky />
        <City />
        <Tower view={view} onFloor={onFloor} onUnit={onUnit} />
        <Rig shot={shot} insets={insets} drift={view.mode === "intro"} />
        <Effects small={small} />
        <Ready onReady={onReady} />
      </Canvas>
    </div>
  );
}
