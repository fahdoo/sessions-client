export const MusicolorsConfig = {
  // Audio Analysis Settings
  audio: {
    // Size of the FFT for frequency analysis. Higher values give more detail but use more CPU
    // Range: 512-2048 (power of 2). Impact: Frequency resolution vs performance
    fftSize: 512,
    
    // How much to smooth the audio analysis. Higher = smoother but less responsive
    // Range: 0-1. Impact: Visual smoothness vs responsiveness
    smoothingTimeConstant: 1,
    
    // Size of audio processing buffer. Lower = more frequent updates but more CPU
    // Range: 256-2048 (power of 2). Impact: Update frequency vs performance
    bufferSize: 2048,
    
    // Multiplier for energy values. Higher = more dramatic size changes
    // Range: 0.1-10. Impact: How much the visualization reacts to volume
    energyMultiplier: 0.1,
  },

  // Visualization Settings
  visualization: {
    // Size Settings
    minSize: 1.4,      // Minimum sphere size when silent
    maxSize: 2.5,      // Maximum sphere size at peak volume
    defaultSize: 1.4,  // Initial sphere size
    
    sizeMultipliers: {
      linear: 50,      // Reduced for more controlled size changes
      exponential: 10,
    },
    
    // Color Settings
    defaultColors: {
      hue: 180,        // Default color hue (Range: 0-360, 180 = cyan)
      saturation: 50,  // Default color saturation (Range: 0-100)
      luminance: 50,   // Default brightness (Range: 0-100)
      fallbackColor1: '#FFFFFF',  // Used when color calculation fails
      fallbackColor2: '#000000'   // Used for secondary color when needed
    },
    
    // Animation Settings
    transitionSpeed: 0.2,    // How fast colors/size change (Range: 0-1)
    sizeTransitionMultiplier: 0.2, // Additional size change speed (Range: 0.1-2)
    frameRate: 30,          // Target FPS (Range: 30-120)
    scale: 0.5,            // Overall visualization scale (Range: 0.1-2)
  },

  // Camera Settings
  camera: {
    fov: 75,           // Field of view in degrees (Range: 30-120)
    near: 0.1,         // Nearest visible distance (Range: 0.1-1)
    far: 1000,         // Farthest visible distance (Range: 100-2000)
    position: {
        x: 0,          // Camera X position (Range: -10 to 10)
        y: 0,          // Camera Y position (Range: -10 to 10)
        z: 5           // Camera Z position (Range: 1 to 20)
    }
  },

  // Lighting Settings
  lighting: {
    ambient: {
      color: 0xaaaaaa,  // Ambient light color (soft gray)
      intensity: 1      // Ambient light brightness (Range: 0-2)
    },
    spot: {
      color: 0xffffff,  // Spotlight color (white)
      intensity: 0.9,   // Spotlight brightness (Range: 0-2)
      position: {
        x: -10,         // Spotlight X position (Range: -20 to 20)
        y: 40,          // Spotlight Y position (Range: 20 to 60)
        z: 20           // Spotlight Z position (Range: 0 to 40)
      }
    },
    point: {
      color: 0xffffff,  // Point light color (white)
      intensity: 1,     // Point light brightness (Range: 0-2)
      position: {
        x: 200,         // Light X position (Range: -300 to 300)
        y: 200,         // Light Y position (Range: -300 to 300)
        z: 200          // Light Z position (Range: -300 to 300)
      }
    }
  },

  // Color Palettes
  palettes: {
    // Rainbow colors for musical note visualization
    // Maps each note to a specific color in the rainbow spectrum
    rainbow: {
      'C': '#FF0000',  // Red - root note
      'D': '#FF7F00',  // Orange - second
      'E': '#FFFF00',  // Yellow - third
      'F': '#00FF00',  // Green - fourth
      'G': '#0000FF',  // Blue - fifth
      'A': '#4B0082',  // Indigo - sixth
      'B': '#8B00FF'   // Violet - seventh
    }
  }
};

export default MusicolorsConfig; 