import * as THREE from "three";

import type { TypeFilter } from "../units";

export const HERO_AZ = 0.42;

export const stage = {
  camAz: HERO_AZ,
  azTarget: HERO_AZ,
  look: 0,
  touched: -100,
  drawer: new THREE.Vector3(),
  hoverFloor: null as number | null,
  hoverUnit: null as string | null,
};

export type SceneView = {
  mode: "intro" | "explore";
  floor: number | null;
  unit: string | null;
  vista: boolean;
  filter: TypeFilter;
  onlyAvailable: boolean;
};

export type Insets = { left: number; right: number; top: number; bottom: number };

export const STATUS_COLOR = {
  disponible: "#3fbf75",
  reservado: "#e8a93c",
  vendido: "#8e8a83",
} as const;

export const fill = { value: 0 };

function interiorMaterial() {
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0 });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFill = fill;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uFill;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * uFill;");
  };
  return material;
}

export const MAT = {
  solid: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, metalness: 0 }),
  interior: interiorMaterial(),
  railGlass: new THREE.MeshStandardMaterial({ color: "#d3e5ec", transparent: true, opacity: 0.26, roughness: 0.05, metalness: 0.25, depthWrite: false }),
  innerGlass: new THREE.MeshStandardMaterial({ color: "#d3e5ec", transparent: true, opacity: 0.34, roughness: 0.05, depthWrite: false }),
  lobby: new THREE.MeshStandardMaterial({ color: "#7f9099", metalness: 0.85, roughness: 0.14, emissive: "#ffc98c", emissiveIntensity: 0 }),
  led: new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }),
};
