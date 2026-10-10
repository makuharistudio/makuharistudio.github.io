/**
 * Minimal ambient types for the vendored three.js r173 browser build.
 * Only the symbols used by the space-theme Earth background are declared.
 */
declare module '*.module.js' {
  export class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    set(x: number, y: number): this;
  }
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    clone(): Vector3;
    normalize(): this;
    multiplyScalar(s: number): this;
    applyMatrix4(m: Matrix4): this;
    applyEuler(euler: Euler): this;
    setFromMatrixPosition(m: Matrix4): this;
    distanceTo(v: Vector3): number;
    length(): number;
    dot(v: Vector3): number;
    cross(v: Vector3): this;
    lerp(v: Vector3, t: number): this;
  }
  export class Euler {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number, order?: string);
  }
  export class Matrix4 {
    makeRotationX(theta: number): this;
    makeRotationY(theta: number): this;
    makeRotationZ(theta: number): this;
    compose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
  }
  export class Quaternion {
    setFromEuler(euler: Euler): this;
  }
  export class MathUtils {
    static degToRad(degrees: number): number;
    static radToDeg(radians: number): number;
    static clamp(value: number, min: number, max: number): number;
    static lerp(x: number, y: number, t: number): number;
  }
  export class Raycaster {
    setFromCamera(coords: Vector2, camera: PerspectiveCamera): void;
    intersectObjects(objects: Object3D[], recursive?: boolean): Array<{ object: Object3D; point: Vector3 }>;
  }
  export class Color {
    r: number;
    g: number;
    b: number;
    constructor(hex?: number);
    setHSL(h: number, s: number, l: number): this;
  }
  export class BufferGeometry {
    setAttribute(name: string, attribute: BufferAttribute): this;
    setFromPoints(points: Vector3[]): this;
    dispose(): void;
  }
  export class BufferAttribute {
    constructor(array: ArrayLike<number>, itemSize: number);
  }
  export class Float32BufferAttribute extends BufferAttribute {
    constructor(array: ArrayLike<number>, itemSize: number);
  }
  export class Texture {
    colorSpace: string;
    dispose(): void;
  }
  export const SRGBColorSpace: string;
  export const LinearSRGBColorSpace: string;
  export const ACESFilmicToneMapping: number;
  export const AdditiveBlending: number;
  export const BackSide: number;
  export class TextureLoader {
    load(url: string): Texture;
  }
  export class Material {
    dispose(): void;
    map?: Texture | null;
    specularMap?: Texture | null;
    bumpMap?: Texture | null;
    alphaMap?: Texture | null;
  }
  export class PointsMaterial extends Material {
    constructor(params?: object);
  }
  export class ShaderMaterial extends Material {
    uniforms: Record<string, { value: unknown }>;
    constructor(params?: object);
  }
  export class MeshBasicMaterial extends Material {
    constructor(params?: object);
  }
  export class MeshPhongMaterial extends Material {
    constructor(params?: object);
  }
  export class MeshStandardMaterial extends Material {
    constructor(params?: object);
  }
  export class LineBasicMaterial extends Material {
    constructor(params?: object);
  }
  export class Object3D {
    rotation: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    position: Vector3;
    scale: { x: number; y: number; z: number; set(x: number, y: number, z: number): void; setScalar(s: number): void };
    up: Vector3;
    parent: Object3D | null;
    children: Object3D[];
    visible: boolean;
    userData: Record<string, unknown>;
    add(...obj: Object3D[]): this;
    remove(...obj: Object3D[]): this;
    traverse(callback: (obj: Object3D) => void): void;
    lookAt(target: Vector3 | number, y?: number, z?: number): void;
    getWorldPosition(target: Vector3): Vector3;
    localToWorld(target: Vector3): Vector3;
    worldToLocal(target: Vector3): Vector3;
    geometry?: BufferGeometry;
    material?: Material | Material[];
  }
  export class Points extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material);
  }
  export class Mesh extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material);
  }
  export class Line extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material);
  }
  export class Group extends Object3D {}
  export class Scene extends Object3D {
    background: unknown;
  }
  export class PerspectiveCamera extends Object3D {
    aspect: number;
    fov: number;
    near: number;
    far: number;
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    updateProjectionMatrix(): void;
  }
  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    toneMapping: number;
    outputColorSpace: string;
    constructor(params?: object);
    setSize(width: number, height: number): void;
    setPixelRatio(ratio: number): void;
    setClearColor(color: number | string, alpha?: number): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
    forceContextLoss(): void;
  }
  export class PointLight extends Object3D {
    decay: number;
    intensity: number;
    constructor(color?: number, intensity?: number, distance?: number);
  }
  export class AmbientLight extends Object3D {
    constructor(color?: number, intensity?: number);
  }
  export class DirectionalLight extends Object3D {
    intensity: number;
    target: Object3D;
    constructor(color?: number, intensity?: number);
  }
  export class SphereGeometry extends BufferGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number);
  }
  export class IcosahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }
  export class CylinderGeometry extends BufferGeometry {
    constructor(radiusTop?: number, radiusBottom?: number, height?: number, radialSegments?: number);
  }
  export class ConeGeometry extends BufferGeometry {
    constructor(radius?: number, height?: number, radialSegments?: number);
  }
  export class BoxGeometry extends BufferGeometry {
    constructor(width?: number, height?: number, depth?: number);
  }
  export class RingGeometry extends BufferGeometry {
    constructor(innerRadius?: number, outerRadius?: number, thetaSegments?: number);
  }
  export class Clock {
    getDelta(): number;
    getElapsedTime(): number;
  }
  export const DoubleSide: number;
}
