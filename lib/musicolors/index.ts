'use client';

let colors: any;
let audio: any;
let timebytime: any;

console.log('Loading musicolors modules...');

// Only import on client side
if (typeof window !== 'undefined') {
  console.log('Client-side environment detected');
  try {
    colors = require('./js/colors.js');
    audio = require('./js/audio.js');
    timebytime = require('./js/timebytime.js');
    console.log('Modules loaded successfully');
  } catch (err) {
    console.error('Error loading modules:', err);
  }
}

export const init = async (audioFile?: string) => {
  console.log('Init called with args:', audioFile);
  const audioInitialized = await audio?.initAudio?.(audioFile);
  if (!audioInitialized) {
    console.error('Failed to initialize audio');
    return false;
  }
  return colors?.init?.();
};

export const animateTimbre = (...args: any[]) => {
  console.log('AnimateTimbre called with args:', args);
  return colors?.animateTimbre?.(...args);
};

export const cleanup = (...args: any[]) => {
  console.log('Cleanup called with args:', args);
  return colors?.cleanup?.(...args);
};

// Export audio control functions
export const playAudio = async () => {
  return await audio?.playAudio?.();
};

export const pauseAudio = async () => {
  return await audio?.pauseAudio?.();
};

export const stopAudio = () => {
  return audio?.stopAudio?.();
};

// Export other functions as needed
export const {
  render,
  deleteBasics,
  createVanilla,
  applyPitch,
  applyEnergy,
  applyTimbre,
  update
} = colors || {};

export const {
  realpitch,
  realoctave,
  audioContext,
  src,
  analyser,
  energy,
  roughness,
  warmth,
  richness,
  sharpness,
  kurtosis,
  bufferLength,
  dataArray,
  pitchDetector
} = audio || {};

export const {
  updateBackground
} = timebytime || {};

// Export types for TypeScript support
// export type { MusicolorsOptions } from './types';