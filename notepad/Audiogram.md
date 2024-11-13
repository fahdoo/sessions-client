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