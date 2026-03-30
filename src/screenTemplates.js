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

const ICONS = {
  clipboard: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="${COLORS.crimson}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>`,
  pause: `<svg width="28" height="28" viewBox="0 0 24 24" fill="${COLORS.crimson}" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
  play: `<svg width="48" height="48" viewBox="0 0 24 24" fill="${COLORS.teal}" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>`,
  playWhite: `<svg width="80" height="80" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>`,
  checkTeal: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${COLORS.teal}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkWhite: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${COLORS.white}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  switchArrows: `<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="${COLORS.crimson}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8l4 4-4 4"/><path d="M2 12h20"/><path d="M6 16l-4-4 4-4"/></svg>`,
};

function sfhLogo(size = 'sm') {
  const fontSize = size === 'lg' ? '22px' : '20px';
  return `<p style="font-size:${fontSize};letter-spacing:4px;color:rgba(255,255,255,0.8);font-weight:700;text-transform:uppercase;">SENIOR FITNESS <span style="color:${COLORS.pinkLight};">HUB</span></p>`;
}

function tagline() {
  return `<p style="font-size:20px;color:rgba(255,255,255,0.5);font-weight:700;margin-top:16px;">Practice with purpose. Move with confidence. Live with independence.</p>`;
}

function progressDotsHTML(current, total) {
  let dots = '';
  for (let i = 1; i <= total; i++) {
    if (i < current) {
      dots += `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${COLORS.crimson}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin:0 4px;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (i === current) {
      dots += `<svg width="18" height="18" viewBox="0 0 24 24" style="margin:0 4px;vertical-align:middle;"><circle cx="12" cy="12" r="10" fill="${COLORS.navy}"/></svg>`;
    } else {
      dots += `<svg width="18" height="18" viewBox="0 0 24 24" style="margin:0 4px;vertical-align:middle;"><circle cx="12" cy="12" r="9" fill="none" stroke="rgba(12,17,91,0.25)" stroke-width="2"/></svg>`;
    }
  }
  return `<div style="background:${COLORS.cream};border-bottom:3px solid rgba(12,17,91,0.08);padding:14px 28px;display:flex;align-items:center;justify-content:space-between;width:100%;">
    <div style="display:flex;align-items:center;">${dots}</div>
    <span style="font-size:22px;font-weight:700;color:${COLORS.navy};">Exercise ${current} of ${total}</span>
  </div>`;
}

function tagsHTML(tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return '';
  const tagBadges = tags.map(tag =>
    `<span style="display:inline-block;background:rgba(15,118,110,0.1);color:${COLORS.teal};font-size:18px;font-weight:700;padding:6px 16px;border-radius:14px;margin:3px 4px;">${esc(tag)}</span>`
  ).join('');
  return `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-top:10px;">${tagBadges}</div>`;
}

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const CHARACTER_OVERLAY_URL = 'https://assets.cdn.filesafe.space/Tg27dC86DFaiDsilRpae/media/69c71bf95eea83c015473d3c.png';

// ═══════════════════════════════════════════
// THUMBNAIL
// ═══════════════════════════════════════════
export function thumbnail(routineName, totalMinutes, overlayImageUrl, badgeText, titleText) {
  const durationBadge = esc(badgeText || String(totalMinutes));
  const nameLines = esc(titleText || routineName).toUpperCase();
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
.content{position:absolute;left:6%;top:50%;transform:translateY(-50%);max-width:58%;z-index:5;}
.badge{display:inline-block;background:#E65100;color:#fff;font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:900;font-size:${is1080 ? '52px' : '36px'};padding:${is1080 ? '10px 28px' : '8px 20px'};border-radius:8px;margin-bottom:${is1080 ? '20px' : '14px'};letter-spacing:2px;}
.title{color:#ffffff;font-family:Impact,'Arial Black',Arial,sans-serif;font-weight:900;font-size:${is1080 ? '96px' : '64px'};line-height:1.05;text-transform:uppercase;letter-spacing:3px;text-shadow:0 4px 30px rgba(0,0,0,0.7);}
.person{position:absolute;right:-2%;bottom:-2%;width:55%;height:104%;z-index:2;-webkit-mask-image:linear-gradient(to right,transparent 0%,black 25%),linear-gradient(to top,black 90%,transparent 100%);-webkit-mask-composite:destination-in;mask-image:linear-gradient(to right,transparent 0%,black 25%),linear-gradient(to top,black 90%,transparent 100%);mask-composite:intersect;}
.person img{width:100%;height:100%;object-fit:contain;object-position:bottom right;}
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

// ═══════════════════════════════════════════
// TITLE CARD
// ═══════════════════════════════════════════
export function titleCard(routineName, exerciseCount, totalMinutes, subtitle, level, condition) {
  const levelHTML = level
    ? `<span style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:${COLORS.white};font-size:20px;font-weight:700;padding:8px 24px;border-radius:24px;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px;">${esc(level)}</span>`
    : '';
  const subtitleHTML = subtitle
    ? `<p style="font-size:30px;color:rgba(255,255,255,0.85);font-weight:600;font-style:italic;margin-bottom:16px;max-width:85%;">${esc(subtitle)}</p>`
    : '';
  const conditionHTML = condition
    ? `<span style="display:inline-block;background:rgba(15,118,110,0.8);color:${COLORS.white};font-size:22px;font-weight:700;padding:10px 28px;border-radius:24px;margin-top:12px;">${esc(condition)}</span>`
    : '';

  return baseHTML(
    `background:linear-gradient(135deg,${COLORS.navy} 0%,${COLORS.crimson} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;`,
    `${sfhLogo('lg')}
    <div style="width:240px;height:2px;background:rgba(255,255,255,0.3);margin:20px 0;"></div>
    ${levelHTML}
    <h1 style="font-family:Petrona,Georgia,serif;font-size:62px;font-weight:700;color:${COLORS.white};line-height:1.15;margin-bottom:16px;">${esc(routineName)}</h1>
    ${subtitleHTML}
    <p style="font-size:28px;color:rgba(255,255,255,0.9);font-weight:700;">${exerciseCount} Exercises &middot; ${esc(String(totalMinutes))}</p>
    ${conditionHTML}
    <div style="width:240px;height:2px;background:rgba(255,255,255,0.3);margin:20px 0;"></div>
    ${tagline()}`
  );
}

// ═══════════════════════════════════════════
// TRACKER REMINDER
// ═══════════════════════════════════════════
export function trackerReminder() {
  return baseHTML(
    `background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;`,
    `<div style="width:100px;height:100px;border-radius:50%;background:rgba(166,30,81,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:24px;">
      ${ICONS.clipboard}
    </div>
    <h2 style="font-family:Petrona,Georgia,serif;font-size:48px;font-weight:700;color:${COLORS.navy};margin-bottom:6px;">Haven't Downloaded Your</h2>
    <h2 style="font-family:Petrona,Georgia,serif;font-size:48px;font-weight:700;color:${COLORS.navy};">Progress Tracker Yet?</h2>
    <div style="width:80px;height:4px;background:${COLORS.crimson};border-radius:2px;margin:24px auto;"></div>
    <p style="font-size:32px;color:${COLORS.crimson};font-weight:700;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:12px;">${ICONS.pause} Pause the video now</p>
    <p style="font-size:24px;color:${COLORS.warmGray};font-weight:700;">Download your tracker and follow along.</p>`
  );
}

// ═══════════════════════════════════════════
// EQUIPMENT
// ═══════════════════════════════════════════
export function equipment(items) {
  const list = (items || ['Exercise mat or firm surface', 'Sturdy chair without wheels', 'Wall space for support', 'Comfortable, non-slip footwear']);
  const bulletSVG = `<svg width="16" height="16" viewBox="0 0 24 24" style="flex-shrink:0;margin-right:20px;"><circle cx="12" cy="12" r="8" fill="${COLORS.crimson}"/></svg>`;
  const listHTML = list.map(item =>
    `<li style="font-size:42px;color:${COLORS.navy};font-weight:700;padding:18px 0;display:flex;align-items:center;">
      ${bulletSVG}${esc(item)}
    </li>`
  ).join('');

  return baseHTML(
    `background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;`,
    `<h2 style="font-family:Petrona,Georgia,serif;font-size:60px;font-weight:700;color:${COLORS.navy};margin-bottom:44px;">Equipment Needed</h2>
    <div style="border-left:6px solid ${COLORS.teal};padding-left:36px;">
      <ul style="list-style:none;padding:0;margin:0;">${listHTML}</ul>
    </div>
    <div style="position:absolute;bottom:28px;">
      <p style="font-size:24px;letter-spacing:5px;color:rgba(12,17,91,0.4);font-weight:700;text-transform:uppercase;">SENIOR FITNESS <span style="color:${COLORS.crimson};">HUB</span></p>
    </div>`
  );
}

// ═══════════════════════════════════════════
// LET'S GET STARTED
// ═══════════════════════════════════════════
export function letsGo() {
  return baseHTML(
    `background:linear-gradient(135deg,${COLORS.navy} 0%,${COLORS.crimson} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;`,
    `<h1 style="font-family:Petrona,Georgia,serif;font-size:60px;font-weight:700;color:${COLORS.white};">Let's Get Started!</h1>
    <p style="font-size:28px;color:rgba(255,255,255,0.8);font-weight:700;margin-top:16px;">Follow along at your own pace.</p>
    <div style="margin-top:32px;">${ICONS.playWhite}</div>`
  );
}

// ═══════════════════════════════════════════
// WATCH & LEARN
// ═══════════════════════════════════════════
export function watchIntro(exNum, total, name, timeDisplay, cue, tags, focus, positionType, imageUrl) {
  const cueHTML = cue
    ? `<div style="border-left:5px solid ${COLORS.crimson};background:rgba(166,30,81,0.05);padding:12px 20px;border-radius:0 10px 10px 0;margin-top:16px;max-width:90%;">
        <p style="font-size:24px;color:${COLORS.navy};font-weight:700;text-align:center;">"${esc(cue)}"</p>
      </div>`
    : '';
  const focusHTML = focus
    ? `<p style="font-size:24px;color:${COLORS.warmGray};font-weight:600;margin-top:14px;max-width:85%;text-align:center;line-height:1.4;">${esc(focus)}</p>`
    : '';
  const positionHTML = positionType
    ? `<span style="display:inline-block;background:rgba(12,17,91,0.08);color:${COLORS.navy};font-size:18px;font-weight:700;padding:6px 18px;border-radius:14px;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">${esc(positionType)}</span>`
    : '';
  const imageHTML = imageUrl
    ? `<img src="${imageUrl}" alt="" style="width:480px;height:280px;object-fit:cover;border-radius:14px;margin-bottom:16px;box-shadow:0 4px 16px rgba(0,0,0,0.1);" />`
    : '';

  return baseHTML(
    `display:flex;flex-direction:column;`,
    `${progressDotsHTML(exNum, total)}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 40px;background:${COLORS.cream};">
      <span style="background:${COLORS.crimson};color:${COLORS.white};font-size:22px;font-weight:700;padding:10px 28px;border-radius:24px;margin-bottom:16px;">Exercise ${exNum} of ${total}</span>
      ${positionHTML}
      <h2 style="font-family:Petrona,Georgia,serif;font-size:34px;font-weight:700;color:${COLORS.navy};margin-bottom:12px;">Watch and Learn</h2>
      <h3 style="font-family:Petrona,Georgia,serif;font-size:40px;font-weight:700;color:${COLORS.navy};margin-bottom:16px;text-align:center;">${esc(name)}</h3>
      ${imageHTML}
      <span style="background:${COLORS.teal};color:${COLORS.white};font-size:24px;font-weight:700;padding:10px 28px;border-radius:24px;margin-bottom:14px;">${esc(timeDisplay)}</span>
      ${tagsHTML(tags)}
      ${focusHTML}
      ${cueHTML}
    </div>`
  );
}

// ═══════════════════════════════════════════
// YOUR TURN
// ═══════════════════════════════════════════
export function yourTurn(exNum, total, name, timeDisplay, cue, bilateral, side, tags, focus, positionType) {
  const sideHTML = bilateral
    ? `<span style="background:${COLORS.crimson};color:${COLORS.white};font-size:22px;font-weight:700;padding:10px 28px;border-radius:24px;margin-bottom:14px;">Starting: ${(side || 'RIGHT').toUpperCase()} SIDE</span>`
    : '';
  const cueHTML = cue
    ? `<div style="background:${COLORS.crimson};padding:14px 28px;border-radius:10px;margin-top:16px;max-width:85%;"><p style="font-size:24px;color:${COLORS.white};font-weight:700;text-align:center;">"${esc(cue)}"</p></div>`
    : '';
  const focusHTML = focus
    ? `<p style="font-size:22px;color:${COLORS.warmGray};font-weight:600;font-style:italic;margin-top:12px;max-width:80%;text-align:center;line-height:1.4;">${esc(focus)}</p>`
    : '';
  const positionHTML = positionType
    ? `<span style="display:inline-block;background:rgba(12,17,91,0.08);color:${COLORS.navy};font-size:18px;font-weight:700;padding:6px 18px;border-radius:14px;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">${esc(positionType)}</span>`
    : '';

  return baseHTML(
    `display:flex;flex-direction:column;`,
    `${progressDotsHTML(exNum, total)}
    <div style="flex:1;background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 40px;">
      <div style="width:84px;height:84px;border-radius:50%;background:rgba(15,118,110,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
        ${ICONS.play}
      </div>
      ${positionHTML}
      <h2 style="font-family:Petrona,Georgia,serif;font-size:44px;font-weight:700;color:${COLORS.navy};margin-bottom:16px;">Now It's Your Turn!</h2>
      <h3 style="font-family:Petrona,Georgia,serif;font-size:34px;font-weight:700;color:${COLORS.navy};margin-bottom:16px;">${esc(name)}</h3>
      <span style="background:${COLORS.teal};color:${COLORS.white};font-size:24px;font-weight:700;padding:10px 28px;border-radius:10px;margin-bottom:14px;">${esc(timeDisplay)}</span>
      ${sideHTML}
      ${tagsHTML(tags)}
      ${cueHTML}
      ${focusHTML}
    </div>`
  );
}

// ═══════════════════════════════════════════
// PRACTICE FRAME (countdown target)
// ═══════════════════════════════════════════
export function practiceFrame(exNum, total, name, imageUrl, cue, timeRemaining, totalDuration, side, tags) {
  const sideBadge = side
    ? `<span style="position:absolute;top:20px;right:24px;background:${COLORS.crimson};color:${COLORS.white};font-size:24px;font-weight:700;padding:10px 28px;border-radius:24px;">${side.toUpperCase()} SIDE</span>`
    : '';

  const imageHTML = imageUrl
    ? `<img src="${imageUrl}" style="max-width:800px;max-height:460px;object-fit:contain;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,0.1);" />`
    : `<span style="font-size:20px;color:rgba(12,17,91,0.3);font-weight:700;">NO IMAGE</span>`;

  const cueHTML = cue
    ? `<p style="font-size:28px;color:${COLORS.crimson};font-weight:700;margin-top:16px;text-align:center;max-width:85%;">"${esc(cue)}"</p>`
    : '';

  return baseHTML(
    `display:flex;flex-direction:column;`,
    `${progressDotsHTML(exNum, total)}
    <div style="flex:1;background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 40px;position:relative;">
      ${sideBadge}
      <p style="font-family:Petrona,Georgia,serif;font-size:36px;font-weight:700;color:${COLORS.navy};margin-bottom:14px;">${esc(name)}</p>
      <div style="display:flex;align-items:center;justify-content:center;margin-bottom:14px;">
        ${imageHTML}
      </div>
      <span style="background:${COLORS.teal};color:${COLORS.white};font-size:24px;font-weight:700;padding:10px 28px;border-radius:24px;">${esc(String(totalDuration))}</span>
      ${cueHTML}
      <p style="position:absolute;bottom:10px;font-size:18px;letter-spacing:3px;color:rgba(12,17,91,0.25);font-weight:700;text-transform:uppercase;">SENIOR FITNESS <span style="color:${COLORS.crimson};">HUB</span></p>
    </div>`
  );
}

// ═══════════════════════════════════════════
// SWITCH SIDES
// ═══════════════════════════════════════════
export function switchSides(exNum, total, name, secondSide) {
  const sideLabel = (secondSide || 'LEFT').toUpperCase();
  return baseHTML(
    `display:flex;flex-direction:column;`,
    `${progressDotsHTML(exNum, total)}
    <div style="flex:1;background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 40px;">
      <div style="width:84px;height:84px;border-radius:50%;background:rgba(166,30,81,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:22px;">
        ${ICONS.switchArrows}
      </div>
      <h2 style="font-family:Petrona,Georgia,serif;font-size:50px;font-weight:700;color:${COLORS.navy};margin-bottom:18px;">Switch Sides</h2>
      <span style="background:${COLORS.crimson};color:${COLORS.white};font-size:24px;font-weight:700;padding:10px 30px;border-radius:24px;">Now: ${sideLabel} SIDE</span>
      ${name ? `<p style="font-size:24px;color:${COLORS.navy};font-weight:700;margin-top:18px;">${esc(name)}</p>` : ''}
    </div>`
  );
}

// ═══════════════════════════════════════════
// EXERCISE COMPLETE
// ═══════════════════════════════════════════
export function exerciseComplete(exNum, total, name, nextName, nextPosition) {
  const positionHint = nextPosition
    ? `<span style="display:inline-block;background:rgba(12,17,91,0.08);color:${COLORS.navy};font-size:18px;font-weight:700;padding:6px 18px;border-radius:14px;margin-top:10px;text-transform:uppercase;letter-spacing:0.5px;">${esc(nextPosition)}</span>`
    : '';
  const nextHTML = nextName
    ? `<div style="text-align:center;">
        <p style="font-size:24px;color:${COLORS.warmGray};font-weight:700;">Next Up:</p>
        <p style="font-size:30px;color:${COLORS.navy};font-weight:700;margin-top:8px;">${esc(nextName)}</p>
        ${positionHint}
      </div>`
    : `<p style="font-size:30px;color:${COLORS.crimson};font-weight:700;">Routine Complete!</p>`;

  return baseHTML(
    `display:flex;flex-direction:column;`,
    `${progressDotsHTML(exNum, total)}
    <div style="flex:1;background:${COLORS.cream};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 40px;">
      <div style="width:84px;height:84px;border-radius:50%;background:rgba(15,118,110,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:18px;">
        ${ICONS.checkTeal}
      </div>
      <h2 style="font-family:Petrona,Georgia,serif;font-size:40px;font-weight:700;color:${COLORS.crimson};margin-bottom:12px;">Exercise ${exNum} Complete!</h2>
      <p style="font-size:28px;color:${COLORS.navy};font-weight:700;margin-bottom:12px;">${esc(name)}</p>
      <div style="width:80px;height:4px;background:${COLORS.crimson};border-radius:2px;margin:16px auto;"></div>
      ${nextHTML}
    </div>`
  );
}

// ═══════════════════════════════════════════
// ROUTINE COMPLETE (outro)
// ═══════════════════════════════════════════
export function routineComplete(routineName, exerciseCount, totalMinutes, level, condition) {
  const levelHTML = level
    ? `<span style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:${COLORS.white};font-size:18px;font-weight:700;padding:6px 22px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">${esc(level)}</span>`
    : '';
  const conditionHTML = condition
    ? `<p style="font-size:24px;color:rgba(255,255,255,0.85);font-weight:600;font-style:italic;margin-bottom:12px;">Building your ${esc(condition.toLowerCase())}, one session at a time.</p>`
    : '';

  return baseHTML(
    `background:linear-gradient(135deg,${COLORS.navy} 0%,${COLORS.crimson} 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;`,
    `<div style="width:96px;height:96px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;margin-bottom:22px;">
      ${ICONS.checkWhite}
    </div>
    <h1 style="font-family:Petrona,Georgia,serif;font-size:54px;font-weight:700;color:${COLORS.white};margin-bottom:16px;">Routine Complete!</h1>
    ${levelHTML}
    <p style="font-size:28px;color:rgba(255,255,255,0.9);font-weight:700;margin-bottom:8px;">${esc(routineName)}</p>
    <p style="font-size:26px;color:${COLORS.white};font-weight:700;margin-bottom:8px;">${exerciseCount} exercises &middot; ${esc(String(totalMinutes))}</p>
    ${conditionHTML}
    <p style="font-size:24px;color:rgba(255,255,255,0.8);font-weight:700;margin-bottom:20px;">Great work today. Consistency builds confidence.</p>
    <div style="width:240px;height:2px;background:rgba(255,255,255,0.3);margin:16px 0;"></div>
    ${sfhLogo()}
    ${tagline()}`
  );
}

// ═══════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════
export function getScreenHTML(type, data, dimensions) {
  if (dimensions) {
    setDimensions(dimensions.width, dimensions.height);
  }
  switch (type) {
    case 'thumbnail':
      return thumbnail(data.routineName, data.totalDuration, data.overlayImageUrl, data.badgeText, data.titleText);
    case 'title-card':
      return titleCard(data.routineName, data.exerciseCount, data.totalDuration, data.subtitle, data.level, data.condition);
    case 'tracker-reminder':
      return trackerReminder();
    case 'equipment':
      return equipment(data.items);
    case 'lets-start':
      return letsGo();
    case 'watch-learn':
      return watchIntro(data.exerciseNumber, data.totalExercises, data.exerciseName, data.duration, data.coachingCue, data.tags, data.focus, data.positionType, data.imageUrl);
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
