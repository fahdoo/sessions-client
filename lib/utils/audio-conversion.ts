import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function convertAudioToMp3(audioUrl: string): Promise<Blob> {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    // Use CDN for FFmpeg core files
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  }

  try {
    // Fetch the audio file
    const audioData = await fetchFile(audioUrl);

    // Write the input file to FFmpeg's virtual filesystem
    await ffmpeg.writeFile('input.ogg', audioData);

    // Run FFmpeg command to convert, remove silence, and normalize audio
    await ffmpeg.exec([
      '-i', 'input.ogg',
      '-af', 'silenceremove=1:0:-50dB,loudnorm',
      '-c:a', 'libmp3lame',
      '-q:a', '2',
      'output.mp3'
    ]);

    // Read the output file from FFmpeg's virtual filesystem
    const data = await ffmpeg.readFile('output.mp3');
    
    // Clean up files from memory
    await ffmpeg.deleteFile('input.ogg');
    await ffmpeg.deleteFile('output.mp3');

    // Create a Blob from the processed data
    return new Blob([data], { type: 'audio/mp3' });
  } catch (error) {
    console.error('Error in convertAudioToMp3:', error);
    throw error;
  }
} 