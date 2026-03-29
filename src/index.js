import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateVideo } from './videoGenerator.js';
import { createClient } from '@supabase/supabase-js';

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

// ─── Vimeo Upload (pull approach) ───
app.post('/api/vimeo/upload', async (req, res) => {
  try {
    const { videoUrl, title, description } = req.body;
    const vimeoToken = process.env.VIMEO_ACCESS_TOKEN;

    if (!vimeoToken) {
      return res.status(500).json({ error: 'VIMEO_ACCESS_TOKEN not configured on server' });
    }
    if (!videoUrl) {
      return res.status(400).json({ error: 'videoUrl is required' });
    }

    console.log(`[Vimeo] Uploading: ${title || 'Untitled'}`);

    // Create video via pull approach — Vimeo fetches from URL
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

    console.log(`[Vimeo] Upload started: ${vimeoLink} (processing will continue on Vimeo)`);

    // Add to Vimeo project/folder if configured
    const projectUri = process.env.VIMEO_PROJECT_URI; // e.g. "/users/251550913/projects/28754524"
    if (projectUri && vimeoId) {
      try {
        const projRes = await fetch(`https://api.vimeo.com${projectUri}/videos/${vimeoId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `bearer ${vimeoToken}`,
            'Accept': 'application/vnd.vimeo.*+json;version=3.4',
          },
        });
        if (projRes.ok) {
          console.log(`[Vimeo] Added to project: ${projectUri}`);
        } else {
          console.warn(`[Vimeo] Project add failed: ${projRes.status} — continuing without project`);
        }
      } catch (projErr) {
        console.warn(`[Vimeo] Project add error: ${projErr.message} — continuing without project`);
      }
    }

    res.json({
      success: true,
      vimeoId,
      vimeoUri,
      vimeoLink,
      playerEmbed,
      status: vimeoData.status, // "uploading" → "transcoding" → "available"
    });

  } catch (error) {
    console.error('[Vimeo] Upload error:', error);
    res.status(500).json({ error: 'Vimeo upload failed', details: error.message });
  }
});
