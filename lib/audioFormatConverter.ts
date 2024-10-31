import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// Initialize FFmpeg instance
const ffmpeg = createFFmpeg({ 
  log: true,
  // Specify the location of FFmpeg core files
  corePath: '/ffmpeg/ffmpeg-core.js'
});

let isFFmpegLoaded = false;

// Track created Blob URLs
const createdBlobUrls = new Set<string>();

/**
 * Converts an Opus/OGG audio file to MP3 format
 * @param audioUrl URL of the Opus/OGG audio file
 * @returns Promise resolving to a URL of the converted MP3 file
 */
export async function convertOpusToMp3(audioUrl: string): Promise<string> {
  try {
    // Load FFmpeg if not already loaded
    if (!isFFmpegLoaded) {
      await ffmpeg.load();
      isFFmpegLoaded = true;
    }

    // Fetch the audio file
    const response = await fetch(audioUrl);
    const audioData = await response.arrayBuffer();
    
    // 1. The input file is stored in FFmpeg's virtual filesystem (in memory)
    ffmpeg.FS('writeFile', 'input.opus', new Uint8Array(audioData));
    
    // 2. Conversion happens in memory
    await ffmpeg.run(
      '-i', 'input.opus',
      '-c:a', 'libmp3lame',
      '-b:a', '192k',
      'output.mp3'
    );
    
    // 3. The output is read from memory
    const data = ffmpeg.FS('readFile', 'output.mp3');
    
    // 4. A Blob URL is created, which references the data in memory
    const mp3Blob = new Blob([data.buffer], { type: 'audio/mp3' });
    const mp3Url = URL.createObjectURL(mp3Blob);
    createdBlobUrls.add(mp3Url);
    
    // 5. Clean up the virtual filesystem
    ffmpeg.FS('unlink', 'input.opus');
    ffmpeg.FS('unlink', 'output.mp3');
    
    return mp3Url;
  } catch (error) {
    console.error('Error converting audio:', error);
    throw error;
  }
}

/**
 * Clean up a specific Blob URL
 */
export function releaseConvertedAudio(url: string) {
  if (createdBlobUrls.has(url)) {
    URL.revokeObjectURL(url);
    createdBlobUrls.delete(url);
  }
}

/**
 * Clean up all converted audio Blob URLs
 */
export function releaseAllConvertedAudio() {
  createdBlobUrls.forEach(url => {
    URL.revokeObjectURL(url);
  });
  createdBlobUrls.clear();
} 