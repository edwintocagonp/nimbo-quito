import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const boxCache = new Map<string, THREE.BufferGeometry>();
const matrix = new THREE.Matrix4();
const rotation = new THREE.Matrix4();
const scratch = new THREE.Color();

function unitBox() {
  let g = boxCache.get("box");
  if (!g) {
    g = new THREE.BoxGeometry(1, 1, 1).toNonIndexed();
    boxCache.set("box", g);
  }
  return g;
}

export class Parts {
  private list: THREE.BufferGeometry[] = [];

  add(source: THREE.BufferGeometry, m: THREE.Matrix4, color: THREE.ColorRepresentation, top?: THREE.ColorRepresentation) {
    const g = source.clone().applyMatrix4(m);
    const count = g.getAttribute("position").count;
    const colors = new Float32Array(count * 3);
    scratch.set(color);
    for (let i = 0; i < count; i++) colors.set([scratch.r, scratch.g, scratch.b], i * 3);
    if (top !== undefined && count === 36) {
      scratch.set(top);
      for (let i = 12; i < 18; i++) colors.set([scratch.r, scratch.g, scratch.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.list.push(g);
    return this;
  }

  box(w: number, h: number, d: number, x: number, y: number, z: number, color: THREE.ColorRepresentation, top?: THREE.ColorRepresentation, rotY = 0) {
    matrix.makeRotationY(rotY).setPosition(x, y, z).multiply(new THREE.Matrix4().makeScale(Math.max(w, 1e-4), Math.max(h, 1e-4), Math.max(d, 1e-4)));
    return this.add(unitBox(), matrix, color, top);
  }

  shape(source: THREE.BufferGeometry, x: number, y: number, z: number, color: THREE.ColorRepresentation, sx = 1, sy = 1, sz = 1, rotY = 0) {
    matrix.makeRotationY(rotY).setPosition(x, y, z).multiply(new THREE.Matrix4().makeScale(sx, sy, sz));
    return this.add(source, matrix, color);
  }

  get empty() {
    return this.list.length === 0;
  }

  merge() {
    if (!this.list.length) return new THREE.BufferGeometry();
    const merged = mergeGeometries(this.list, false)!;
    merged.computeBoundingSphere();
    merged.computeBoundingBox();
    return merged;
  }
}

export class Local {
  private cos: number;
  private sin: number;

  constructor(
    private parts: Parts,
    private x: number,
    private z: number,
    degrees: number,
    private y = 0,
  ) {
    const r = THREE.MathUtils.degToRad(degrees);
    this.cos = Math.cos(r);
    this.sin = Math.sin(r);
    rotation.makeRotationY(r);
  }

  private at(lx: number, lz: number): [number, number] {
    return [this.x + lx * this.cos + lz * this.sin, this.z - lx * this.sin + lz * this.cos];
  }

  get angle() {
    return Math.atan2(this.sin, this.cos);
  }

  box(w: number, h: number, d: number, lx: number, ly: number, lz: number, color: THREE.ColorRepresentation, top?: THREE.ColorRepresentation) {
    const [x, z] = this.at(lx, lz);
    this.parts.box(w, h, d, x, this.y + ly, z, color, top, this.angle);
    return this;
  }

  shape(source: THREE.BufferGeometry, lx: number, ly: number, lz: number, color: THREE.ColorRepresentation, sx = 1, sy = 1, sz = 1) {
    const [x, z] = this.at(lx, lz);
    this.parts.shape(source, x, this.y + ly, z, color, sx, sy, sz, this.angle);
    return this;
  }
}

export const SHAPES = {
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 14).toNonIndexed(),
  cone: new THREE.ConeGeometry(1, 1, 10).toNonIndexed(),
  blob: new THREE.IcosahedronGeometry(1, 1),
  sphere: new THREE.SphereGeometry(1, 12, 8).toNonIndexed(),
};

export function wallBox(parts: Parts, axis: "x" | "z", c: number, a: number, b: number, thickness: number, y0: number, y1: number, color: THREE.ColorRepresentation, top?: THREE.ColorRepresentation, extend = 0) {
  const len = b - a + extend * 2;
  const mid = (a + b) / 2;
  const h = y1 - y0;
  if (axis === "z") parts.box(len, h, thickness, mid, y0 + h / 2, c, color, top);
  else parts.box(thickness, h, len, c, y0 + h / 2, mid, color, top);
}
