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
    const { jobId, routineName, exercises, resolution = '720p', totalDuration, equipment, subtitle, level, condition } = req.body;

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
