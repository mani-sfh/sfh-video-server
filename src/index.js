import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateVideo } from './videoGenerator.js';
import { renderScreenToImage, initBrowser } from './screenRenderer.js';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { promises as fs } from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

let supabase = null;

function getSupabase() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
    }
    supabase = createClient(url, key);
  }
  return supabase;
}

app.get('/health', (req, res) => {
  const hasSupabaseConfig = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  res.json({
    status: hasSupabaseConfig ? 'ok' : 'misconfigured',
    service: 'sfh-video-server',
    supabaseConfigured: hasSupabaseConfig,
  });
});

app.post('/api/video/generate', async (req, res) => {
  try {
    const { jobId, routineName, exercises, resolution = '720p', totalDuration, equipment, subtitle, level, condition, thumbnailImageUrl, thumbnailBadge, thumbnailTitle } = req.body;

    if (!jobId || !routineName || !exercises || !Array.isArray(exercises)) {
      return res.status(400).json({
        error: 'Missing required fields: jobId, routineName, exercises'
      });
    }

    if (!['720p', '1080p'].includes(resolution)) {
      return res.status(400).json({
        error: 'Invalid resolution. Must be 720p or 1080p'
      });
    }

    const sb = getSupabase();

    res.status(202).json({
      success: true,
      jobId,
      message: 'Video generation started'
    });

    generateVideo({
      jobId,
      routineName,
      exercises,
      resolution,
      totalDuration,
      equipment,
      subtitle,
      level,
      condition,
      thumbnailImageUrl,
      thumbnailBadge,
      thumbnailTitle,
      supabase: sb
    }).catch(error => {
      console.error('Video generation failed:', error);
    });

  } catch (error) {
    console.error('Error in /api/video/generate:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

app.get('/api/video/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { data, error } = await getSupabase()
      .from('video_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) return res.status(404).json({ error: 'Job not found' });
    res.json(data);
  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`SFH Video Server running on port ${PORT}`);
});

// ─── Vimeo: List folders/projects (to find correct URI) ───
app.get('/api/vimeo/folders', async (req, res) => {
  try {
    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;
    if (!vimeoToken) return res.status(500).json({ error: 'VIMEO_ACCESS_TOKEN not configured' });

    const vimeoRes = await fetch('https://api.vimeo.com/me/projects?per_page=50&sort=name&direction=asc', {
      headers: {
        'Authorization': `bearer ${vimeoToken}`,
        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
      },
    });

    if (!vimeoRes.ok) {
      const errText = await vimeoRes.text();
      return res.status(vimeoRes.status).json({ error: 'Vimeo API error', details: errText });
    }

    const data = await vimeoRes.json();
    const folders = (data.data || []).map(f => ({
      name: f.name,
      uri: f.uri,
      link: f.link,
      videoCount: f.metadata?.connections?.videos?.total || 0,
      created: f.created_time,
    }));

    res.json({ folders, currentConfig: process.env.VIMEO_PROJECT_URI || '(not set)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Vimeo Upload (pull approach) ───
app.post('/api/vimeo/upload', async (req, res) => {
  try {
    const { videoUrl, title, description, thumbnailUrl } = req.body;
    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;

    if (!vimeoToken) {
      return res.status(500).json({ error: 'VIMEO_ACCESS_TOKEN not configured on server' });
    }
    if (!videoUrl) {
      return res.status(400).json({ error: 'videoUrl is required' });
    }

    console.log(`[Vimeo] Uploading: ${title || 'Untitled'}`);

    // Step 1: Create video via pull approach
    const vimeoRes = await fetch('https://api.vimeo.com/me/videos', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${vimeoToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
      },
      body: JSON.stringify({
        upload: { approach: 'pull', link: videoUrl },
        name: title || 'SFH Routine',
        description: description || 'Senior Fitness Hub follow-along routine',
        privacy: {
          view: 'disable',
          embed: 'whitelist',
          download: false,
        },
        embed: {
          buttons: { like: false, watchlater: false, share: false },
          logos: { vimeo: false },
          title: { name: 'hide', owner: 'hide', portrait: 'hide' },
        },
        embed_domains: [
          'learn.senior-fitness-hub.com',
          'seniorfitnesshub.com',
          'senior-fitness-hub.com',
          'pages.senior-fitness-hub.com',
          'app.membervault.co',
        ],
      }),
    });

    if (!vimeoRes.ok) {
      const errText = await vimeoRes.text();
      console.error('[Vimeo] Upload failed:', vimeoRes.status, errText);
      return res.status(vimeoRes.status).json({ error: 'Vimeo API error', details: errText });
    }

    const vimeoData = await vimeoRes.json();
    const vimeoUri = vimeoData.uri; // "/videos/12345678"
    const vimeoId = vimeoUri?.replace('/videos/', '') || null;
    const vimeoLink = vimeoData.link || `https://vimeo.com/${vimeoId}`;
    const playerEmbed = vimeoData.embed?.html || null;

    console.log(`[Vimeo] Video created: ${vimeoLink}`);

    // Step 2: Move video into folder
    const projectUri = process.env.VIMEO_PROJECT_URI; // "/users/251550913/projects/28754524"
    if (projectUri && vimeoId) {
      // Extract just the project ID number
      const projectId = projectUri.split('/projects/')[1];
      if (projectId) {
        try {
          const addRes = await fetch(`https://api.vimeo.com/me/projects/${projectId}/videos/${vimeoId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `bearer ${vimeoToken}`,
              'Accept': 'application/vnd.vimeo.*+json;version=3.4',
            },
          });
          if (addRes.ok || addRes.status === 204) {
            console.log(`[Vimeo] ✓ Added to folder: project ${projectId}`);
          } else {
            const errText = await addRes.text();
            console.warn(`[Vimeo] Folder add failed (${addRes.status}): ${errText}`);
          }
        } catch (projErr) {
          console.warn(`[Vimeo] Folder add error: ${projErr.message}`);
        }
      }
    }

    // Step 3: Set custom thumbnail if provided
    if (thumbnailUrl && vimeoId) {
      try {
        console.log(`[Vimeo] Setting custom thumbnail...`);

        // Download the thumbnail image
        const imgRes = await fetch(thumbnailUrl);
        if (!imgRes.ok) throw new Error(`Failed to download thumbnail: ${imgRes.status}`);
        const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
        const contentType = imgRes.headers.get('content-type') || 'image/png';

        // Create a picture resource on Vimeo
        const picRes = await fetch(`https://api.vimeo.com/videos/${vimeoId}/pictures`, {
          method: 'POST',
          headers: {
            'Authorization': `bearer ${vimeoToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.vimeo.*+json;version=3.4',
          },
          body: JSON.stringify({ active: true }),
        });

        if (!picRes.ok) throw new Error(`Picture create failed: ${picRes.status}`);
        const picData = await picRes.json();
        const uploadLink = picData.link;

        // Upload the image
        if (uploadLink) {
          const upRes = await fetch(uploadLink, {
            method: 'PUT',
            headers: { 'Content-Type': contentType },
            body: imgBuffer,
          });
          if (upRes.ok || upRes.status === 204) {
            console.log(`[Vimeo] ✓ Custom thumbnail set`);
          } else {
            console.warn(`[Vimeo] Thumbnail upload response: ${upRes.status}`);
          }
        }
      } catch (thumbErr) {
        console.warn(`[Vimeo] Thumbnail error: ${thumbErr.message}`);
      }
    }

    res.json({
      success: true,
      vimeoId,
      vimeoUri,
      vimeoLink,
      playerEmbed,
      status: vimeoData.status,
    });

  } catch (error) {
    console.error('[Vimeo] Upload error:', error);
    res.status(500).json({ error: 'Vimeo upload failed', details: error.message });
  }
});

// ─── Thumbnail Only: Generate and upload thumbnail PNG ───
app.post('/api/thumbnail/generate', async (req, res) => {
  try {
    const { routineName, totalDuration, thumbnailImageUrl, thumbnailBadge, thumbnailTitle, resolution } = req.body;

    if (!routineName) {
      return res.status(400).json({ error: 'routineName is required' });
    }

    const supabase = getSupabase();
    const dims = resolution === '1080p' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
    const tempDir = path.join(process.cwd(), 'temp', `thumb_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    try {
      await initBrowser();

      // Render thumbnail slide
      const thumbPath = await renderScreenToImage({
        type: 'thumbnail',
        data: {
          routineName,
          totalDuration: totalDuration || '',
          overlayImageUrl: thumbnailImageUrl || undefined,
          badgeText: thumbnailBadge || undefined,
          titleText: thumbnailTitle || undefined,
        },
        dimensions: dims,
        outputPath: path.join(tempDir, 'thumbnail.png'),
      });

      // Upload to Supabase Storage with descriptive filename
      const thumbBuffer = await fs.readFile(thumbPath);
      const safeName = (str) => (str || '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 60);
      const shortId = Date.now().toString(36);
      const badgePart = safeName(thumbnailBadge || totalDuration);
      const titlePart = safeName(thumbnailTitle || routineName);
      const thumbFilename = `${badgePart}_${titlePart}_${shortId}.png`;
      const thumbStoragePath = `thumbnails/${thumbFilename}`;

      const { error: uploadErr } = await supabase.storage
        .from('videos')
        .upload(thumbStoragePath, thumbBuffer, { contentType: 'image/png', upsert: true });

      if (uploadErr) {
        throw new Error(`Storage upload failed: ${uploadErr.message}`);
      }

      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(thumbStoragePath);

      console.log(`[Thumbnail Only] Generated: ${urlData.publicUrl}`);

      res.json({
        success: true,
        thumbnailUrl: urlData.publicUrl,
        filename: thumbFilename,
      });

    } finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }

  } catch (error) {
    console.error('[Thumbnail Only] Error:', error);
    res.status(500).json({ error: 'Thumbnail generation failed', details: error.message });
  }
});
