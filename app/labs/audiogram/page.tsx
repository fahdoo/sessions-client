'use client';

// Move content from app/audiogram-test/page.tsx
import { useEffect, useState } from 'react';
import AudiogramVisualizer from '@/components/audiogram/AudiogramVisualizer';
import { AudiogramSettingsSidebar } from '@/components/audiogram/AudiogramSettingsSidebar';
import { Session } from '@/lib/types';
import { useUser } from '@clerk/nextjs';
import { THEME_COLORS } from '@/components/audiogram/constants';
import { VisualizationType, VisualizerConfig } from '@/components/audiogram/types';

export default function AudiogramLab() {
  // ... rest of the code from audiogram-test/page.tsx
} 