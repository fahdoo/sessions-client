import { registerRoot } from 'remotion';
import { AudiogramBasicRoot } from './templates/audiogram-basic/Root';
import type { FC } from 'react';

// Dynamically register the template based on environment or input
const templateToRender = process.env.REMOTION_TEMPLATE || 'audiogram-basic'; // Example logic

switch (templateToRender) {
  case 'audiogram-basic':
    registerRoot(AudiogramBasicRoot as FC);
    break;
  default:
    throw new Error(`Template ${templateToRender} not found.`);
}
