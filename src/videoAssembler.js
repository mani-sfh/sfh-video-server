import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import https from 'https';
import http from 'http';

const AUDIO_SAMPLE_RATE = 48000;
const AUDIO_CHANNELS = 'stereo';
const AUDIO_BITRATE = '128k';
const FFMPEG_PRESET = 'ultrafast';
const FFMPEG_CRF = '28';
const SEGMENT_CONCURRENCY = 3;
const STATIC_FPS = 24;

async function runBatched(tasks, concurrency) {
  const results = new Array(tasks.length);
  let index = 0;
  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function assembleVideo({ segments, outputPath, resolution }) {
  const tempDir = path.dirname(outputPath);
  const videoWidth = resolution === '1080p' ? 1920 : 1280;
  const videoHeight = resolution === '1080p' ? 1080 : 720;

  console.log(`Processing ${segments.length} segments with ${SEGMENT_CONCURRENCY} concurrent FFmpeg workers`);

  const validSegments = segments.filter((segment) => {
    if (segment.type === 'video' && !segment.path) {
      console.warn('Skipping video segment with null path');
      return false;
    }
    return true;
  });

  const encodeTasks = validSegments.map((segment, i) => {
    const segmentOutputPath = path.join(tempDir, `segment_${i}.mp4`);
    return () => {
      if (segment.type === 'image') {
        return imageToVideo(segment.path, segmentOutputPath, segment.duration, videoWidth, videoHeight, segment.audioUrl);
      } else if (segment.type === 'video') {
        return normalizeVideo(segment.path, segmentOutputPath, videoWidth, videoHeight);
      } else if (segment.type === 'countdown-overlay') {
        return createCountdownVideo(segment, segmentOutputPath, videoWidth, videoHeight, resolution);
      }
      return Promise.resolve(null);
    };
  });

  await runBatched(encodeTasks, SEGMENT_CONCURRENCY);

  const processedSegments = validSegments.map((_, i) => path.join(tempDir, `segment_${i}.mp4`));

  const concatListPath = path.join(tempDir, 'concat_list.txt');
  const concatContent = processedSegments
    .map(p => `file '${path.basename(p)}'`)
    .join('\n');
  await fs.writeFile(concatListPath, concatContent);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatListPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions([
        '-c copy',
        '-movflags +faststart'
      ])
      .output(outputPath)
      .on('start', (cmd) => {
        console.log('FFmpeg concat command:', cmd);
      })
      .on('progress', (progress) => {
        console.log(`Concatenation progress: ${progress.percent?.toFixed(1)}%`);
      })
      .on('end', () => {
        console.log('Video assembly complete');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('FFmpeg concat error:', err);
        reject(err);
      })
      .run();
  });
}

function downloadAudioFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, (response) => {
      if (response.statusCode !== 200) {
        resolve(null);
        return;
      }
      const file = createWriteStream(outputPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Audio downloaded: ${path.basename(outputPath)}`);
        resolve(outputPath);
      });
      file.on('error', () => resolve(null));
    }).on('error', () => resolve(null));
  });
}

async function imageToVideo(imagePath, outputPath, duration, width, height, audioUrl) {
  let audioPath = null;

  // Download audio clip if provided
  if (audioUrl) {
    audioPath = outputPath.replace('.mp4', '_audio.mp3');
    try {
      const result = await downloadAudioFile(audioUrl, audioPath);
      if (!result) audioPath = null;
    } catch (e) {
      console.error('Audio download failed:', e.message);
      audioPath = null;
    }
  }

  return new Promise((resolve, reject) => {
    const cmd = ffmpeg()
      .input(imagePath)
      .inputOptions(['-loop 1', `-t ${duration}`]);

    if (audioPath) {
      // Use the downloaded audio clip
      cmd.input(audioPath);
    } else {
      // Silent audio
      cmd.input(`anullsrc=channel_layout=${AUDIO_CHANNELS}:sample_rate=${AUDIO_SAMPLE_RATE}`)
        .inputOptions(['-f lavfi', `-t ${duration}`]);
    }

    cmd.outputOptions([
      '-threads 1',
      '-c:v libx264',
      '-c:a aac',
      `-ar ${AUDIO_SAMPLE_RATE}`,
      `-b:a ${AUDIO_BITRATE}`,
      '-ac 2',
      '-shortest',
      `-preset ${FFMPEG_PRESET}`,
      `-crf ${FFMPEG_CRF}`,
      '-pix_fmt yuv420p',
      `-r ${STATIC_FPS}`,
      `-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`
    ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

function getVideoInfo(inputPath) {
  return new Promise((resolve) => {
    if (!inputPath) {
      resolve({ hasAudio: false, width: 0, height: 0 });
      return;
    }
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        resolve({ hasAudio: false, width: 0, height: 0 });
        return;
      }
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      resolve({
        hasAudio: !!audioStream,
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
        audioSampleRate: audioStream?.sample_rate,
        audioChannels: audioStream?.channels,
      });
    });
  });
}

async function normalizeVideo(inputPath, outputPath, width, height) {
  if (!inputPath) {
    throw new Error(`Cannot normalize video: input path is null or undefined`);
  }
  const info = await getVideoInfo(inputPath);

  return new Promise((resolve, reject) => {
    const cmd = ffmpeg().input(inputPath);

    if (!info.hasAudio) {
      cmd.input(`anullsrc=channel_layout=${AUDIO_CHANNELS}:sample_rate=${AUDIO_SAMPLE_RATE}`)
         .inputOptions(['-f lavfi']);
    }

    const audioFilters = info.hasAudio
      ? [
          `-af aresample=${AUDIO_SAMPLE_RATE},aformat=sample_fmts=fltp:channel_layouts=stereo`
        ]
      : [];

    cmd.outputOptions([
      '-threads 1',
      '-c:v libx264',
      '-c:a aac',
      `-ar ${AUDIO_SAMPLE_RATE}`,
      `-b:a ${AUDIO_BITRATE}`,
      '-ac 2',
      `-preset ${FFMPEG_PRESET}`,
      `-crf ${FFMPEG_CRF}`,
      '-pix_fmt yuv420p',
      `-r ${STATIC_FPS}`,
      '-shortest',
      `-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
      ...audioFilters,
    ])
      .output(outputPath)
      .on('start', (cmd) => {
        console.log('Normalizing video:', cmd);
      })
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

async function createCountdownVideo(segment, outputPath, width, height, resolution) {
  const { imagePath, duration } = segment;
  const fontSize = resolution === '1080p' ? 72 : 52;
  const barSize = resolution === '1080p' ? 180 : 130;
  const barThickness = resolution === '1080p' ? 10 : 8;
  const margin = resolution === '1080p' ? 40 : 28;
  const boxPad = resolution === '1080p' ? 16 : 12;

  const textFilter = `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{eif\\:${duration}-t\\:d}':fontcolor=0x0C115B:fontsize=${fontSize}:x=w-text_w-${margin}:y=h-text_h-${margin + barThickness + 16}:box=1:boxcolor=0xFFFBF7@0.85:boxborderw=${boxPad}:borderw=2:bordercolor=0x0C115B@0.15`;

  const barX = `w-${barSize}-${margin}`;
  const barY = `h-${barThickness}-${margin}`;
  const progressBarBorder = `drawbox=x=${barX}:y=${barY}:w=${barSize}:h=${barThickness}:color=0x0C115B@0.15:t=fill`;
  const progressBarFilter = `drawbox=x=${barX}:y=${barY}:w=${barSize}*t/${duration}:h=${barThickness}:color=0xA61E51:t=fill`;

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .inputOptions([
        '-loop 1',
        `-t ${duration}`
      ])
      .input(`anullsrc=channel_layout=${AUDIO_CHANNELS}:sample_rate=${AUDIO_SAMPLE_RATE}`)
      .inputOptions(['-f lavfi', `-t ${duration}`])
      .outputOptions([
        '-threads 1',
        '-c:v libx264',
        '-c:a aac',
        `-ar ${AUDIO_SAMPLE_RATE}`,
        `-b:a ${AUDIO_BITRATE}`,
        '-ac 2',
        '-shortest',
        `-preset ${FFMPEG_PRESET}`,
        `-crf ${FFMPEG_CRF}`,
        '-pix_fmt yuv420p',
        `-r ${STATIC_FPS}`,
        `-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=0xFFFBF7,${textFilter},${progressBarBorder},${progressBarFilter}`
      ])
      .output(outputPath)
      .on('start', (cmd) => {
        console.log('Creating countdown video:', cmd);
      })
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}
