import { renderScreenToImage, initBrowser, closeBrowser } from './screenRenderer.js';
import { assembleVideo } from './videoAssembler.js';
import { downloadAssets } from './assetDownloader.js';
import fs from 'fs/promises';
import path from 'path';

const AUDIO_BASE_URL = 'https://ikctvstnfzgzxdmtxlui.supabase.co/storage/v1/object/public/audio-clips';

const AUDIO_CLIPS = {
  'title-card':              `${AUDIO_BASE_URL}/intro_welcome.mp3`,
  'tracker-reminder':        `${AUDIO_BASE_URL}/intro_tracker.mp3`,
  'equipment':               `${AUDIO_BASE_URL}/intro_equipment.mp3`,
  'lets-start':              `${AUDIO_BASE_URL}/intro_letsgo.mp3`,
  'watch-learn':             `${AUDIO_BASE_URL}/exercise_watch.mp3`,
  'your-turn':               `${AUDIO_BASE_URL}/exercise_yourturn.mp3`,
  'your-turn-right':         `${AUDIO_BASE_URL}/exercise_yourturn_right.mp3`,
  'your-turn-left':          `${AUDIO_BASE_URL}/exercise_yourturn_left.mp3`,
  'switch-sides':            `${AUDIO_BASE_URL}/exercise_switch.mp3`,
  'exercise-complete':       `${AUDIO_BASE_URL}/exercise_complete.mp3`,
  'exercise-complete-last':  `${AUDIO_BASE_URL}/exercise_complete_last.mp3`,
  'outro':                   `${AUDIO_BASE_URL}/outro_complete.mp3`,
};

async function fileToDataUri(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
  const mime = mimeMap[ext] || 'image/png';
  const buffer = await fs.readFile(filePath);
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

export async function generateVideo({ jobId, routineName, exercises, resolution, totalDuration, equipment, subtitle, level, condition, thumbnailImageUrl, supabase }) {
  const tempDir = path.join(process.cwd(), 'temp', jobId);

  try {
    await fs.mkdir(tempDir, { recursive: true });

    await updateJobStatus(supabase, jobId, 'processing', 'Starting video generation', 0);

    await initBrowser();

    await updateJobStatus(supabase, jobId, 'processing', 'Downloading exercise videos and images', 5);
    const assets = await downloadAssets(exercises, tempDir, resolution);

    const failedDownloads = exercises.filter(ex => !assets[ex.id]?.videoPath);
    if (failedDownloads.length > 0) {
      const names = failedDownloads.map(ex => ex.name).join(', ');
      throw new Error(`Video download failed for: ${names}. The Vimeo download URLs may have expired and need to be refreshed.`);
    }

    // Step 2: Generate intro screens
    await updateJobStatus(supabase, jobId, 'processing', 'Creating intro screens', 15);
    const introScreens = await generateIntroScreens({
      routineName,
      exerciseCount: exercises.length,
      totalDuration,
      equipment,
      subtitle,
      level,
      condition,
      thumbnailImageUrl,
      resolution,
      tempDir
    });

    // Step 3: Generate exercise sequences
    const exerciseSegments = [];
    const totalExercises = exercises.length;

    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      const progressPercent = 15 + Math.floor((i / totalExercises) * 70);
      await updateJobStatus(
        supabase,
        jobId,
        'processing',
        `Rendering exercise ${i + 1} of ${totalExercises}: ${exercise.name}`,
        progressPercent
      );

      const nextEx = i < exercises.length - 1 ? exercises[i + 1] : null;
      const segments = await generateExerciseSequence({
        exercise,
        exerciseNumber: i + 1,
        totalExercises,
        nextExerciseDisplayName: nextEx ? (nextEx.friendly_name || nextEx.name) : null,
        nextExercisePosition: nextEx ? nextEx.position_type : null,
        assets: assets[exercise.id],
        resolution,
        tempDir
      });

      exerciseSegments.push(...segments);
    }

    // Step 4: Generate outro screen
    await updateJobStatus(supabase, jobId, 'processing', 'Creating outro screen', 85);
    const outroScreen = await generateOutroScreen({
      routineName,
      exerciseCount: exercises.length,
      totalDuration,
      level,
      condition,
      resolution,
      tempDir
    });

    // Close browser before heavy FFmpeg work to free memory
    try {
      await closeBrowser();
    } catch (e) {
      console.error('Early browser close error:', e);
    }

    // Step 5: Assemble all segments into final video
    await updateJobStatus(supabase, jobId, 'processing', 'Assembling final video', 90);
    const finalVideoPath = path.join(tempDir, 'final.mp4');

    await assembleVideo({
      segments: [...introScreens, ...exerciseSegments, outroScreen],
      outputPath: finalVideoPath,
      resolution
    });

    // Step 6: Upload to Supabase Storage
    await updateJobStatus(supabase, jobId, 'processing', 'Uploading video', 95);
    const videoUrl = await uploadVideo(supabase, jobId, finalVideoPath);

    // Step 7: Get file stats
    const stats = await fs.stat(finalVideoPath);
    const fileSizeMB = stats.size / (1024 * 1024);

    // Step 8: Mark as complete
    await supabase
      .from('video_jobs')
      .update({
        status: 'completed',
        output_url: videoUrl,
        file_size_mb: fileSizeMB,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    console.log(`Video generation completed for job ${jobId}`);

  } catch (error) {
    console.error('Video generation error:', error);

    await supabase
      .from('video_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

  } finally {
    try {
      await closeBrowser();
    } catch (browserError) {
      console.error('Browser cleanup error:', browserError);
    }
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}

async function updateJobStatus(supabase, jobId, status, currentStep, progressPercent) {
  await supabase
    .from('video_jobs')
    .update({
      status,
      current_step: currentStep,
      progress_percentage: progressPercent
    })
    .eq('id', jobId);
}

async function generateIntroScreens({ routineName, exerciseCount, totalDuration, equipment, subtitle, level, condition, thumbnailImageUrl, resolution, tempDir }) {
  const screens = [];
  const dimensions = resolution === '1080p' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };

  // Thumbnail (2 seconds, no audio — YouTube-style cover frame)
  const thumbnailPath = await renderScreenToImage({
    type: 'thumbnail',
    data: { routineName, totalDuration, overlayImageUrl: thumbnailImageUrl },
    dimensions,
    outputPath: path.join(tempDir, 'intro-00-thumbnail.png')
  });
  screens.push({ type: 'image', path: thumbnailPath, duration: 2 });

  const titleCardPath = await renderScreenToImage({
    type: 'title-card',
    data: { routineName, exerciseCount, totalDuration, subtitle, level, condition },
    dimensions,
    outputPath: path.join(tempDir, 'intro-01-title.png')
  });
  screens.push({ type: 'image', path: titleCardPath, duration: 10, audioUrl: AUDIO_CLIPS['title-card'] });

  const trackerReminderPath = await renderScreenToImage({
    type: 'tracker-reminder',
    data: {},
    dimensions,
    outputPath: path.join(tempDir, 'intro-02-tracker.png')
  });
  screens.push({ type: 'image', path: trackerReminderPath, duration: 10, audioUrl: AUDIO_CLIPS['tracker-reminder'] });

  const equipmentPath = await renderScreenToImage({
    type: 'equipment',
    data: { items: equipment },
    dimensions,
    outputPath: path.join(tempDir, 'intro-03-equipment.png')
  });
  screens.push({ type: 'image', path: equipmentPath, duration: 10, audioUrl: AUDIO_CLIPS['equipment'] });

  const letsStartPath = await renderScreenToImage({
    type: 'lets-start',
    data: {},
    dimensions,
    outputPath: path.join(tempDir, 'intro-04-start.png')
  });
  screens.push({ type: 'image', path: letsStartPath, duration: 10, audioUrl: AUDIO_CLIPS['lets-start'] });

  return screens;
}

async function generateExerciseSequence({
  exercise,
  exerciseNumber,
  totalExercises,
  nextExerciseDisplayName,
  nextExercisePosition,
  assets,
  resolution,
  tempDir
}) {
  const segments = [];
  const dimensions = resolution === '1080p' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
  const progressDots = generateProgressDots(exerciseNumber, totalExercises);

  const displayName = exercise.friendly_name || exercise.name;
  const timeDisplay = exercise.time_display || `${exercise.duration_minutes} min`;
  const tags = exercise.tags || [];
  const startSide = (exercise.start_side || 'right').toLowerCase();
  const firstSide = startSide === 'left' ? 'LEFT' : 'RIGHT';
  const secondSide = firstSide === 'RIGHT' ? 'LEFT' : 'RIGHT';
  const isBilateral = exercise.bilateral === 'yes';

  // Watch and Learn (audio: 4s, slide: 6s)
  const watchLearnPath = await renderScreenToImage({
    type: 'watch-learn',
    data: {
      exerciseName: displayName,
      exerciseNumber,
      totalExercises,
      duration: timeDisplay,
      coachingCue: exercise.coaching_cue,
      focus: exercise.focus,
      positionType: exercise.position_type,
      tags,
      progressDots
    },
    dimensions,
    outputPath: path.join(tempDir, `ex${exerciseNumber}-01-watch.png`)
  });
  segments.push({ type: 'image', path: watchLearnPath, duration: 6, audioUrl: AUDIO_CLIPS['watch-learn'] });

  // Exercise Video
  segments.push({ type: 'video', path: assets.videoPath });

  // Your Turn (audio: 3s single / 4s bilateral, slide: 5s single / 6s bilateral)
  const yourTurnAudio = !isBilateral
    ? AUDIO_CLIPS['your-turn']
    : firstSide === 'RIGHT'
      ? AUDIO_CLIPS['your-turn-right']
      : AUDIO_CLIPS['your-turn-left'];

  const yourTurnPath = await renderScreenToImage({
    type: 'your-turn',
    data: {
      exerciseName: displayName,
      exerciseNumber,
      totalExercises,
      duration: timeDisplay,
      coachingCue: exercise.coaching_cue,
      focus: exercise.focus,
      bilateral: exercise.bilateral,
      side: firstSide,
      positionType: exercise.position_type,
      tags,
      progressDots
    },
    dimensions,
    outputPath: path.join(tempDir, `ex${exerciseNumber}-03-yourturn.png`)
  });
  segments.push({ type: 'image', path: yourTurnPath, duration: isBilateral ? 6 : 5, audioUrl: yourTurnAudio });

  // Practice with countdown
  if (isBilateral) {
    const halfDuration = exercise.duration_minutes * 30;
    const firstImagePath = firstSide === 'RIGHT' ? assets.rightImagePath : assets.leftImagePath;
    const secondImagePath = firstSide === 'RIGHT' ? assets.leftImagePath : assets.rightImagePath;

    // First side
    const firstImageDataUri = firstImagePath ? await fileToDataUri(firstImagePath) : null;
    const firstPracticePath = await renderScreenToImage({
      type: 'practice-countdown',
      data: {
        exerciseName: displayName,
        exerciseNumber,
        totalExercises,
        imagePath: firstImageDataUri,
        coachingCue: exercise.coaching_cue,
        side: firstSide,
        duration: halfDuration,
        timeDisplay: timeDisplay,
        tags,
        progressDots
      },
      dimensions,
      outputPath: path.join(tempDir, `ex${exerciseNumber}-04-first.png`)
    });
    segments.push({
      type: 'countdown-overlay',
      imagePath: firstPracticePath,
      duration: halfDuration,
      coachingCue: exercise.coaching_cue,
      progressDots,
      resolution
    });

    // Switch sides (audio: 4s, slide: 6s)
    const switchPath = await renderScreenToImage({
      type: 'switch-sides',
      data: {
        exerciseName: displayName,
        exerciseNumber,
        totalExercises,
        secondSide,
        progressDots
      },
      dimensions,
      outputPath: path.join(tempDir, `ex${exerciseNumber}-05-switch.png`)
    });
    segments.push({ type: 'image', path: switchPath, duration: 6, audioUrl: AUDIO_CLIPS['switch-sides'] });

    // Second side
    const secondImageDataUri = secondImagePath ? await fileToDataUri(secondImagePath) : null;
    const secondPracticePath = await renderScreenToImage({
      type: 'practice-countdown',
      data: {
        exerciseName: displayName,
        exerciseNumber,
        totalExercises,
        imagePath: secondImageDataUri,
        coachingCue: exercise.coaching_cue,
        side: secondSide,
        duration: halfDuration,
        timeDisplay: timeDisplay,
        tags,
        progressDots
      },
      dimensions,
      outputPath: path.join(tempDir, `ex${exerciseNumber}-06-second.png`)
    });
    segments.push({
      type: 'countdown-overlay',
      imagePath: secondPracticePath,
      duration: halfDuration,
      coachingCue: exercise.coaching_cue,
      progressDots,
      resolution
    });
  } else {
    // Non-bilateral
    const duration = exercise.duration_minutes * 60;
    const mainImageDataUri = assets.mainImagePath ? await fileToDataUri(assets.mainImagePath) : null;
    const practicePath = await renderScreenToImage({
      type: 'practice-countdown',
      data: {
        exerciseName: displayName,
        exerciseNumber,
        totalExercises,
        imagePath: mainImageDataUri,
        coachingCue: exercise.coaching_cue,
        duration,
        timeDisplay: timeDisplay,
        tags,
        progressDots
      },
      dimensions,
      outputPath: path.join(tempDir, `ex${exerciseNumber}-04-practice.png`)
    });
    segments.push({
      type: 'countdown-overlay',
      imagePath: practicePath,
      duration,
      coachingCue: exercise.coaching_cue,
      progressDots,
      resolution
    });
  }

  // Exercise Complete (audio: 2s normal / 3s last, slide: 4s normal / 5s last)
  const isLastExercise = !nextExerciseDisplayName;
  const completePath = await renderScreenToImage({
    type: 'exercise-complete',
    data: {
      exerciseName: displayName,
      exerciseNumber,
      totalExercises,
      nextExerciseName: nextExerciseDisplayName,
      nextExercisePosition: nextExercisePosition,
      progressDots
    },
    dimensions,
    outputPath: path.join(tempDir, `ex${exerciseNumber}-07-complete.png`)
  });
  segments.push({ type: 'image', path: completePath, duration: isLastExercise ? 5 : 4, audioUrl: isLastExercise ? AUDIO_CLIPS['exercise-complete-last'] : AUDIO_CLIPS['exercise-complete'] });

  return segments;
}

async function generateOutroScreen({ routineName, exerciseCount, totalDuration, level, condition, resolution, tempDir }) {
  const dimensions = resolution === '1080p' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };

  const outroPath = await renderScreenToImage({
    type: 'outro',
    data: { routineName, exerciseCount, totalDuration, level, condition },
    dimensions,
    outputPath: path.join(tempDir, 'outro-complete.png')
  });

  return { type: 'image', path: outroPath, duration: 9, audioUrl: AUDIO_CLIPS['outro'] };
}

function generateProgressDots(current, total) {
  let dots = '';
  for (let i = 1; i <= total; i++) {
    if (i < current) {
      dots += '\u2713';
    } else if (i === current) {
      dots += '\u25CF';
    } else {
      dots += '\u25CB';
    }
  }
  return dots;
}

async function uploadVideo(supabase, jobId, videoPath) {
  const videoBuffer = await fs.readFile(videoPath);
  const filename = `routine_${jobId}.mp4`;
  const storagePath = `generated-videos/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(storagePath, videoBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from('videos')
    .getPublicUrl(storagePath);

  return data.publicUrl;
}
