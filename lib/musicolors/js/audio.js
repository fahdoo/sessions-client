'use client';
import { PitchDetector } from "pitchy";
import * as Meyda from "meyda";
import FrequencyMap from "note-frequency-map";
import { MusicolorsConfig } from '../config';

let audioContext, analyser, microphone, javascriptNode;
let dataArray, bufferLength, perceptualSpread, 
    spectralFlux, perceptualSharpness, spectralFlatness, spectralKurtosis, src;

let energy, roughness, warmth, richness, sharpness, kurtosis;
let realpitch, realoctave;

// Initialize audio context
const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  
  if (!analyser) {
    analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = MusicolorsConfig.audio.smoothingTimeConstant;
    analyser.fftSize = MusicolorsConfig.audio.fftSize;
  }

  if (!javascriptNode) {
    javascriptNode = audioContext.createScriptProcessor(MusicolorsConfig.audio.bufferSize, 1, 1);
  }

  return { audioContext, analyser, javascriptNode };
};

// Setup audio processing
const setupAudioProcessing = (source) => {
  // Disconnect any existing connections
  try {
    analyser.disconnect();
    javascriptNode.disconnect();
  } catch (e) {
    // Ignore disconnection errors
  }

  // Connect source to both analyser and destination for audio output
  source.connect(analyser);
  source.connect(audioContext.destination);
  analyser.connect(javascriptNode);
  javascriptNode.connect(audioContext.destination);

  javascriptNode.onaudioprocess = function() {
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    pitchDetector();
  };

  // Setup Meyda analyzer with more aggressive scaling
  const meyda_analyser = Meyda.createMeydaAnalyzer({
    audioContext: audioContext,
    source: source,
    buffersize: MusicolorsConfig.audio.bufferSize,
    featureExtractors: [
      "energy", 
      "perceptualSpread", 
      "perceptualSharpness", 
      "spectralFlatness", 
      "spectralKurtosis", 
      "spectralCentroid"
    ],
    callback: (features) => {
      // Get raw values with sanitization and apply config multiplier
      const rawEnergy = sanitizeValue(features['energy']) * MusicolorsConfig.audio.energyMultiplier;
      const rawWarmth = sanitizeValue(features['spectralCentroid']);
      const rawRichness = sanitizeValue(features['perceptualSpread']);
      const rawSharpness = sanitizeValue(features['perceptualSharpness']);

      // Calculate smooth values
      energy = SMOOTHING_FACTOR * smoothAverage(rawEnergy, featureHistory.energy) + 
               (1 - SMOOTHING_FACTOR) * rawEnergy;
      
      warmth = SMOOTHING_FACTOR * smoothAverage(rawWarmth, featureHistory.warmth) + 
               (1 - SMOOTHING_FACTOR) * rawWarmth;
      
      richness = SMOOTHING_FACTOR * smoothAverage(rawRichness, featureHistory.richness) + 
                 (1 - SMOOTHING_FACTOR) * rawRichness;
      
      sharpness = SMOOTHING_FACTOR * smoothAverage(rawSharpness, featureHistory.sharpness) + 
                  (1 - SMOOTHING_FACTOR) * rawSharpness;

      // Update history
      featureHistory.energy = [...featureHistory.energy.slice(1), energy];
      featureHistory.warmth = [...featureHistory.warmth.slice(1), warmth];
      featureHistory.richness = [...featureHistory.richness.slice(1), richness];
      featureHistory.sharpness = [...featureHistory.sharpness.slice(1), sharpness];

      // Optional: Log smoothed values
      if (Math.random() < 0.1) { // Only log 10% of updates to reduce console spam
        console.log('Smoothed Audio features:', {
          energy,
          warmth,
          richness,
          sharpness
        });
      }
    }
  });
  meyda_analyser.start();

  return source;
};

// Initialize with audio file
const initWithAudioFile = async (audioFile) => {
  try {
    const { audioContext, analyser, javascriptNode } = initAudioContext();
    
    // Load and decode audio file
    const response = await fetch(audioFile);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create audio source
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Setup processing
    setupAudioProcessing(source);
    
    // Store references
    window.musicolorsAudioContext = audioContext;
    window.musicolorsAudioBuffer = audioBuffer;
    window.musicolorsSourceNode = source;
    
    // Don't start playback yet
    return true;
  } catch (err) {
    console.error("Error loading audio file:", err);
    return false;
  }
};

// Initialize with microphone
const initWithMicrophone = async () => {
  try {
    const { audioContext, analyser, javascriptNode } = initAudioContext();
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    
    setupAudioProcessing(source);
    return true;
  } catch (err) {
    console.error("Error accessing microphone:", err);
    return false;
  }
};

// Main initialization function
export const initAudio = async (audioFile = null) => {
  try {
    if (audioFile) {
      return await initWithAudioFile(audioFile);
    } else {
      return await initWithMicrophone();
    }
  } catch (err) {
    console.error("Error initializing audio:", err);
    return false;
  }
};

// Add play/pause controls
export const playAudio = async () => {
  if (window.musicolorsAudioContext) {
    try {
      await window.musicolorsAudioContext.resume();
      
      // Create new source if needed
      if (!window.musicolorsSourceNode || window.musicolorsSourceNode.playbackState === 'finished') {
        const source = window.musicolorsAudioContext.createBufferSource();
        source.buffer = window.musicolorsAudioBuffer;
        setupAudioProcessing(source);
        window.musicolorsSourceNode = source;
      }
      
      if (!window.musicolorsSourceNode.isStarted) {
        window.musicolorsSourceNode.start(0);
        window.musicolorsSourceNode.isStarted = true;
      }
    } catch (err) {
      console.error('Error playing audio:', err);
    }
  }
};

export const pauseAudio = async () => {
  if (window.musicolorsAudioContext) {
    await window.musicolorsAudioContext.suspend();
  }
};

export const stopAudio = () => {
  if (window.musicolorsSourceNode) {
    try {
      window.musicolorsSourceNode.stop();
      window.musicolorsSourceNode.disconnect();
    } catch (e) {
      // Ignore if already stopped
    }
    window.musicolorsSourceNode = null;
    resetFeatureHistory();
  }
};

function updatePitch(analyser, detector, input, sampleRate) {
  analyser.getFloatTimeDomainData(input);
  let [pitch, clarity] = detector.findPitch(input, sampleRate);
  let myNote = FrequencyMap.noteFromFreq(pitch);
  realpitch = myNote.name;
  realoctave = myNote.octave;
}

function pitchDetector() {
  const detector = PitchDetector.forFloat32Array(analyser.fftSize);
  const input = new Float32Array(detector.inputLength);
  updatePitch(analyser, detector, input, audioContext.sampleRate);
}

export { 
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
};

// Add these at the top with other state variables
const SMOOTHING_FACTOR = 0.8; // Range 0-1, higher = smoother but less responsive
const FEATURE_HISTORY_SIZE = 5; // How many previous values to keep for averaging

// Store feature history for smoothing
let featureHistory = {
  energy: Array(FEATURE_HISTORY_SIZE).fill(0),
  warmth: Array(FEATURE_HISTORY_SIZE).fill(0),
  richness: Array(FEATURE_HISTORY_SIZE).fill(0),
  sharpness: Array(FEATURE_HISTORY_SIZE).fill(0)
};

// Helper function to calculate smooth average
function smoothAverage(newValue, history) {
  // Remove oldest value and add new value
  history.shift();
  history.push(newValue || 0);

  // Calculate weighted average
  const sum = history.reduce((acc, val) => acc + val, 0);
  return sum / history.length;
}

// Helper function to handle Infinity and NaN
function sanitizeValue(value, defaultValue = 0) {
  if (isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return value;
}

// Add cleanup for feature history
export const resetFeatureHistory = () => {
  featureHistory = {
    energy: Array(FEATURE_HISTORY_SIZE).fill(0),
    warmth: Array(FEATURE_HISTORY_SIZE).fill(0),
    richness: Array(FEATURE_HISTORY_SIZE).fill(0),
    sharpness: Array(FEATURE_HISTORY_SIZE).fill(0)
  };
};