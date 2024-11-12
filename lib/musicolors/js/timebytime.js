'use client';
import { MusicolorsConfig } from '../config';

export function updateBackground() {
    if (typeof document === 'undefined') {
        console.log("updateBackground function is browser-only");
        return;
    }

    const now = new Date();
    const hours = now.getHours();

    // Use time ranges from config
    let background;
    const { timeColors } = MusicolorsConfig;

    if (hours >= timeColors.morning.start && hours < timeColors.morning.end) {
        background = timeColors.morning.gradient;
    } else if (hours >= timeColors.afternoon.start && hours < timeColors.afternoon.end) {
        background = timeColors.afternoon.gradient;
    } else if (hours >= timeColors.evening.start && hours < timeColors.evening.end) {
        background = timeColors.evening.gradient;
    } else {
        background = timeColors.night.gradient;
    }

    // Find the canvas container instead of using body
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        canvasContainer.style.background = background;
        canvasContainer.style.backgroundSize = "1600% 1600%";
        canvasContainer.style.animation = "gradient 15s ease infinite";
    }
}

// Only add event listener if we're in the browser
if (typeof window !== 'undefined') {
    window.addEventListener('load', updateBackground);
}
