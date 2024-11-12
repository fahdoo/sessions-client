declare module 'musicolors' {
  interface MusicolorsOptions {
    canvas: HTMLCanvasElement;
    mode?: 'circle' | 'flower' | 'spiral';
    baseColor?: string;
    glowIntensity?: number;
    rotationSpeed?: number;
    particleCount?: number;
    particleSize?: number;
    particleSpeed?: number;
    responsive?: boolean;
    smoothing?: number;
    frequencyRange?: {
      min: number;
      max: number;
    };
  }

  class MusicolorsClass {
    constructor(options: MusicolorsOptions);
    updateAudioData(data: Uint8Array): void;
    setMode(mode: MusicolorsOptions['mode']): void;
    setBaseColor(color: string): void;
    setGlowIntensity(intensity: number): void;
    setRotationSpeed(speed: number): void;
    setParticleCount(count: number): void;
    setParticleSize(size: number): void;
    setParticleSpeed(speed: number): void;
    destroy(): void;
  }

  const Musicolors: typeof MusicolorsClass;
  export default Musicolors;
} 