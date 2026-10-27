import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

import { PLANS, planBounds, rectCenter, roomArea } from "../plans";
import { FLOORS, TOP_FLOOR, TYPOLOGIES, matches, unitsOnFloor, type Unit } from "../units";
import { decimal } from "../finance";
import { env } from "./env";
import { MAT, STATUS_COLOR, fill, stage, type SceneView } from "./state";
import { labelTexture, signTexture } from "./textures";
import { DRAWER, ROOF_Y, coreDollhouse, dollhouse, floorBase, floorGeometry, groundFloorGeometry, roofGeometry, unitOverlay } from "./tower";

type Handlers = { onFloor: (floor: number) => void; onUnit: (id: string) => void };

const WARM = new THREE.Color("#ffc78a");
const COOL = new THREE.Color("#fff1dc");
const GREY = new THREE.Color("#5f5d58");
const BASE = new THREE.Color("#8ea3ad");
const MUTED = new THREE.Color("#6d7173");
const statusColors = Object.fromEntries(Object.entries(STATUS_COLOR).map(([k, v]) => [k, new THREE.Color(v)])) as Record<Unit["status"], THREE.Color>;

const clicked = (e: ThreeEvent<MouseEvent>) => e.delta < 8;

function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

function Floor({ floor, view, onFloor, onUnit }: { floor: number; view: SceneView } & Handlers) {
  const geo = useMemo(() => floorGeometry(floor), [floor]);
  const units = useMemo(() => unitsOnFloor(floor), [floor]);
  const group = useRef<THREE.Group>(null);
  const offset = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const open = view.floor === floor && !view.vista;
  const materials = useMemo(
    () => units.map(() => new THREE.MeshStandardMaterial({ color: BASE.clone(), metalness: 0.88, roughness: 0.1, emissive: new THREE.Color(0, 0, 0) })),
    [units],
  );
  const lit = useMemo(() => units.map((u) => (hash(Number(u.id)) < 0.78 ? 0.55 + hash(Number(u.id) + 3) * 0.9 : 0.05)), [units]);

  useEffect(() => {
    if (open) {
      target.current.set(Math.cos(stage.camAz), 0, Math.sin(stage.camAz)).multiplyScalar(DRAWER);
      stage.drawer.copy(target.current);
    } else target.current.set(0, 0, 0);
  }, [open]);

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 3.2);
    offset.current.lerp(target.current, k);
    group.current?.position.set(offset.current.x, floorBase(floor), offset.current.z);
    const exploring = view.mode === "explore" && !view.vista;
    const hovered = stage.hoverFloor === floor;
    units.forEach((unit, i) => {
      const m = materials[i];
      let color = env.night > 0.5 ? WARM : COOL;
      let intensity = env.night * lit[i] * 1.6;
      let base = BASE;
      if (exploring) {
        const match = matches(unit, view.filter, view.onlyAvailable);
        color = match ? statusColors[unit.status] : GREY;
        intensity = match ? (unit.status === "vendido" ? 0.12 : 0.62) + (hovered ? 0.55 : 0) : 0.04;
        base = match ? BASE : MUTED;
      }
      m.emissive.lerp(color, k);
      m.emissiveIntensity += (intensity - m.emissiveIntensity) * k;
      m.color.lerp(base, k);
      m.envMapIntensity = env.envIntensity;
    });
  });

  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    stage.hoverFloor = floor;
    document.body.style.cursor = "pointer";
  };
  const leave = () => {
    if (stage.hoverFloor === floor) stage.hoverFloor = null;
    document.body.style.cursor = "";
  };

  return (
    <group ref={group} position-y={floorBase(floor)}>
      <mesh geometry={geo.slab} material={MAT.solid} castShadow receiveShadow />
      <mesh geometry={geo.railGlass} material={MAT.railGlass} renderOrder={3} />
      <group visible={!open}>
        <mesh geometry={geo.facade} material={MAT.solid} castShadow receiveShadow />
        {geo.units.map((u, i) => (
          <mesh
            key={u.id}
            geometry={u.glass}
            material={materials[i]}
            onPointerOver={enter}
            onPointerOut={leave}
            onClick={(e) => {
              if (!clicked(e)) return;
              e.stopPropagation();
              onFloor(floor);
            }}
          />
        ))}
      </group>
      {open && <Interior floor={floor} view={view} onUnit={onUnit} />}
    </group>
  );
}

function Interior({ floor, view, onUnit }: { floor: number; view: SceneView; onUnit: (id: string) => void }) {
  const units = useMemo(() => unitsOnFloor(floor), [floor]);
  const core = useMemo(() => coreDollhouse(floor === TOP_FLOOR), [floor]);
  useFrame(() => {
    fill.value = env.night * 0.42;
  });
  return (
    <group>
      <mesh geometry={core} material={MAT.interior} castShadow receiveShadow />
      {units.map((unit) => (
        <UnitInterior key={unit.id} unit={unit} view={view} onUnit={onUnit} />
      ))}
    </group>
  );
}

const LABEL_H = 0.026;

function UnitInterior({ unit, view, onUnit }: { unit: Unit; view: SceneView; onUnit: (id: string) => void }) {
  const doll = useMemo(() => dollhouse(unit.plan), [unit.plan]);
  const overlay = useMemo(() => unitOverlay(unit.plan), [unit.plan]);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, depthWrite: false }), []);
  const selected = view.unit === unit.id;
  const anySelected = view.unit !== null;
  const match = matches(unit, view.filter, view.onlyAvailable);
  const [cx, cz] = rectCenter(planBounds(unit.plan));
  const label = useMemo(
    () => labelTexture(unit.id, `${TYPOLOGIES[unit.type].short} · ${unit.area} m²`, STATUS_COLOR[unit.status]),
    [unit],
  );
  const rooms = useMemo(
    () =>
      PLANS[unit.plan].rooms
        .filter((r) => roomArea(r) > 4.5 && r.kind !== "circ")
        .map((room) => {
          const biggest = [...room.rects].sort((a, b) => (b[2] - b[0]) * (b[3] - b[1]) - (a[2] - a[0]) * (a[3] - a[1]))[0];
          const [x, z] = rectCenter(biggest);
          return { x, z, label: labelTexture(room.name, `${decimal(roomArea(room))} m²`, undefined, "dark") };
        }),
    [unit.plan],
  );

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 5);
    let color: THREE.Color | string = "#ffffff";
    let opacity = 0;
    if (!selected) {
      if (anySelected) {
        color = "#f4f1ea";
        opacity = 0.62;
      } else if (!match) {
        color = "#9a978f";
        opacity = 0.55;
      } else {
        color = STATUS_COLOR[unit.status];
        opacity = stage.hoverUnit === unit.id ? 0.48 : 0.3;
      }
    }
    material.color.lerp(new THREE.Color(color), k);
    material.opacity += (opacity - material.opacity) * k;
  });

  return (
    <group>
      <mesh geometry={doll.solid} material={MAT.interior} castShadow receiveShadow />
      <mesh geometry={doll.glass} material={MAT.innerGlass} renderOrder={3} />
      <mesh
        geometry={overlay}
        material={material}
        renderOrder={2}
        onPointerOver={(e) => {
          e.stopPropagation();
          stage.hoverUnit = unit.id;
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          if (stage.hoverUnit === unit.id) stage.hoverUnit = null;
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          if (!clicked(e)) return;
          e.stopPropagation();
          onUnit(unit.id);
        }}
      />
      {!anySelected && (
        <sprite position={[cx, 2.6, cz]} scale={[LABEL_H * label.aspect, LABEL_H, 1]} renderOrder={10}>
          <spriteMaterial map={label.texture} sizeAttenuation={false} depthTest={false} transparent />
        </sprite>
      )}
      {selected &&
        rooms.map((r, i) => (
          <sprite key={i} position={[r.x, 1.6, r.z]} scale={[LABEL_H * 0.72 * r.label.aspect, LABEL_H * 0.72, 1]} renderOrder={10}>
            <spriteMaterial map={r.label.texture} sizeAttenuation={false} depthTest={false} transparent />
          </sprite>
        ))}
    </group>
  );
}

function GroundFloor() {
  const geo = useMemo(groundFloorGeometry, []);
  const sign = useMemo(() => signTexture("NIMBO"), []);
  const signMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    MAT.lobby.emissiveIntensity = 0.08 + env.night * 0.9;
    MAT.lobby.envMapIntensity = env.envIntensity;
    signMat.current?.color.setScalar(0.85 + env.night * 1.4);
  });
  return (
    <group>
      <mesh geometry={geo.solid} material={MAT.solid} castShadow receiveShadow />
      <mesh geometry={geo.glass} material={MAT.lobby} />
      <mesh position={[12.62, 3.72, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[5.2, 0.98]} />
        <meshBasicMaterial ref={signMat} map={sign} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Roof() {
  const geo = useMemo(roofGeometry, []);
  const led = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const points: number[] = [];
    for (const [axis, c, a, b] of geo.edges) {
      if (axis === "x") points.push(c, 1.47, a, c, 1.47, b);
      else points.push(a, 1.47, c, b, 1.47, c);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return g;
  }, [geo]);
  const ledMat = useRef<THREE.LineBasicMaterial>(null);
  useFrame(() => {
    ledMat.current?.color.setRGB(env.night * 2.4, env.night * 2.0, env.night * 1.5);
  });
  return (
    <group position-y={ROOF_Y}>
      <mesh geometry={geo.solid} material={MAT.solid} castShadow receiveShadow />
      <mesh geometry={geo.glass} material={MAT.railGlass} renderOrder={3} />
      <lineSegments geometry={led}>
        <lineBasicMaterial ref={ledMat} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

export function Tower({ view, onFloor, onUnit }: { view: SceneView } & Handlers) {
  return (
    <group>
      <GroundFloor />
      {FLOORS.map((floor) => (
        <Floor key={floor} floor={floor} view={view} onFloor={onFloor} onUnit={onUnit} />
      ))}
      <Roof />
    </group>
  );
}
