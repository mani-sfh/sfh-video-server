import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';

const CONCURRENT_DOWNLOADS = 6;

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

export async function downloadAssets(exercises, tempDir, resolution = '720p') {
  const assets = {};
  const downloadTasks = [];

  for (const exercise of exercises) {
    const exerciseAssets = { videoPath: null, mainImagePath: null, leftImagePath: null, rightImagePath: null };
    assets[exercise.id] = exerciseAssets;

    const videoUrl = exercise.download_url || exercise.vimeo_download_url_1080 || exercise.vimeo_download_url_720 || exercise.local_video_url;
    if (videoUrl) {
      const videoPath = path.join(tempDir, `video_${exercise.id}.mp4`);
      downloadTasks.push(() =>
        downloadFile(videoUrl, videoPath)
          .then(() => { exerciseAssets.videoPath = videoPath; })
          .catch((err) => { console.error(`Failed video for ${exercise.name}: ${err.message}`); })
      );
    }

    if (exercise.main_image_url) {
      const ext = exercise.main_image_url.match(/\.(png|jpg|jpeg|gif|webp)/i)?.[0] || '.png';
      const mainImagePath = path.join(tempDir, `main_${exercise.id}${ext}`);
      downloadTasks.push(() =>
        downloadFile(exercise.main_image_url, mainImagePath)
          .then(() => { exerciseAssets.mainImagePath = mainImagePath; })
          .catch(err => { console.error(`Failed main image for ${exercise.name}:`, err.message); })
      );
    }

    if (exercise.bilateral === 'yes') {
      if (exercise.left_image_url) {
        const ext = exercise.left_image_url.match(/\.(png|jpg|jpeg|gif|webp)/i)?.[0] || '.png';
        const leftImagePath = path.join(tempDir, `left_${exercise.id}${ext}`);
        downloadTasks.push(() =>
          downloadFile(exercise.left_image_url, leftImagePath)
            .then(() => { exerciseAssets.leftImagePath = leftImagePath; })
            .catch(err => { console.error(`Failed left image for ${exercise.name}:`, err.message); })
        );
      }
      if (exercise.right_image_url) {
        const ext = exercise.right_image_url.match(/\.(png|jpg|jpeg|gif|webp)/i)?.[0] || '.png';
        const rightImagePath = path.join(tempDir, `right_${exercise.id}${ext}`);
        downloadTasks.push(() =>
          downloadFile(exercise.right_image_url, rightImagePath)
            .then(() => { exerciseAssets.rightImagePath = rightImagePath; })
            .catch(err => { console.error(`Failed right image for ${exercise.name}:`, err.message); })
        );
      }
    }
  }

  console.log(`Downloading ${downloadTasks.length} assets with ${CONCURRENT_DOWNLOADS} concurrent connections`);
  await runBatched(downloadTasks, CONCURRENT_DOWNLOADS);
  return assets;
}

function downloadFile(url, outputPath, maxRedirects = 10) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) { reject(new Error(`Too many redirects for ${url}`)); return; }
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        let redirectUrl = response.headers.location;
        if (redirectUrl.startsWith('/')) { const parsed = new URL(url); redirectUrl = `${parsed.protocol}//${parsed.host}${redirectUrl}`; }
        downloadFile(redirectUrl, outputPath, maxRedirects - 1).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) { reject(new Error(`Failed ${url}: ${response.statusCode}`)); return; }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', async () => {
        try { const buffer = Buffer.concat(chunks); await fs.writeFile(outputPath, buffer); console.log(`Downloaded: ${path.basename(outputPath)} (${buffer.length} bytes)`); resolve(outputPath); }
        catch (error) { reject(error); }
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}
