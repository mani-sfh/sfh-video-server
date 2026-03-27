# SFH Video Server — Railway Backend

Video processing server for Senior Fitness Hub Routine Video Builder.
Downloads exercise videos, renders branded HTML screens, and stitches everything into MP4s.

## Setup

1. Deploy to Railway (auto-detects Dockerfile)
2. Add environment variables:
   - `SUPABASE_URL` — your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key
   - `PORT` — 3000 (default)
3. Generate a public domain in Railway Settings → Networking

## Files

- `Dockerfile` — Installs Node 20, ffmpeg, Chromium
- `src/index.js` — Express server with /api/video/generate endpoint
- `src/videoGenerator.js` — Main pipeline (download → render → assemble → upload)
- `src/assetDownloader.js` — Downloads Vimeo videos and exercise images
- `src/screenRenderer.js` — Puppeteer HTML-to-image rendering
- `src/screenTemplates.js` — Branded HTML templates for all video screens
- `src/videoAssembler.js` — FFmpeg video encoding and concatenation

## Important

`screenTemplates.js` and `videoGenerator.js` must be copied from your Bolt project.
These files contain the complete implementation that matches your frontend.

## Related

- **sfh-video-frontend** — Vercel frontend (separate repo)

## License

Private — Senior Fitness Hub © 2026
