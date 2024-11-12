'use client';

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { pitchDetector, energy, roughness, warmth, richness, sharpness, kurtosis,
         dataArray, analyser, realpitch, realoctave } from './audio.js'

import { Noise } from 'noisejs';
import { MusicolorsConfig } from '../config';


let controls;
let background;
let camera, scene, renderer;
let container;
let FrameRate = 0;

let group, geometry, material, compoCenter;
let pointLight;
let ambientLight, spotLight;

let size;
let hex1, hex2;
let hue, saturation, luminance;
let isInitialized = false;
let animationFrameId = null;
let isAnimating = false;

let currentSize = MusicolorsConfig.visualization.defaultSize;
let currentHue = MusicolorsConfig.visualization.defaultColors.hue;
let currentSaturation = MusicolorsConfig.visualization.defaultColors.saturation;
let currentLuminance = MusicolorsConfig.visualization.defaultColors.luminance;
const transitionSpeed = MusicolorsConfig.visualization.transitionSpeed;

var noise = new Noise(Math.random());



function init() {
  console.log('Initializing colors.js...');
  
  // Check if already initialized
  if (isInitialized) {
    console.log('Already initialized');
    return true;
  }

  // Wait for canvas
  container = document.getElementById("canvas");
  console.log('Looking for canvas element:', container);
  
  if (!container) {
    console.warn('Canvas element not found, waiting for DOM...');
    return false;
  }

  try {
    scene = new THREE.Scene();
    console.log('Scene created');

    // Get container dimensions
    const width = container.clientWidth || 800;  // Fallback width
    const height = container.clientHeight || 600; // Fallback height
    console.log('Container dimensions:', width, height);

    // Create renderer using existing canvas
    renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      canvas: container
    });
    
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    console.log('Renderer created');

    // Set up camera
    camera = new THREE.PerspectiveCamera(
      MusicolorsConfig.camera.fov,
      width/height,
      MusicolorsConfig.camera.near,
      MusicolorsConfig.camera.far
    );
    camera.position.set(
      MusicolorsConfig.camera.position.x,
      MusicolorsConfig.camera.position.y,
      MusicolorsConfig.camera.position.z
    );
    console.log('Camera set up');

    // Set up lights
    ambientLight = new THREE.AmbientLight(
      MusicolorsConfig.lighting.ambient.color,
      MusicolorsConfig.lighting.ambient.intensity
    );
    scene.add(ambientLight);
    
    spotLight = new THREE.SpotLight(
      MusicolorsConfig.lighting.spot.color,
      MusicolorsConfig.lighting.spot.intensity
    );
    spotLight.position.set(
      MusicolorsConfig.lighting.spot.position.x,
      MusicolorsConfig.lighting.spot.position.y,
      MusicolorsConfig.lighting.spot.position.z
    );
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Create group
    group = new THREE.Group();
    scene.add(group);
    
    // Set up controls
    controls = new OrbitControls(camera, container);
    
    // Create initial sphere
    createVanilla();

    // Add resize handler
    window.addEventListener('resize', onWindowResize, false);

    // Start rendering
    render();

    isInitialized = true;
    console.log('Initialization complete');
    return true;
  } catch (err) {
    console.error('Error during initialization:', err);
    return false;
  }
}

// Add resize handler
function onWindowResize() {
  if (!container || !camera || !renderer) return;
  
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
}





function createVanilla(){
    geometry = new THREE.SphereGeometry(
        MusicolorsConfig.visualization.defaultSize,
        128,
        128
    );

    material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x072534,
        side: THREE.DoubleSide,
        flatShading: true
    });

    compoCenter = new THREE.Mesh(geometry, material);
    compoCenter.position.set(0, 0, 0);
    compoCenter.scale.set(
        MusicolorsConfig.visualization.scale,
        MusicolorsConfig.visualization.scale,
        MusicolorsConfig.visualization.scale
    );

    spotLight.lookAt(compoCenter);
    pointLight = new THREE.PointLight(
        MusicolorsConfig.lighting.point.color,
        MusicolorsConfig.lighting.point.intensity
    );
    pointLight.position.set(
        MusicolorsConfig.lighting.point.position.x,
        MusicolorsConfig.lighting.point.position.y,
        MusicolorsConfig.lighting.point.position.z
    );
    scene.add(pointLight);

    group.add(compoCenter);
    console.log('Initial sphere created');
}




function HSLToHex(h, s, l) {
  // Ensure inputs are numbers and within valid ranges
  h = Number(h) || 0;
  s = Number(s) || 0;
  l = Number(l) || 0;

  h = Math.min(Math.max(h, 0), 360);
  s = Math.min(Math.max(s, 0), 100);
  l = Math.min(Math.max(l, 0), 100);

  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0, 
      b = 0; 

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  // Ensure values are within valid range
  r = Math.min(Math.max(r, 0), 255);
  g = Math.min(Math.max(g, 0), 255);
  b = Math.min(Math.max(b, 0), 255);

  // Convert to hex
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');

  return `#${hexR}${hexG}${hexB}`;
}



function getRandomHexColor() {
  // Generate random values for R, G, and B channels
  const r = Math.floor(Math.random() * 256); // Random value between 0 and 255
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Convert decimal values to hexadecimal and ensure they have two digits
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');

  // Concatenate the R, G, and B values to form a complete color code
  const hexColor = `#${hexR}${hexG}${hexB}`;

  return hexColor;
}




function getColorByPitch(pitch) {
  // Use rainbow colors from config
  const rainbowColors = MusicolorsConfig.palettes.rainbow;
  
  // Define the octave range and corresponding lightness values
  const minLightness = 0;
  const maxLightness = 60;

  size = energy;
  if (size < 0.01) {
    size * 40;
  } else {
    // Check if we have a color mapping for this pitch
    if (pitch && rainbowColors[pitch]) {
      const octave = 3 + realoctave;
      const lightness = minLightness + (maxLightness - minLightness) * (octave / 5);

      const hsvColor = new THREE.Color();
      const noteIndex = Object.keys(rainbowColors).indexOf(pitch);
      hsvColor.setHSL(noteIndex * 360 / Object.keys(rainbowColors).length, 1, lightness / 100);

      const finalColor = hsvColor.getHexString();
      return '#' + finalColor;
    } else {
      return MusicolorsConfig.visualization.defaultColors.fallbackColor1;
    }
  }
}




function applyPitch() {
  hue = warmth;
  saturation = richness * 100;
  luminance = sharpness * 100;

  // Check and clamp the values
  if (hue > 360) {
    hue = 360;
  }
  if (saturation > 100) {
    saturation = 100;
  }
  if (luminance > 100) {
    luminance = 100;
  }


  hex1 = HSLToHex(hue, saturation, luminance);
  hex2 = getColorByPitch(realpitch);

  geometry = new THREE.SphereGeometry(1.4, 128, 128);
  material = new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        value: new THREE.Color(hex1)
      },
      color2: {
        value: new THREE.Color(hex2)
      }
    },
    vertexShader: `
    
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      #define PI 3.1415926
      #define TWO_PI PI*2.
        
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 vUv;
      
      void main() {
        
        vec2 uv = vUv * 2. - 1.;
        
        float a = atan(uv.x,uv.y)+PI;
        float r = TWO_PI/4.;
        float d = cos(floor(.5+a/r)*r-a)*length(uv);
        
        gl_FragColor = vec4(mix(color1, color2, d), 1.0);
      }
    `,
  });

  compoCenter = new THREE.Mesh(geometry, material);
  compoCenter.position.set(0, 0, 0);
  compoCenter.scale.set(0.5, 0.5, 0.5); // Adjust the scale factor as needed


  spotLight.lookAt(compoCenter);
  pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(200, 200, 200);
  scene.add(pointLight);

  group.add(compoCenter);
}




function applyEnergy(){

  size = energy
  if(size < 0.01){
    size * 100
  } else {

  }

  geometry = new THREE.SphereGeometry(size*1.5, 128, 128);
  material = new THREE.ShaderMaterial({
    uniforms: {
      color1: {
        value: new THREE.Color('#DADEDF')
      },
      color2: {
        value: new THREE.Color('#8C979A')
      }
    },
    vertexShader: `
    
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      #define PI 3.1415926
      #define TWO_PI PI*2.
        
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 vUv;
      
      void main() {
        
        vec2 uv = vUv * 2. - 1.;
        
        float a = atan(uv.x,uv.y)+PI;
        float r = TWO_PI/4.;
        float d = cos(floor(.5+a/r)*r-a)*length(uv);
        
        gl_FragColor = vec4(mix(color1, color2, d), 1.0);
      }
    `,
  });
  compoCenter = new THREE.Mesh(geometry, material);
  compoCenter.position.set(0, 0, 0);
  compoCenter.scale.set(0.5, 0.5, 0.5); // Adjust the scale factor as needed



  spotLight.lookAt(compoCenter);
  pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(200, 200, 200);
  scene.add(pointLight);

  group.add( compoCenter );

}




function applyTimbre() {
  // Calculate target values using config
  let targetSize;
  if (!energy || energy < 0.001) {
    targetSize = MusicolorsConfig.visualization.defaultSize;
  } else {
    const normalizedEnergy = Math.min(Math.max(energy, 0), 1.0);
    targetSize = MusicolorsConfig.visualization.defaultSize + 
      (normalizedEnergy * (MusicolorsConfig.visualization.maxSize - MusicolorsConfig.visualization.defaultSize));
  }

  // Ensure all target values are within valid ranges
  const targetHue = warmth ? Math.min(Math.max(warmth, 0), 360) : currentHue || MusicolorsConfig.visualization.defaultColors.hue;
  const targetSaturation = richness ? Math.min(Math.max(richness * 100, 0), 100) : currentSaturation || MusicolorsConfig.visualization.defaultColors.saturation;
  const targetLuminance = sharpness ? Math.min(Math.max(sharpness * 100, 0), 100) : currentLuminance || MusicolorsConfig.visualization.defaultColors.luminance;

  // Smoothly interpolate current values
  currentSize = lerp(
    currentSize || MusicolorsConfig.visualization.defaultSize,
    targetSize,
    MusicolorsConfig.visualization.transitionSpeed
  );

  currentHue = lerp(currentHue || targetHue, targetHue, MusicolorsConfig.visualization.transitionSpeed);
  currentSaturation = lerp(currentSaturation || targetSaturation, targetSaturation, MusicolorsConfig.visualization.transitionSpeed);
  currentLuminance = lerp(currentLuminance || targetLuminance, targetLuminance, MusicolorsConfig.visualization.transitionSpeed);

  // Calculate colors before material updates
  hex1 = HSLToHex(currentHue, currentSaturation, currentLuminance);
  hex2 = getColorByPitch(realpitch || 'C');

  // Ensure we have valid colors
  const color1 = hex1 || MusicolorsConfig.visualization.defaultColors.fallbackColor1;
  const color2 = hex2 || MusicolorsConfig.visualization.defaultColors.fallbackColor2;

  // Only update geometry if size change is significant
  const sizeDiff = Math.abs(compoCenter?.geometry?.parameters?.radius - currentSize);
  if (!compoCenter || sizeDiff > 0.01) {
    if (geometry) geometry.dispose();
    geometry = new THREE.SphereGeometry(currentSize, 128, 128);
  }

  // Create or update material
  if (!material || !material.uniforms) {
    if (material) material.dispose();
    material = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(color1) },
        color2: { value: new THREE.Color(color2) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        #define PI 3.1415926
        #define TWO_PI PI*2.
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
          vec2 uv = vUv * 2. - 1.;
          float a = atan(uv.x,uv.y)+PI;
          float r = TWO_PI/4.;
          float d = cos(floor(.5+a/r)*r-a)*length(uv);
          gl_FragColor = vec4(mix(color1, color2, d), 1.0);
        }
      `
    });
  } else {
    // Safely update existing material colors
    try {
      material.uniforms.color1.value.set(color1);
      material.uniforms.color2.value.set(color2);
    } catch (err) {
      console.warn('Error updating material colors:', err);
      // Recreate material if update fails
      material.dispose();
      material = null;
      return; // Skip this frame and try again next time
    }
  }

  // Create or update mesh
  if (!compoCenter) {
    compoCenter = new THREE.Mesh(geometry, material);
    compoCenter.position.set(0, 0, 0);
    compoCenter.scale.set(
      MusicolorsConfig.visualization.scale,
      MusicolorsConfig.visualization.scale,
      MusicolorsConfig.visualization.scale
    );
    group.add(compoCenter);
  } else if (geometry) {
    // Update existing mesh
    const oldGeometry = compoCenter.geometry;
    compoCenter.geometry = geometry;
    if (oldGeometry) oldGeometry.dispose();
  }
}

// Add lerp helper function
function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}




function update() {
  // Check if initialized and has required objects
  if (!isInitialized || !compoCenter || !compoCenter.geometry) {
    return;
  }

  var positionAttribute = compoCenter.geometry.getAttribute('position');
  var vertex = new THREE.Vector3();
  var time = performance.now() * 0.003;

  var scalingFactor = 1 + roughness * 3;

  for (let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex++) {
    vertex.fromBufferAttribute(positionAttribute, vertexIndex);

    // Check if the size is greater than 1 before applying Perlin noise
    if (size > 1) {
      var noiseValue = noise.perlin3(vertex.x * scalingFactor, vertex.y * scalingFactor, vertex.z * scalingFactor);

      // Check for valid noise values
      if (!isNaN(noiseValue) && isFinite(noiseValue)) {
        vertex.normalize().multiplyScalar(1 + 0.3 * noiseValue);
      } else {
        // Handle invalid noise values here, for example, set the vertex to the original position
        vertex.set(0, 0, 0);
      }

      // Check again for NaN and Infinity after the manipulation
      if (!isNaN(vertex.x) && isFinite(vertex.x) && !isNaN(vertex.y) && isFinite(vertex.y) && !isNaN(vertex.z) && isFinite(vertex.z)) {
        positionAttribute.setXYZ(vertexIndex, vertex.x, vertex.y, vertex.z);
      } else {
        // If the vertex still contains invalid values, reset it to the original position
        positionAttribute.setXYZ(vertexIndex, 0, 0, 0);
      }
    } else {
      // If size is less than or equal to 1, keep the original position
      positionAttribute.setXYZ(vertexIndex, vertex.x, vertex.y, vertex.z);
    }
  }

  compoCenter.geometry.computeVertexNormals();
  compoCenter.geometry.normalsNeedUpdate = true;
  compoCenter.geometry.verticesNeedUpdate = true;
}






function animatePitch() {
  requestAnimationFrame(animatePitch);

  FrameRate = FrameRate + 1;
  if (FrameRate % 4 == 0) {
    // music rendering
    if (dataArray) {

      analyser.getByteFrequencyData(dataArray);
      pitchDetector();
      // geometry rendering (firstly, delete the basic geometry in the base.)
      deleteBasics();
      applyPitch();

    }
  }

  render();
}



function animateEnergy() {
  requestAnimationFrame(animateEnergy);

  FrameRate = FrameRate + 1;
  if (FrameRate % 4 == 0) {
    // music rendering
    if (dataArray) {

      analyser.getByteFrequencyData(dataArray);
      deleteBasics();
      applyEnergy();

    }
  }

  render();
}



function animateTimbre() {
  if (isAnimating) {
    console.log('Animation already running');
    return;
  }

  isAnimating = true;
  console.log('Starting animation');

  let lastTime = performance.now();
  const targetFrameTime = 1000 / MusicolorsConfig.visualization.frameRate;

  function animate() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;

    if (deltaTime >= targetFrameTime) {
      if (window.musicolorsAudioContext?.state === 'running' || !compoCenter) {
        // Only delete if we have something to replace it with
        if (energy !== undefined) {
          deleteBasics();
        }
        applyTimbre();
      }

      update();
      render();
      lastTime = currentTime;
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}




function render() {
    if (controls && scene && camera && renderer) {
        controls.update();
        renderer.render(scene, camera);
    }
}



function deleteBasics() {
    // Only remove group if it exists and has a parent
    if (group && group.parent) {
        group.parent.remove(group);
        group = new THREE.Group();
        scene.add(group);
    }
    
    // Only dispose of compoCenter if it exists
    if (compoCenter) {
        if (compoCenter.geometry) compoCenter.geometry.dispose();
        if (compoCenter.material) compoCenter.material.dispose();
        compoCenter = null; // Set to null after disposal
    }
}





window.addEventListener('dblclick', () => {
  if(!document.fullscreenElement) {
      canvas.requestFullscreen()
  } else {
      document.exitFullscreen()
  }
})


let colorTransitionQueue = [0, 0]; // Array to store pairs of numbers for color transitions

// function addToColorTransitionQueue(newNumber) {
//   // Ensure the new number is within the valid range
//   newNumber = (newNumber >= 0 && newNumber < pastelColors.length) ? newNumber : 0;

//   colorTransitionQueue.push(newNumber);

//   if (colorTransitionQueue.length === 2) {
//     startColorTransition();
//   }
// }



// function startColorTransition() {
//   if (colorTransitionQueue.length < 2) {
//     // Not enough elements for a transition
//     return;
//   }

//   // Access the last two elements in the queue for current and next numbers
//   const currentNumber = colorTransitionQueue[colorTransitionQueue.length - 2];
//   const nextNumber = colorTransitionQueue[colorTransitionQueue.length - 1];

//   const currentColor = pastelColors[currentNumber];
//   const nextColor = pastelColors[nextNumber];

//   // Set the new background with linear gradient
//   document.body.style.background = `linear-gradient(90deg, ${currentColor}, ${nextColor})`;
//   document.body.style.backgroundSize = '200% 100%'; // Double the background size for the sliding effect
//   document.body.style.transition = 'none'; // Remove any existing transition

//   // Add the animation class to start the sliding effect
//   document.body.classList.add('background-animation');

//   // Remove the class after the animation ends and process the next item in the queue
//   setTimeout(() => {
//     document.body.classList.remove('background-animation');
//     document.body.style.background = `linear-gradient(90deg, ${nextColor} 0%, ${nextColor} 100%)`;

//     // Remove the processed pair from the queue and start the next transition
//     colorTransitionQueue.shift();
//     if (colorTransitionQueue.length >= 2) {
//       startColorTransition();
//     }
//   }, 2000); // Match this duration to the animation duration
// }








function cleanup() {
  console.log('Cleaning up colors.js...');
  
  // Cancel animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  isAnimating = false;

  // Reset interpolation values to defaults from config
  currentSize = MusicolorsConfig.visualization.defaultSize;
  currentHue = MusicolorsConfig.visualization.defaultColors.hue;
  currentSaturation = MusicolorsConfig.visualization.defaultColors.saturation;
  currentLuminance = MusicolorsConfig.visualization.defaultColors.luminance;

  // Clean up THREE.js resources
  if (renderer) {
    renderer.dispose();
  }
  if (geometry) {
    geometry.dispose();
  }
  if (material) {
    material.dispose();
  }
  if (compoCenter) {
    compoCenter.geometry?.dispose();
    compoCenter.material?.dispose();
  }
  if (group) {
    scene?.remove(group);
  }

  // Reset state
  isInitialized = false;
  container = null;
  scene = null;
  camera = null;
  renderer = null;
  controls = null;
  group = null;
  geometry = null;
  material = null;
  compoCenter = null;
  pointLight = null;
  ambientLight = null;
  spotLight = null;

  console.log('Cleanup complete');
}



export { init, render, deleteBasics, createVanilla, applyPitch, applyEnergy, applyTimbre, animatePitch, animateEnergy, animateTimbre, update, cleanup }