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

function baseHTML(bodyStyle, content) {
  return `<!DOCTYPE html><html><head><style>
${FONTS}
*{margin:0;padding:0;box-sizing:border-box;}
body{width:1280px;height:720px;overflow:hidden;font-family:'Quicksand',sans-serif;font-weight:600;${bodyStyle}}
</style></head><body>${content}</body></html>`;
}

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
      dots += `<span style="font-size:14px;font-weight:700;color:${COLORS.crimson};margin:0 3px;">&#10003;</span>`;
    } else if (i === current) {
      dots += `<span style="font-size:14px;font-weight:700;color:${COLORS.navy};margin:0 3px;">&#9679;</span>`;
    } else {
      dots += `<span style="font-size:14px;font-weight:700;color:rgba(12,17,91,0.25);margin:0 3px;">&#9675;</span>`;
    }
  }
  return `<div style="background:${COLORS.cream};border-bottom:2px solid rgba(12,17,91,0.08);padding:10px 20px;display:flex;align-items:center;justify-content:space-between;width:100%;">
    <div>${dots}</div>
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
      <span style="font-size:40px;">&#128203;</span>
    </div>
    <h2 style="font-family:Petrona,Georgia,serif;font-size:34px;font-weight:700;color:${COLORS.navy};margin-bottom:4px;">Haven't Downloaded Your</h2>
    <h2 style="font-family:Petrona,Georgia,serif;font-size:34px;font-weight:700;color:${COLORS.navy};">Progress Tracker Yet?</h2>
    <div style="width:64px;height:4px;background:${COLORS.crimson};border-radius:2px;margin:16px auto;"></div>
    <p style="font-size:22px;color:${COLORS.crimson};font-weight:700;margin-bottom:12px;">&#9208; Pause the video now</p>
    <p style="font-size:16px;color:${COLORS.warmGray};font-weight:700;">Download your tracker and follow along.</p>`
  );
}

export function equipment(items) {
  const list = (items || ['Exercise mat or firm surface', 'Sturdy chair without wheels', 'Wall space for support', 'Comfortable, non-slip footwear']);
  const listHTML = list.map(item =>
    `<li style="font-size:34px;color:${COLORS.navy};font-weight:700;padding:14px 0;display:flex;align-items:center;">
      <span style="color:#DC143C;font-size:36px;font-weight:700;margin-right:18px;">&#8226;</span>${esc(item)}
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
    <p style="font-size:60px;color:rgba(255,255,255,0.6);margin-top:24px;">&#9654;</p>`
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
        <span style="font-size:32px;color:${COLORS.teal};">&#9654;</span>
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
    ? `<div style="position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:10;background:${COLORS.crimson};color:${COLORS.white};font-size:16px;font-weight:700;padding:8px 20px;border-radius:20px;box-shadow:0 4px 12px rgba(166,30,81,0.3);">${side.toUpperCase()} SIDE</div>`
    : '';

  const cueHTML = cue
    ? `<div style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);z-index:10;background:${COLORS.crimson};color:${COLORS.white};font-size:18px;font-weight:700;padding:10px 24px;border-radius:8px;max-width:60%;text-align:center;">"${esc(cue)}"</div>`
    : '';

  const imageHTML = imageUrl
    ? `<img src="${imageUrl}" style="width:100%;height:100%;object-fit:contain;" />`
    : `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;"><span style="font-size:18px;color:rgba(12,17,91,0.3);font-weight:700;">NO IMAGE</span></div>`;

  const nameHTML = `<div style="position:absolute;top:12px;left:16px;z-index:10;">
    <p style="font-family:Petrona,Georgia,serif;font-size:22px;color:${COLORS.navy};font-weight:700;text-shadow:0 1px 4px rgba(255,255,255,0.8);padding:6px 14px;">${esc(name)}</p>
  </div>`;

  const tagsOverlay = (tags && Array.isArray(tags) && tags.length > 0)
    ? `<div style="position:absolute;top:${side ? '56px' : '12px'};right:16px;z-index:10;display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end;max-width:240px;">
        ${tags.map(tag => `<span style="background:rgba(15,118,110,0.9);color:${COLORS.white};font-size:14px;font-weight:700;padding:4px 14px;border-radius:14px;">${esc(tag)}</span>`).join('')}
      </div>`
    : '';

  return baseHTML(
    `display:flex;flex-direction:column;`,
    `${progressDotsHTML(exNum, total)}
    <div style="flex:1;background:${COLORS.cream};position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;">
      ${sideBadge}
      ${nameHTML}
      ${tagsOverlay}
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:50px 80px 60px 80px;">
        ${imageHTML}
      </div>
      ${cueHTML}
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
        <span style="font-size:36px;color:${COLORS.crimson};">&#8596;</span>
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
        <span style="font-size:32px;color:${COLORS.teal};">&#10003;</span>
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
      <span style="font-size:32px;color:${COLORS.white};">&#10003;</span>
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

export function getScreenHTML(type, data) {
  switch (type) {
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
      return practiceFrame(data.exerciseNumber, data.totalExercises, data.exerciseName, data.imagePath, data.coachingCue, data.duration, data.duration, data.side, data.tags);
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
