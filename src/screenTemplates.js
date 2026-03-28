const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Petrona:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');`;

const COLORS = {
  navy: '#0C115B',
  crimson: '#A61E51',
  teal: '#0F766E',
  cream: '#FFFBF7',
  white: '#FFFFFF',
  pinkLight: '#f9a8c9',
  warmGray: '#4A4A4A',
  green: '#16a34a',
};

let _screenWidth = 1280;
let _screenHeight = 720;

function setDimensions(w, h) {
  _screenWidth = w;
  _screenHeight = h;
}

function baseHTML(bodyStyle, content) {
  return `<!DOCTYPE html><html><head><style>
${FONTS}
*{margin:0;padding:0;box-sizing:border-box;}
body{width:${_screenWidth}px;height:${_screenHeight}px;overflow:hidden;font-family:'Quicksand',sans-serif;font-weight:600;${bodyStyle}}
</style></head><body>${content}</body></html>`;
}

// SVG Icons
const ICONS = {
  clipboard: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${COLORS.crimson}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>`,
  pause: `<svg width="22" height="22" viewBox="0 0 24 24" fill="${COLORS.crimson}" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
  play: `<svg width="32" height="32" viewBox="0 0 24 24" fill="${COLORS.teal}" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>`,
  playWhite: `<svg width="60" height="60" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>`,
  checkTeal: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${COLORS.teal}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkWhite: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${COLORS.white}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  switchArrows: `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${COLORS.crimson}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8l4 4-4 4"/><path d="M2 12h20"/><path d="M6 16l-4-4 4-4"/></svg>`,
};

function sfhLogo(size = 'sm') {
  const fontSize = size === 'lg' ? '16px' : '14px';
  return `<p style="font-size:${fontSize};letter-spacing:4px;color:rgba(255,255,255,0.8);font-weight:700;text-transform:uppercase;">SENIOR FITNESS <span style="color:${COLORS.pinkLight};">HUB</span></p>`;
}

function tagline() {
  return `<p style="font-size:14px;color:rgba(255,255,255,0.5);font-weight:700;margin-top:16px;">Practice with purpose. Move with confidence. Live with independence.</p>`;
}

function progressDotsHTML(current, total) {
  let dots = '';
  for (let i = 1; i <= total; i++) {
    if (i < current) {
      dots += `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${COLORS.crimson}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin:0 3px;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (i === current) {
      dots += `<svg width="14" height="14" viewBox="0 0 24 24" style="margin:0 3px;vertical-align:middle;"><circle cx="12" cy="12" r="10" fill="${COLORS.navy}"/></svg>`;
    } else {
      dots += `<svg width="14" height="14" viewBox="0 0 24 24" style="margin:0 3px;vertical-align:middle;"><circle cx="12" cy="12" r="9" fill="none" stroke="rgba(12,17,91,0.25)" stroke-width="2"/></svg>`;
    }
  }
  return `<div style="background:${COLORS.cream};border-bottom:2px solid rgba(12,17,91,0.08);padding:10px 20px;display:flex;align-items:center;justify-content:space-between;width:100%;">
    <div style="display:flex;align-items:center;">${dots}</div>
    <span style="font-size:14px;font-weight:700;color:${COLORS.navy};">Exercise ${current} of ${total}</span>
  </div>`;
}

function tagsHTML(tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return '';
  const tagBadges = tags.map(tag =>
    `<span style="display:inline-block;background:rgba(15,118,110,0.1);color:${COLORS.teal};font-size:11px;font-weight:700;padding:3px 10px;border-radius:12px;margin:2px 3px;">${esc(tag)}</span>`
  ).join('');
  return `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:2px;margin-top:8px;">${tagBadges}</div>`;
}

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const CHARACTER_OVERLAY_URL = 'https://assets.cdn.filesafe.space/Tg27dC86DFaiDsilRpae/media/69c71bf95eea83c015473d3c.png';

export function thumbnail(routineName, totalMinutes, overlayImageUrl) {
  const durationBadge = esc(String(totalMinutes));
  const nameLines = esc(routineName).toUpperCase();
  const personUrl = overlayImageUrl || CHARACTER_OVERLAY_URL;
  const is1080 = _screenWidth >= 1920;

  return `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box;}
@font-face{font-family:'Impact';src:local('Impact'),local('Arial Black');}
body{width:${_screenWidth}px;height:${_screenHeight}px;overflow:hidden;font-family:Impact,'Arial Black',Arial,sans-serif;background:#080808;}
.bg{position:absolute;inset:0;background:linear-gradient(135deg,#0a0a0a 0%,#1a1018 40%,#0f0a12 100%);}
.glow{position:absolute;right:5%;top:-10%;width:50%;height:120%;background:radial-gradient(ellipse at 50% 50%,rgba(166,30,81,0.22) 0%,transparent 60%);}
.vignette{position:absolute;inset:0;background:radial-gradient(ellipse at 70% 50%,transparent 30%,rgba(0,0,0,0.5) 100%);z-index:3;}
.accent{position:absolute;left:4.2%;top:50%;transform:translateY(-50%);width:${is1080 ? '6px' : '5px'};height:30%;background:${COLORS.crimson};border-radius:3px;z-index:4;}
.content{position:absolute;left:6%;top:50%;transform:translateY(-50%);max-width:52%;z-index:5;}
.badge{display:inline-block;background:#E65100;color:#fff;font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:900;font-size:${is1080 ? '40px' : '28px'};padding:${is1080 ? '8px 22px' : '6px 16px'};border-radius:6px;margin-bottom:${is1080 ? '18px' : '12px'};letter-spacing:1px;}
.title{color:#ffffff;font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:900;font-size:${is1080 ? '80px' : '54px'};line-height:1.05;text-transform:uppercase;letter-spacing:2px;text-shadow:0 3px 30px rgba(0,0,0,0.7);}
.person{position:absolute;right:2%;bottom:0;height:92%;z-index:2;}
.person img{height:100%;width:auto;object-fit:contain;object-position:bottom right;}
</style></head><body>
<div class="bg"></div>
<div class="glow"></div>
<div class="person"><img src="${personUrl}" alt="" /></div>
<div class="vignette"></div>
<div class="accent"></div>
<div class="content">
  <div class="badge">${durationBadge}</div>
  <div class="title">${nameLines}</div>
</div>
</body></html>`;
}

export function titleCard(routineName, exerciseCount, totalMinutes, subtitle, level, condition) {
  const levelHTML = level
    ? `<span style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:${COLORS.white};font-size:13px;font-weight:700;padding:5px 18px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">${esc(level)}</span>`
    : '';
  const subtitleHTML = subtitle
    ? `<p style="font-size:22px;color:rgba(255,255,255,0.85);font-weight:600;font-style:italic;margin-bottom:12px;max-width:80%;">${esc(subtitle)}</p>`
    : '';
  const conditionHTML = condition
    ? `<span style="display:inline-block;background:rgba(15,118,110,0.8);color:${COLORS.white};font-size:14px;font-weight:700;padding:6px 18px;border-radius:20px;margin-top:8px;">${esc(condition)}</span>`
    : '';

  return baseHTML(
    `background:linear-gradient(135deg,${COLORS.navy} 0%,${COLORS.crimson} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px;`,
    `${sfhLogo('lg')}
    <div style="width:200px;height:2px;background:rgba(255,255,255,0.3);margin:20px 0;"></div>
    ${levelHTML}
    <h1 style="font-family:Petrona,Georgia,serif;font-size:44px;font-weight:700;color:${COLORS.white};line-height:1.2;margin-bottom:12px;">${esc(routineName)}</h1>
    ${subtitleHTML}
    <p style="font-size:20px;color:rgba(255,255,255,0.9);font-weight:700;">${exerciseCount} Exercises &middot; ${esc(String(totalMinutes))}</p>
    ${conditionHTML}
    <div style="width:200px;height:2px;background:rgba(255,255,255,0.3);margin:20px 0;"></div>
    ${tagline()}`
  );
}

export function trackerReminder() {
  return baseHTML(
    `background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px;`,
    `<div style="width:80px;height:80px;border-radius:50%;background:rgba(166,30,81,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
      ${ICONS.clipboard}
    </div>
    <h2 style="font-family:Petrona,Georgia,serif;font-size:34px;font-weight:700;color:${COLORS.navy};margin-bottom:4px;">Haven't Downloaded Your</h2>
    <h2 style="font-family:Petrona,Georgia,serif;font-size:34px;font-weight:700;color:${COLORS.navy};">Progress Tracker Yet?</h2>
    <div style="width:64px;height:4px;background:${COLORS.crimson};border-radius:2px;margin:16px auto;"></div>
    <p style="font-size:22px;color:${COLORS.crimson};font-weight:700;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:8px;">${ICONS.pause} Pause the video now</p>
    <p style="font-size:16px;color:${COLORS.warmGray};font-weight:700;">Download your tracker and follow along.</p>`
  );
}

export function equipment(items) {
  const list = (items || ['Exercise mat or firm surface', 'Sturdy chair without wheels', 'Wall space for support', 'Comfortable, non-slip footwear']);
  const bulletSVG = `<svg width="12" height="12" viewBox="0 0 24 24" style="flex-shrink:0;margin-right:18px;"><circle cx="12" cy="12" r="8" fill="${COLORS.crimson}"/></svg>`;
  const listHTML = list.map(item =>
    `<li style="font-size:34px;color:${COLORS.navy};font-weight:700;padding:14px 0;display:flex;align-items:center;">
      ${bulletSVG}${esc(item)}
    </li>`
  ).join('');

  return baseHTML(
    `background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;`,
    `<h2 style="font-family:Petrona,Georgia,serif;font-size:48px;font-weight:700;color:${COLORS.navy};margin-bottom:40px;">Equipment Needed</h2>
    <div style="border-left:5px solid ${COLORS.teal};padding-left:32px;">
      <ul style="list-style:none;padding:0;margin:0;">${listHTML}</ul>
    </div>
    <div style="position:absolute;bottom:28px;">
      <p style="font-size:20px;letter-spacing:5px;color:rgba(12,17,91,0.4);font-weight:700;text-transform:uppercase;">SENIOR FITNESS <span style="color:${COLORS.crimson};">HUB</span></p>
    </div>`
  );
}

export function letsGo() {
  return baseHTML(
    `background:linear-gradient(135deg,${COLORS.navy} 0%,${COLORS.crimson} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px;`,
    `<h1 style="font-family:Petrona,Georgia,serif;font-size:42px;font-weight:700;color:${COLORS.white};">Let's Get Started!</h1>
    <p style="font-size:20px;color:rgba(255,255,255,0.8);font-weight:700;margin-top:12px;">Follow along at your own pace.</p>
    <div style="margin-top:24px;">${ICONS.playWhite}</div>`
  );
}

export function watchIntro(exNum, total, name, timeDisplay, cue, tags, focus, positionType) {
  const cueHTML = cue
    ? `<div style="border-left:4px solid ${COLORS.crimson};background:rgba(166,30,81,0.05);padding:10px 16px;border-radius:0 8px 8px 0;margin-top:12px;max-width:85%;">
        <p style="font-size:14px;color:${COLORS.navy};font-weight:700;text-align:center;">"${esc(cue)}"</p>
      </div>`
    : '';
  const focusHTML = focus
    ? `<p style="font-size:14px;color:${COLORS.warmGray};font-weight:600;font-style:italic;margin-top:8px;max-width:80%;text-align:center;line-height:1.4;">${esc(focus)}</p>`
    : '';
  const positionHTML = positionType
    ? `<span style="display:inline-block;background:rgba(12,17,91,0.08);color:${COLORS.navy};font-size:11px;font-weight:700;padding:3px 12px;border-radius:12px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">${esc(positionType)}</span>`
    : '';

  return baseHTML(
    `display:flex;flex-direction:column;`,
    `${progressDotsHTML(exNum, total)}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;background:${COLORS.cream};">
      <span style="background:${COLORS.crimson};color:${COLORS.white};font-size:14px;font-weight:700;padding:6px 16px;border-radius:20px;margin-bottom:12px;">Exercise ${exNum} of ${total}</span>
      ${positionHTML}
      <h2 style="font-family:Petrona,Georgia,serif;font-size:22px;font-weight:700;color:${COLORS.navy};margin-bottom:8px;">Watch and Learn</h2>
      <h3 style="font-family:Petrona,Georgia,serif;font-size:28px;font-weight:700;color:${COLORS.navy};margin-bottom:12px;text-align:center;">${esc(name)}</h3>
      <span style="background:${COLORS.teal};color:${COLORS.white};font-size:14px;font-weight:700;padding:6px 16px;border-radius:20px;margin-bottom:12px;">${esc(timeDisplay)}</span>
      ${tagsHTML(tags)}
      ${cueHTML}
      ${focusHTML}
    </div>`
  );
}

export function yourTurn(exNum, total, name, timeDisplay, cue, bilateral, side, tags, focus, positionType) {
  const sideHTML = bilateral
    ? `<span style="background:${COLORS.crimson};color:${COLORS.white};font-size:14px;font-weight:700;padding:6px 16px;border-radius:20px;margin-bottom:12px;">Starting: ${(side || 'RIGHT').toUpperCase()} SIDE</span>`
    : '';
  const cueHTML = cue
    ? `<div style="background:${COLORS.crimson};padding:10px 20px;border-radius:8px;margin-top:12px;max-width:80%;"><p style="font-size:16px;color:${COLORS.white};font-weight:700;text-align:center;">"${esc(cue)}"</p></div>`
    : '';
  const focusHTML = focus
    ? `<p style="font-size:13px;color:${COLORS.warmGray};font-weight:600;font-style:italic;margin-top:8px;max-width:75%;text-align:center;line-height:1.4;">${esc(focus)}</p>`
    : '';
  const positionHTML = positionType
    ? `<span style="display:inline-block;background:rgba(12,17,91,0.08);color:${COLORS.navy};font-size:11px;font-weight:700;padding:3px 12px;border-radius:12px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">${esc(positionType)}</span>`
    : '';

  return baseHTML(
    `display:flex;flex-direction:column;`,
    `${progressDotsHTML(exNum, total)}
    <div style="flex:1;background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;">
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(15,118,110,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
        ${ICONS.play}
      </div>
      ${positionHTML}
      <h2 style="font-family:Petrona,Georgia,serif;font-size:32px;font-weight:700;color:${COLORS.navy};margin-bottom:12px;">Now It's Your Turn!</h2>
      <h3 style="font-family:Petrona,Georgia,serif;font-size:22px;font-weight:700;color:${COLORS.navy};margin-bottom:12px;">${esc(name)}</h3>
      <span style="background:${COLORS.teal};color:${COLORS.white};font-size:14px;font-weight:700;padding:6px 16px;border-radius:8px;margin-bottom:12px;">${esc(timeDisplay)}</span>
      ${sideHTML}
      ${tagsHTML(tags)}
      ${cueHTML}
      ${focusHTML}
    </div>`
  );
}

export function practiceFrame(exNum, total, name, imageUrl, cue, timeRemaining, totalDuration, side, tags) {
  const sideBadge = side
    ? `<span style="position:absolute;top:16px;right:20px;background:${COLORS.crimson};color:${COLORS.white};font-size:16px;font-weight:700;padding:8px 20px;border-radius:20px;">${side.toUpperCase()} SIDE</span>`
    : '';

  const imageHTML = imageUrl
    ? `<img src="${imageUrl}" style="max-width:640px;max-height:420px;object-fit:contain;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.1);" />`
    : `<span style="font-size:16px;color:rgba(12,17,91,0.3);font-weight:700;">NO IMAGE</span>`;

  const cueHTML = cue
    ? `<p style="font-size:18px;color:${COLORS.crimson};font-weight:700;margin-top:12px;text-align:center;max-width:80%;">"${esc(cue)}"</p>`
    : '';

  return baseHTML(
    `display:flex;flex-direction:column;`,
    `${progressDotsHTML(exNum, total)}
    <div style="flex:1;background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 40px;position:relative;">
      ${sideBadge}
      <p style="font-family:Petrona,Georgia,serif;font-size:22px;font-weight:700;color:${COLORS.navy};margin-bottom:8px;">${esc(name)}</p>
      <div style="display:flex;align-items:center;justify-content:center;margin-bottom:8px;">
        ${imageHTML}
      </div>
      <span style="background:${COLORS.teal};color:${COLORS.white};font-size:14px;font-weight:700;padding:6px 16px;border-radius:20px;">${esc(String(totalDuration))}</span>
      ${cueHTML}
      <p style="position:absolute;bottom:8px;font-size:12px;letter-spacing:3px;color:rgba(12,17,91,0.25);font-weight:700;text-transform:uppercase;">SENIOR FITNESS <span style="color:${COLORS.crimson};">HUB</span></p>
    </div>`
  );
}

export function switchSides(exNum, total, name, secondSide) {
  const sideLabel = (secondSide || 'LEFT').toUpperCase();
  return baseHTML(
    `display:flex;flex-direction:column;`,
    `${progressDotsHTML(exNum, total)}
    <div style="flex:1;background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;">
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(166,30,81,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
        ${ICONS.switchArrows}
      </div>
      <h2 style="font-family:Petrona,Georgia,serif;font-size:36px;font-weight:700;color:${COLORS.navy};margin-bottom:12px;">Switch Sides</h2>
      <span style="background:${COLORS.crimson};color:${COLORS.white};font-size:16px;font-weight:700;padding:6px 20px;border-radius:20px;">Now: ${sideLabel} SIDE</span>
      ${name ? `<p style="font-size:16px;color:${COLORS.navy};font-weight:700;margin-top:12px;">${esc(name)}</p>` : ''}
    </div>`
  );
}

export function exerciseComplete(exNum, total, name, nextName, nextPosition) {
  const positionHint = nextPosition
    ? `<span style="display:inline-block;background:rgba(12,17,91,0.08);color:${COLORS.navy};font-size:12px;font-weight:700;padding:3px 14px;border-radius:12px;margin-top:6px;text-transform:uppercase;letter-spacing:0.5px;">${esc(nextPosition)}</span>`
    : '';
  const nextHTML = nextName
    ? `<div style="text-align:center;">
        <p style="font-size:16px;color:${COLORS.warmGray};font-weight:700;">Next Up:</p>
        <p style="font-size:18px;color:${COLORS.navy};font-weight:700;margin-top:4px;">${esc(nextName)}</p>
        ${positionHint}
      </div>`
    : `<p style="font-size:22px;color:${COLORS.crimson};font-weight:700;">Routine Complete!</p>`;

  return baseHTML(
    `display:flex;flex-direction:column;`,
    `${progressDotsHTML(exNum, total)}
    <div style="flex:1;background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;">
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(15,118,110,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
        ${ICONS.checkTeal}
      </div>
      <h2 style="font-family:Petrona,Georgia,serif;font-size:28px;font-weight:700;color:${COLORS.crimson};margin-bottom:8px;">Exercise ${exNum} Complete!</h2>
      <p style="font-size:18px;color:${COLORS.navy};font-weight:700;margin-bottom:8px;">${esc(name)}</p>
      <div style="width:64px;height:4px;background:${COLORS.crimson};border-radius:2px;margin:12px auto;"></div>
      ${nextHTML}
    </div>`
  );
}

export function routineComplete(routineName, exerciseCount, totalMinutes, level, condition) {
  const levelHTML = level
    ? `<span style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:${COLORS.white};font-size:12px;font-weight:700;padding:4px 16px;border-radius:16px;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">${esc(level)}</span>`
    : '';
  const conditionHTML = condition
    ? `<p style="font-size:16px;color:rgba(255,255,255,0.85);font-weight:600;font-style:italic;margin-bottom:8px;">Building your ${esc(condition.toLowerCase())}, one session at a time.</p>`
    : '';

  return baseHTML(
    `background:linear-gradient(135deg,${COLORS.navy} 0%,${COLORS.teal} 50%,${COLORS.crimson} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px;`,
    `<div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
      ${ICONS.checkWhite}
    </div>
    <h1 style="font-family:Petrona,Georgia,serif;font-size:38px;font-weight:700;color:${COLORS.white};margin-bottom:12px;">Routine Complete!</h1>
    ${levelHTML}
    <p style="font-size:20px;color:rgba(255,255,255,0.9);font-weight:700;margin-bottom:4px;">${esc(routineName)}</p>
    <p style="font-size:18px;color:${COLORS.white};font-weight:700;margin-bottom:4px;">${exerciseCount} exercises &middot; ${esc(String(totalMinutes))}</p>
    ${conditionHTML}
    <p style="font-size:16px;color:rgba(255,255,255,0.8);font-weight:700;margin-bottom:16px;">Great work today. Consistency builds confidence.</p>
    <div style="width:200px;height:2px;background:rgba(255,255,255,0.3);margin:16px 0;"></div>
    ${sfhLogo()}
    ${tagline()}`
  );
}

export function getScreenHTML(type, data, dimensions) {
  if (dimensions) {
    setDimensions(dimensions.width, dimensions.height);
  }
  switch (type) {
    case 'thumbnail':
      return thumbnail(data.routineName, data.totalDuration, data.overlayImageUrl);
    case 'title-card':
      return titleCard(data.routineName, data.exerciseCount, data.totalDuration, data.subtitle, data.level, data.condition);
    case 'tracker-reminder':
      return trackerReminder();
    case 'equipment':
      return equipment(data.items);
    case 'lets-start':
      return letsGo();
    case 'watch-learn':
      return watchIntro(data.exerciseNumber, data.totalExercises, data.exerciseName, data.duration, data.coachingCue, data.tags, data.focus, data.positionType);
    case 'your-turn':
      return yourTurn(data.exerciseNumber, data.totalExercises, data.exerciseName, data.duration, data.coachingCue, data.bilateral === 'yes', data.side, data.tags, data.focus, data.positionType);
    case 'practice-countdown':
      return practiceFrame(data.exerciseNumber, data.totalExercises, data.exerciseName, data.imagePath, data.coachingCue, data.duration, data.timeDisplay || data.duration, data.side, data.tags);
    case 'switch-sides':
      return switchSides(data.exerciseNumber, data.totalExercises, data.exerciseName, data.secondSide);
    case 'exercise-complete':
      return exerciseComplete(data.exerciseNumber, data.totalExercises, data.exerciseName, data.nextExerciseName, data.nextExercisePosition);
    case 'outro':
      return routineComplete(data.routineName, data.exerciseCount, data.totalDuration, data.level, data.condition);
    default:
      throw new Error(`Unknown screen type: ${type}`);
  }
}

export default {
  thumbnail,
  titleCard,
  trackerReminder,
  equipment,
  letsGo,
  watchIntro,
  yourTurn,
  practiceFrame,
  switchSides,
  exerciseComplete,
  routineComplete,
  getScreenHTML,
};
