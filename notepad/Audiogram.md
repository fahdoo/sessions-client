# Audiogram Generator

## Core Purpose
Create TikTok/Instagram-style video visualizations (9:16 aspect ratio) from audio sessions, with synchronized transcripts and Wave.js visualizations.

## Layout Structure
1. Top Section
   - App name (top left)
   - Username (top right)
   - Session title below header

2. Middle Section
   - Synchronized transcript display
   - Dynamic positioning based on speaker (user/agent)
   - Fade in/out animations

3. Bottom Section
   - Wave.js visualization
   - Multiple visualization styles (Cubes, Wave, Lines, Square)
   - Customizable colors and parameters

4. Background
   - User avatar as default background
   - Blur effect applied
   - Customizable via settings

## Technical Implementation

### Wave.js Integration
- Using Wave.js for audio visualizations
- Available visualization types:
  - Cubes (bar-style)
  - Wave
  - Lines
  - Square
  - (Other Wave.js animations as needed)
- Customizable parameters:
  - Color
  - Size/Height
  - Opacity
  - Position

### Audio Processing
- Audio element with controls
- Cross-origin support for audio sources
- Synchronized transcript playback
- Wave.js handles frequency analysis

### Transcript Synchronization
- Segments timed with audio playback
- Role-based positioning (user/agent)
- Smooth transitions between segments
- Text size and opacity controls

### Settings Panel
1. Visualization Settings
   - Type selection
   - Color picker
   - Size/height controls
   - Opacity slider

2. Text Settings
   - Title size/position/opacity
   - Transcript size/position/opacity
   - Color controls for both

3. Background Settings
   - Custom image URL input
   - Default to user avatar
   - Blur/brightness controls

### Recording Functionality (Planned)
- Canvas and audio recording
- Export to video formats
- Social media sharing options

## Component Structure
1. AudiogramVisualizer
   - Main container (9:16 aspect ratio)
   - Audio processing
   - Transcript management
   - Wave.js initialization

2. WaveWrapper
   - Wave.js integration
   - Animation management
   - Cleanup handling

3. AudiogramSettingsSidebar
   - Settings controls
   - Mobile-responsive layout
   - Real-time parameter updates

4. AudiogramHeader
   - App branding
   - User information

## Key Features
- Responsive 9:16 aspect ratio
- Real-time audio visualization
- Synchronized transcripts
- Customizable appearance
- Mobile-friendly controls
- High-quality exports (planned)

## Future Enhancements
- Additional Wave.js animations
- More customization options
- Advanced recording features
- Direct social media sharing
- Preset styles/themes
- Beat detection
- Waveform preview 

## Recording Implementation Attempts

### Attempt 1: Direct Canvas + Audio Recording
- **Approach**: Used MediaRecorder with canvas.captureStream() and audio.captureStream()
- **Result**: Failed - audio.captureStream() not universally supported
- **Why**: Browser compatibility issues

### Attempt 2: Web Audio API Direct Connection
- **Approach**: Created new AudioContext and connected to MediaStreamDestination
- **Result**: Failed - "HTMLMediaElement already connected" error
- **Why**: Wave.js already owns the audio connection, can't create second connection

### Attempt 3: Secondary Audio Element
- **Approach**: Created separate audio element for recording
- **Result**: Failed - Same connection error
- **Why**: Wave.js still interferes with audio connections

### Attempt 4: Canvas Compositing with Wave.js Audio
- **Approach**: Tried to tap into Wave.js's existing audio context
- **Result**: Failed - Wave.js doesn't expose its audio nodes
- **Why**: Limited API access

### Attempt 5: Screen Capture API
- **Approach**: Used getDisplayMedia to record the visualization container
- **Result**: Failed - Records entire tab, not just our container
- **Why**: API limitation, can't target specific elements

### Attempt 6: Wave.js Alternative Constructor
- **Approach**: Tried using Wave.js's alternative constructor with custom AudioContext
- **Result**: Failed - Same connection error
- **Why**: Wave.js still tries to create its own audio connections internally

### Key Findings
1. Wave.js takes exclusive control of the audio element
2. Can't create parallel audio processing chains
3. Can't access Wave.js's internal audio nodes
4. Wave.js creates connections on audio.play() regardless of initialization method
5. Need to either modify Wave.js or find alternative solution

### Potential Solutions to Explore
1. Fork Wave.js and modify to expose audio nodes
2. Create custom audio visualization without Wave.js
3. Record video and audio separately and combine
4. Use MediaRecorder with audio destination node before Wave.js initializes
5. Investigate Web Audio API Worklet for audio cloning

### New Potential Solutions

1. **Pre-initialize Approach**
   - Initialize Wave.js after recording starts but before audio plays
   - Create our audio nodes first, then pass them to Wave.js
   - This might prevent Wave.js from taking exclusive control

2. **Audio Worklet Processor**
   - Create a custom AudioWorkletProcessor to clone the audio stream
   - Process audio in parallel without interfering with Wave.js
   - Could allow us to tap into the audio without creating new connections

3. **Offline Audio Context**
   - Use OfflineAudioContext to process and record audio separately
   - Let Wave.js handle live visualization
   - Combine recorded audio with canvas recording afterward

4. **MediaStreamTrackProcessor**
   - Use new MediaStreamTrackProcessor API to intercept audio
   - Process audio frames directly without creating audio nodes
   - Might avoid the connection conflicts entirely

5. **Service Worker Relay**
   - Use a service worker to relay audio data
   - Could act as a middleware between Wave.js and our recorder
   - Might allow us to capture audio without direct connections

Would you like me to try implementing any of these approaches?

### Experiment: Pts.js Implementation

#### Approach
- Used Pts.js as an alternative to Wave.js
- Implemented using react-pts-canvas for React integration
- Attempted to create a circular audio visualization

#### Key Findings
1. **Audio Context Initialization**
   - Must initialize audio context after user interaction
   - Cannot initialize in component mount or canvas ready
   - Need to handle in play event

2. **Visualization Control**
   - More direct control over visualization compared to Wave.js
   - Can create custom shapes and animations
   - Better TypeScript support and documentation
   - Smoother animations with built-in interpolation

3. **Challenges**
   - Still faces audio context connection issues
   - Requires more manual setup than Wave.js
   - Need to handle audio analysis manually
   - More code required for basic visualizations

4. **Advantages over Wave.js**
   - No "locked" audio connections
   - More flexible and customizable
   - Better browser compatibility
   - Cleaner separation of concerns

5. **Disadvantages**
   - More complex implementation
   - Requires more understanding of Web Audio API
   - Fewer built-in visualizations
   - More setup code needed

#### Recommendations
1. Consider Pts.js if:
   - Need complete control over visualization
   - Want to avoid Wave.js audio connection issues
   - Planning to create custom visualizations
   - Need better TypeScript support

2. Stick with Wave.js if:
   - Need quick implementation
   - Want built-in visualizations
   - Don't need recording functionality
   - Simpler setup is priority

### Next Steps
1. Investigate combining Pts.js visualization with recording
2. Look into Web Audio Worklet for better audio handling
3. Consider building reusable visualization components with Pts.js
4. Test performance with longer audio files