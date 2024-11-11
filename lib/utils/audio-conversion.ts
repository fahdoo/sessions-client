import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import { TranscriptState, TranscriptSegment } from '@/lib/types';
import { isAIAgent } from '@/lib/utils/client';

let ffmpeg: FFmpeg | null = null;

interface AudioSegment {
  start: number;
  end: number;
  speaker: 'ai' | 'human';
}

async function getTranscriptSegments(sessionId: string): Promise<AudioSegment[] | null> {
  try {
    const response = await fetch(`/api/sessions/${sessionId}/transcript`);
    if (!response.ok) return null;

    const transcriptState: TranscriptState = await response.json();
    
    // Filter out segments without timing info and convert to audio segments
    return transcriptState.transcript
      .filter(segment => 
        segment.firstReceivedTime !== undefined && 
        segment.lastReceivedTime !== undefined
      )
      .map((segment: TranscriptSegment): AudioSegment => ({
        start: segment.firstReceivedTime!,
        end: segment.lastReceivedTime!,
        speaker: isAIAgent(segment.participantId) ? 'ai' : 'human' as const
      }))
      .sort((a, b) => a.start - b.start);
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

async function processWithSegments(
  ffmpeg: FFmpeg,
  inputFile: string,
  segments: AudioSegment[]
): Promise<void> {
  console.log('Processing audio with segments...');
  
  // Convert Unix timestamps to relative timestamps
  const firstTimestamp = segments[0].start;
  const validSegments = segments
    .filter(segment => 
      segment.start < segment.end && 
      segment.end - segment.start > 0.1
    )
    .map(segment => ({
      start: segment.start - firstTimestamp,
      end: segment.end - firstTimestamp,
      speaker: segment.speaker
    }))
    .sort((a, b) => a.start - b.start);

  console.log(`Found ${validSegments.length} valid segments with relative timestamps`);

  // If no valid segments, fall back to single pass
  if (validSegments.length === 0) {
    console.log('No valid segments found, falling back to single pass');
    return processSinglePass(ffmpeg, inputFile);
  }

  const processedSegments: string[] = [];

  for (const segment of validSegments) {
    const segmentName = `segment_${segment.start.toFixed(3)}_${segment.end.toFixed(3)}.m4a`;
    const processedName = `${segment.speaker}_${segmentName}`;
    
    console.log(`Processing segment: ${segment.speaker} ${segment.start.toFixed(3)}-${segment.end.toFixed(3)} (duration: ${(segment.end - segment.start).toFixed(3)}s)`);

    try {
      // Extract segment using relative timestamps
      await ffmpeg.exec([
        '-i', inputFile,
        '-ss', segment.start.toFixed(3),
        '-t', (segment.end - segment.start).toFixed(3),
        '-c:a', 'aac',
        '-b:a', '192k',
        '-ar', '48000',
        segmentName
      ]);

      // Verify segment was created
      const segmentData = await ffmpeg.readFile(segmentName);
      if (!segmentData || segmentData.length === 0) {
        console.log(`Skipping empty segment: ${segment.start}-${segment.end}`);
        await ffmpeg.deleteFile(segmentName);
        continue;
      }

      // Process based on speaker
      if (segment.speaker === 'ai') {
        await ffmpeg.exec([
          '-i', segmentName,
          '-af',
          'highpass=f=60,lowpass=f=14000,' +
          'silenceremove=1:0:-35dB,' +
          'compand=0.8|0.8:1|1:-60/-40|-40/-30|-30/-20|-20/-10:6:0:-60:0.1,' +
          'loudnorm=I=-16:TP=-1.5:LRA=11',
          processedName
        ]);
      } else {
        await ffmpeg.exec([
          '-i', segmentName,
          '-af',
          'highpass=f=50,lowpass=f=15000,' +
          'silenceremove=1:0:-35dB,' +
          'compand=0.8|0.8:1|1:-60/-40|-40/-30|-30/-20|-20/-10:6:0:-60:0.1,' +
          'equalizer=f=200:t=q:w=1:g=-0.5,' +
          'equalizer=f=3000:t=q:w=1:g=0.5,' +
          'loudnorm=I=-16:TP=-1.5:LRA=11',
          processedName
        ]);
      }

      // Verify processed segment
      const processedData = await ffmpeg.readFile(processedName);
      if (processedData && processedData.length > 0) {
        processedSegments.push(processedName);
      }

      // Clean up original segment
      await ffmpeg.deleteFile(segmentName);

    } catch (error) {
      console.error(`Error processing segment ${segment.start}-${segment.end}:`, error);
      // Clean up any failed files
      try {
        await ffmpeg.deleteFile(segmentName);
        await ffmpeg.deleteFile(processedName);
      } catch (cleanupError) {
        console.error('Error cleaning up failed segment:', cleanupError);
      }
      continue;
    }
  }

  // If no segments were processed successfully, fall back to single pass
  if (processedSegments.length === 0) {
    console.log('No segments processed successfully, falling back to single pass');
    return processSinglePass(ffmpeg, inputFile);
  }

  try {
    // Create concatenation file
    const concatFile = 'concat.txt';
    const concatContent = processedSegments
      .map(file => `file '${file}'`)
      .join('\n');

    await ffmpeg.writeFile(concatFile, concatContent);
    console.log('Created concat file with segments:', processedSegments);

    // Concatenate all processed segments
    await ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', concatFile,
      '-c:a', 'aac',
      '-b:a', '192k',
      '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
      'output.m4a'
    ]);

    // Clean up
    await Promise.all([
      ...processedSegments.map(file => ffmpeg.deleteFile(file)),
      ffmpeg.deleteFile(concatFile)
    ]);

  } catch (error) {
    console.error('Error in concatenation:', error);
    // Clean up on error
    try {
      await Promise.all([
        ...processedSegments.map(file => ffmpeg.deleteFile(file)),
        ffmpeg.deleteFile('concat.txt')
      ]);
    } catch (cleanupError) {
      console.error('Error cleaning up after concatenation failure:', cleanupError);
    }
    throw error;
  }
}

async function processSinglePass(ffmpeg: FFmpeg, inputFile: string): Promise<void> {
  console.log('Processing audio in single pass...');
  await ffmpeg.exec([
    '-i', inputFile,
    '-af',
    'highpass=f=50,lowpass=f=15000,' +
    'silenceremove=start_periods=1:start_duration=1.0:start_threshold=-35dB:' +
    'stop_periods=1:stop_duration=1.0:stop_threshold=-35dB,' +
    'compand=0.8|0.8:1|1:-60/-40|-40/-30|-30/-20|-20/-10:6:0:-60:0.1,' +
    'equalizer=f=200:t=q:w=1:g=-0.5,' +
    'equalizer=f=3000:t=q:w=1:g=0.5,' +
    'loudnorm=I=-16:TP=-1.5:LRA=11',
    'output.m4a'
  ]);
}

export async function processAudio(
  sessionId: string, 
  audioUrl: string, 
  signedUrl: string
): Promise<{ audioBlob: Blob; durationInSeconds: number }> {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg:', message);
    });
  }

  try {
    console.log('Processing audio from signed URL');
    const audioData = await fetchFile(signedUrl);
    if (!audioData || audioData.length === 0) {
      throw new Error('Invalid input audio data');
    }
    console.log('Input audio size:', audioData.length, 'bytes');

    await ffmpeg.writeFile('input', audioData);
    console.log('Input file written successfully');

    // Process audio in stages to identify any problematic filters
    console.log('Starting FFmpeg processing...');

    // Stage 1: Basic frequency filtering
    await ffmpeg.exec([
      '-i', 'input',
      '-af',
      'highpass=f=60,lowpass=f=14000',
      'stage1.m4a'
    ]);
    console.log('Stage 1 complete: Basic frequency filtering');

    // Stage 2: Add noise reduction
    await ffmpeg.exec([
      '-i', 'stage1.m4a',
      '-af',
      'afftdn=nr=10:nf=-40',
      'stage2.m4a'
    ]);
    console.log('Stage 2 complete: Noise reduction');

    // Stage 3: Add gentle silence removal
    await ffmpeg.exec([
      '-i', 'stage2.m4a',
      '-af',
      'silenceremove=start_periods=1:start_duration=1.0:start_threshold=-35dB:' +
      'stop_periods=1:stop_duration=1.0:stop_threshold=-35dB',
      'stage3.m4a'
    ]);
    console.log('Stage 3 complete: Silence removal');

    // Stage 4: Final pass with compression and normalization
    await ffmpeg.exec([
      '-i', 'stage3.m4a',
      '-af',
      'compand=0.3|0.3:1|1:-90/-60|-60/-40|-40/-30|-20/-20:6:0:-90:0.2,' +
      'equalizer=f=200:t=q:w=1:g=-1,' +
      'equalizer=f=1000:t=q:w=1:g=0.5,' +
      'equalizer=f=3000:t=q:w=1:g=1,' +
      'loudnorm=I=-16:TP=-1.5:LRA=11',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-ar', '48000',
      '-movflags', '+faststart',
      'output.m4a'
    ]);
    console.log('Stage 4 complete: Final processing');

    // Read and verify output
    const output = await ffmpeg.readFile('output.m4a');
    if (!output || output.length === 0) {
      throw new Error('FFmpeg produced no output');
    }
    console.log('Output audio size:', output.length, 'bytes');

    // Create blob and get duration
    const audioBlob = new Blob([output], { type: 'audio/mp4' });
    const duration = await new Promise<number>((resolve, reject) => {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      });
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(audio.src);
        reject(new Error('Failed to load audio'));
      });
    });

    console.log('Audio duration:', duration, 'seconds');

    // Clean up all intermediate files
    await Promise.all([
      ffmpeg.deleteFile('input'),
      ffmpeg.deleteFile('stage1.m4a'),
      ffmpeg.deleteFile('stage2.m4a'),
      ffmpeg.deleteFile('stage3.m4a'),
      ffmpeg.deleteFile('output.m4a')
    ]);

    return {
      audioBlob,
      durationInSeconds: duration
    };

  } catch (error) {
    console.error('Error in processAudio:', error);
    // Clean up on error
    try {
      await Promise.all([
        ffmpeg.deleteFile('input'),
        ffmpeg.deleteFile('stage1.m4a'),
        ffmpeg.deleteFile('stage2.m4a'),
        ffmpeg.deleteFile('stage3.m4a'),
        ffmpeg.deleteFile('output.m4a')
      ]);
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError);
    }
    throw error;
  }
} 