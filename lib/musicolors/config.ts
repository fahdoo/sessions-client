export const MusicolorsConfig = {
  // Audio Analysis Settings
  audio: {
    fftSize: 1024,
    smoothingTimeConstant: 0.8,
    bufferSize: 512,
    energyMultiplier: 1,
  },

  // Visualization Settings
  visualization: {
    // Size Settings
    minSize: 1.4,
    maxSize: 4,
    defaultSize: 1.4,
    
    sizeMultipliers: {
      linear: 1000,
      exponential: 100,
    },
    
    // Color Settings
    defaultColors: {
      hue: 180,
      saturation: 50,
      luminance: 50,
      fallbackColor1: '#FFFFFF',
      fallbackColor2: '#000000'
    },
    
    // Animation Settings
    transitionSpeed: 0.8,
    sizeTransitionMultiplier: 1,
    frameRate: 60,
    scale: 0.5,
  },

  // Camera Settings
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: {
        x: 0,
        y: 0,
        z: 5        // Closer camera
    }
  },

  // Lighting Settings
  lighting: {
    ambient: {
      color: 0xaaaaaa,  // Soft gray ambient light
      intensity: 1      // Range: 0-2. Overall scene brightness
    },
    spot: {
      color: 0xffffff,  // White spotlight
      intensity: 0.9,   // Range: 0-2. Spotlight brightness
      position: {
        x: -10,         // Range: -20 to 20
        y: 40,          // Range: 20 to 60
        z: 20           // Range: 0 to 40
      }
    },
    point: {
      color: 0xffffff,  // White point light
      intensity: 1,     // Range: 0-2. Point light brightness
      position: {
        x: 200,         // Range: -300 to 300
        y: 200,         // Range: -300 to 300
        z: 200          // Range: -300 to 300
      }
    }
  },

  // Time-based Background Colors
  timeColors: {
    morning: {
      start: 6,   // 6 AM
      end: 12,    // 12 PM
      gradient: "linear-gradient(90deg, rgba(255,253,227,1) 0%, #ff912c 100%)"  // Warm morning colors
    },
    afternoon: {
      start: 12,  // 12 PM
      end: 17,    // 5 PM
      gradient: "linear-gradient(90deg, rgba(248,194,224,1) 0%, rgba(194,233,251,1) 100%)"  // Bright afternoon colors
    },
    evening: {
      start: 17,  // 5 PM
      end: 22,    // 10 PM
      gradient: "linear-gradient(90deg, rgba(0,55,241,1) 0%, rgba(255,73,111,1) 100%)"  // Sunset colors
    },
    night: {
      start: 22,  // 10 PM
      end: 6,     // 6 AM
      gradient: "linear-gradient(90deg, rgba(255,248,239,1) 0%, rgba(73,51,109,1) 100%)"  // Dark night colors
    }
  },

  // Color Palettes
  palettes: {
    // Pastel color palette for general use
    pastel: [
      'rgba(238, 233, 233, 1)', // White
      'rgba(255, 179, 186, 1)', // Pink
      'rgba(255, 223, 186, 1)', // Peach
      'rgba(255, 255, 186, 1)', // Yellow
      'rgba(186, 255, 201, 1)', // Green
      'rgba(186, 225, 255, 1)', // Blue
      'rgba(255, 179, 255, 1)', // Purple
      'rgba(255, 209, 220, 1)', // Light Pink
      'rgba(217, 255, 179, 1)', // Light Green
      'rgba(179, 217, 255, 1)'  // Light Blue
    ],

    // Rainbow colors for pitch visualization (used for note-to-color mapping)
    rainbow: {
      'C': '#FF0000',  // Red
      'D': '#FF7F00',  // Orange
      'E': '#FFFF00',  // Yellow
      'F': '#00FF00',  // Green
      'G': '#0000FF',  // Blue
      'A': '#4B0082',  // Indigo
      'B': '#8B00FF'   // Violet
    }
  }
};

export default MusicolorsConfig; 