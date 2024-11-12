declare module 'note-frequency-map' {
  interface Note {
    name: string;
    octave: number;
    frequency: number;
  }

  const FrequencyMap: {
    noteFromFreq(frequency: number): Note;
    freqFromNote(note: string, octave: number): number;
  };

  export default FrequencyMap;
} 