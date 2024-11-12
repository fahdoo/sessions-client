import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Noise } from 'noisejs';

// Audio Features
export interface AudioFeatures {
  energy: number;
  roughness: number;
  warmth: number;
  richness: number;
  sharpness: number;
  kurtosis: number;
}

// Musicolors Options
export interface MusicolorsOptions {
  canvas: HTMLCanvasElement;
  mode?: 'timbre' | 'pitch' | 'energy';
  baseColor?: string;
  glowIntensity?: number;
  rotationSpeed?: number;
  particleCount?: number;
  particleSize?: number;
  particleSpeed?: number;
  responsive?: boolean;
  smoothing?: number;
}

// Color State Interface
export interface ColorState {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  group: THREE.Group;
  geometry?: THREE.SphereGeometry;
  material?: THREE.ShaderMaterial;
  compoCenter?: THREE.Mesh;
  pointLight?: THREE.PointLight;
  frameRate: number;
  noise: Noise;
}

// Color Options
export interface ColorOptions extends MusicolorsOptions {
  // Add any additional options specific to Colors class
} 