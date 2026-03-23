'use strict';

// ─── Utilities ───────────────────────────────────────────────────────────────

function segmentColor(index, total, dimmed = false) {
  const hue = (index * (360 / total)) % 360;
  return dimmed ? `hsl(${hue}, 15%, 40%)` : `hsl(${hue}, 65%, 55%)`;
}

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ─── Meeting slots & ICS ─────────────────────────────────────────────────────

const MEETING_DURATION_MINS = 30;

function generateTimeSlots(count = 3) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Collect weekdays in the next 14 days (starting tomorrow)
  const candidates = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) candidates.push(d);
  }

  // Shuffle, take `count`, sort chronologically
  const picked = candidates
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .sort((a, b) => a - b);

  // For each day pick a random 30-min slot between 11:00 and 14:00
  const maxStart = 14 * 60 - MEETING_DURATION_MINS; // 810
  const validStarts = [];
  for (let m = 11 * 60; m <= maxStart; m += 30) validStarts.push(m);

  return picked.map((day) => {
    const startMins =
      validStarts[Math.floor(Math.random() * validStarts.length)];
    const start = new Date(day);
    start.setHours(Math.floor(startMins / 60), startMins % 60, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + MEETING_DURATION_MINS);
    return { start, end };
  });
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function icsDate(d) {
  return (
    `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}` +
    `T${pad2(d.getHours())}${pad2(d.getMinutes())}00`
  );
}

function generateICS(displayName, email, start, end) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wheel of Meeting//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@wheel-of-meeting`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:1:1 with ${displayName}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:${email}`,
    'DESCRIPTION:Scheduled via Wheel of Meeting',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

function downloadICS(displayName, email, start, end) {
  const content = generateICS(displayName, email, start, end);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `1on1-${displayName.replace(/\s+/g, '-')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatSlotDay(d) {
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatSlotTime(start, end) {
  const fmt = (t) =>
    t.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}`;
}

// ─── Email helpers ───────────────────────────────────────────────────────────

function emailToDisplayName(email) {
  const local = email.split('@')[0];
  return local
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

// ─── Excluded domains ────────────────────────────────────────────────────────

const EXCLUDED_DOMAINS = ['finanteq.com'];

function isExcluded(name) {
  return EXCLUDED_DOMAINS.some((domain) => name.endsWith('@' + domain));
}

// ─── Dataset config ──────────────────────────────────────────────────────────

const DATASETS = [
  {
    key: 'partners',
    label: 'Partners',
    file: 'data/partners.json',
    emptyText: 'No partners loaded.',
  },
  {
    key: 'lead-developers',
    label: 'Lead Developers',
    file: 'data/lead-developers.json',
    emptyText: 'No leads loaded.',
  },
];

// ─── StateManager ─────────────────────────────────────────────────────────────
// Only history is persisted; partners come from JSON files.

const StateManager = (() => {
  const KEY = 'wheel-of-meeting';

  function emptyDataset() {
    return { history: [] };
  }

  function defaultRoot() {
    const datasets = {};
    DATASETS.forEach((d) => {
      datasets[d.key] = emptyDataset();
    });
    return { version: 3, activeDataset: DATASETS[0].key, datasets };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultRoot();
      const parsed = JSON.parse(raw);

      // Migrate any older version
      if (!parsed.version || parsed.version < 3) {
        return defaultRoot();
      }

      // Ensure all dataset keys exist
      DATASETS.forEach((d) => {
        if (!parsed.datasets[d.key]) parsed.datasets[d.key] = emptyDataset();
      });
      return parsed;
    } catch {
      return defaultRoot();
    }
  }

  function save(root) {
    localStorage.setItem(KEY, JSON.stringify(root));
  }

  function activeData(root) {
    return root.datasets[root.activeDataset];
  }

  function switchDataset(root, key) {
    root.activeDataset = key;
    save(root);
  }

  function recordMeeting(root, id) {
    const ds = activeData(root);
    ds.history.unshift({ id, ts: Date.now() });
    if (ds.history.length > 10) ds.history = ds.history.slice(0, 10);
    save(root);
  }

  function pruneHistory(root, validIds) {
    // Remove history entries for IDs no longer present in the JSON
    const set = new Set(validIds);
    const ds = activeData(root);
    ds.history = ds.history.filter((h) => set.has(h.id));
  }

  function clearActive(root) {
    root.datasets[root.activeDataset] = emptyDataset();
    save(root);
  }

  return {
    load,
    save,
    activeData,
    switchDataset,
    recordMeeting,
    pruneHistory,
    clearActive,
  };
})();

// ─── JSON loader ─────────────────────────────────────────────────────────────

async function fetchPartners(file) {
  const resp = await fetch(file);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const names = await resp.json();
  // Use the name itself as a stable ID so history survives reloads
  return names
    .map((email) => ({
      id: String(email),
      name: emailToDisplayName(String(email)),
    }))
    .filter((p) => !isExcluded(p.id));
}

// ─── Selection Algorithm ─────────────────────────────────────────────────────

function selectWinner(partners, history) {
  const recentIds = history.map((h) => h.id);
  let eligible = partners.filter((p) => !recentIds.includes(p.id));
  if (eligible.length === 0)
    eligible = partners.filter((p) => p.id !== recentIds[0]);
  if (eligible.length === 0) eligible = partners;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

// ─── WheelRenderer ───────────────────────────────────────────────────────────

const WheelRenderer = (() => {
  let canvas, ctx;
  let currentAngle = 0;
  let idleRafId = null;
  let spinRafId = null;

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
  }

  function drawWheel(
    partners,
    historyIds,
    angle,
    emptyMsg = 'Add partners to spin!'
  ) {
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    if (partners.length === 0) {
      ctx.fillStyle = '#1e2a44';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#555';
      ctx.font = `bold ${size * 0.055}px Segoe UI, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emptyMsg, cx, cy);
      return;
    }

    const n = partners.length;
    const arc = (Math.PI * 2) / n;

    partners.forEach((partner, i) => {
      const dimmed = historyIds.includes(partner.id);
      const startAngle = angle + i * arc - Math.PI / 2;
      const endAngle = startAngle + arc;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segmentColor(i, n, dimmed);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);

      const maxWidth = r * 0.65;
      const label = dimmed ? `${partner.name} (met)` : partner.name;
      const fontSize = Math.max(10, Math.min(18, size * 0.035));
      ctx.font = `bold ${fontSize}px Segoe UI, system-ui, sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = dimmed ? '#aaa' : '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;

      let displayLabel = label;
      while (
        ctx.measureText(displayLabel).width > maxWidth &&
        displayLabel.length > 3
      ) {
        displayLabel = displayLabel.slice(0, -1);
      }
      if (displayLabel !== label)
        displayLabel = displayLabel.slice(0, -1) + '…';

      ctx.fillText(displayLabel, r - 10, 0);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.07, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function render(partners, historyIds, emptyMsg) {
    drawWheel(partners, historyIds, currentAngle, emptyMsg);
  }

  function startIdleSpin(partners, historyIds) {
    stopIdleSpin();
    const speed = 0.002;
    function frame() {
      currentAngle += speed;
      drawWheel(partners, historyIds, currentAngle);
      idleRafId = requestAnimationFrame(frame);
    }
    idleRafId = requestAnimationFrame(frame);
  }

  function stopIdleSpin() {
    if (idleRafId !== null) {
      cancelAnimationFrame(idleRafId);
      idleRafId = null;
    }
  }

  function resetAngle() {
    currentAngle = 0;
  }

  function spin(partners, historyIds, winnerId, onComplete) {
    stopIdleSpin();
    if (spinRafId !== null) return;

    const n = partners.length;
    const arc = (Math.PI * 2) / n;
    const winnerIndex = partners.findIndex((p) => p.id === winnerId);

    const targetBase = -winnerIndex * arc - arc / 2;
    const extraSpins = (5 + Math.random() * 2) * Math.PI * 2;
    let targetAngle = targetBase;
    while (targetAngle < currentAngle + extraSpins) {
      targetAngle += Math.PI * 2;
    }

    const startAngle = currentAngle;
    const totalDelta = targetAngle - startAngle;
    const duration = 4500;
    let startTime = null;

    function frame(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(elapsed / duration, 1);
      currentAngle = startAngle + totalDelta * easeOutQuart(t);
      drawWheel(partners, historyIds, currentAngle);

      if (t < 1) {
        spinRafId = requestAnimationFrame(frame);
      } else {
        spinRafId = null;
        currentAngle = targetAngle % (Math.PI * 2);
        drawWheel(partners, historyIds, currentAngle);
        onComplete(winnerId);
      }
    }

    spinRafId = requestAnimationFrame(frame);
  }

  return { init, render, spin, startIdleSpin, stopIdleSpin, resetAngle };
})();

// ─── ListManager ─────────────────────────────────────────────────────────────

function renderPartnerList(partners, history, emptyText) {
  const ul = document.getElementById('partner-list');
  ul.innerHTML = '';

  if (partners.length === 0) {
    ul.innerHTML = `<li class="empty-state">${emptyText}</li>`;
    return;
  }

  const historyIds = new Set(history.map((h) => h.id));
  const n = partners.length;

  partners.forEach((partner, i) => {
    const li = document.createElement('li');

    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = segmentColor(i, n, false);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'partner-name';
    nameSpan.textContent = partner.name;

    li.appendChild(swatch);
    li.appendChild(nameSpan);

    if (historyIds.has(partner.id)) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = 'met';
      li.appendChild(badge);
    }

    ul.appendChild(li);
  });
}

// ─── HistoryTracker ───────────────────────────────────────────────────────────

function renderHistory(partners, history) {
  const ul = document.getElementById('history-list');
  ul.innerHTML = '';

  if (history.length === 0) {
    ul.innerHTML = '<li class="empty-state">No meetings yet.</li>';
    return;
  }

  const partnerMap = new Map(partners.map((p) => [p.id, p.name]));

  history.forEach((entry) => {
    const li = document.createElement('li');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'history-name';
    nameSpan.textContent = partnerMap.get(entry.id) || entry.id;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'history-time';
    timeSpan.textContent = relativeTime(entry.ts);

    li.appendChild(nameSpan);
    li.appendChild(timeSpan);
    ul.appendChild(li);
  });
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

async function boot() {
  const canvas = document.getElementById('wheel');
  const spinBtn = document.getElementById('spin-btn');
  const dialog = document.getElementById('winner-dialog');
  const winnerNameEl = document.getElementById('winner-name');
  const dialogClose = document.getElementById('dialog-close');
  const clearBtn = document.getElementById('clear-btn');
  const tabsEl = document.getElementById('dataset-tabs');
  const sectionHeading = document.getElementById('section-heading');

  WheelRenderer.init(canvas);

  // Load all JSON datasets up front
  const partnersByKey = {};
  const loadedOk = new Set();
  await Promise.all(
    DATASETS.map(async (d) => {
      try {
        partnersByKey[d.key] = await fetchPartners(d.file);
        loadedOk.add(d.key);
      } catch (e) {
        console.warn(`Could not load ${d.file}:`, e);
        partnersByKey[d.key] = [];
      }
    })
  );

  let root = StateManager.load();

  // Prune stale history only for datasets that loaded successfully.
  // Skipping failed datasets prevents wiping history when the server is offline.
  DATASETS.forEach((d) => {
    if (!loadedOk.has(d.key)) return;
    const origActive = root.activeDataset;
    root.activeDataset = d.key;
    StateManager.pruneHistory(
      root,
      partnersByKey[d.key].map((p) => p.id)
    );
    root.activeDataset = origActive;
  });
  StateManager.save(root);

  function activeConfig() {
    return DATASETS.find((d) => d.key === root.activeDataset);
  }
  function activePartners() {
    return partnersByKey[root.activeDataset];
  }
  function ds() {
    return StateManager.activeData(root);
  }

  function updateScopeText() {
    const cfg = activeConfig();
    sectionHeading.textContent = cfg.label;
  }

  function renderAll() {
    const partners = activePartners();
    const { history } = ds();
    const cfg = activeConfig();
    WheelRenderer.render(
      partners,
      history.map((h) => h.id),
      cfg.emptyText
    );
    renderPartnerList(partners, history, cfg.emptyText);
    renderHistory(partners, history);
    spinBtn.disabled = partners.length < 1;
  }

  function maybeStartIdle() {
    const partners = activePartners();
    if (partners.length > 0) {
      WheelRenderer.startIdleSpin(
        partners,
        ds().history.map((h) => h.id)
      );
    }
  }

  // Dataset tabs
  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const key = btn.dataset.dataset;
    if (key === root.activeDataset) return;

    StateManager.switchDataset(root, key);
    tabsEl
      .querySelectorAll('.tab-btn')
      .forEach((b) => b.classList.toggle('active', b.dataset.dataset === key));

    WheelRenderer.stopIdleSpin();
    WheelRenderer.resetAngle();
    updateScopeText();
    renderAll();
    maybeStartIdle();
  });

  let lastGeneratedSlots = null;

  function openWinnerDialog(winnerName, winnerEmail) {
    winnerNameEl.textContent = winnerName;

    const slotsEl = document.getElementById('time-slots');
    slotsEl.innerHTML = '';

    const slots = generateTimeSlots(3);
    lastGeneratedSlots = slots;
    slots.forEach((slot, i) => {
      const btn = document.createElement('button');
      btn.className = 'slot-btn';
      if (i === 0) btn.autofocus = true;

      const dayEl = document.createElement('span');
      dayEl.className = 'slot-day';
      dayEl.textContent = formatSlotDay(slot.start);

      const timeEl = document.createElement('span');
      timeEl.className = 'slot-time';
      timeEl.textContent = formatSlotTime(slot.start, slot.end);

      btn.appendChild(dayEl);
      btn.appendChild(timeEl);
      btn.addEventListener('click', () => {
        downloadICS(winnerName, winnerEmail, slot.start, slot.end);
        dialog.close();
        maybeStartIdle();
      });
      slotsEl.appendChild(btn);
    });

    dialog.showModal();
  }

  // Spin
  spinBtn.addEventListener('click', () => {
    const partners = activePartners();
    const { history } = ds();
    if (partners.length === 0) return;

    const winner = selectWinner(partners, history);
    spinBtn.disabled = true;
    WheelRenderer.stopIdleSpin();

    WheelRenderer.spin(
      partners,
      history.map((h) => h.id),
      winner.id,
      (winnerId) => {
        StateManager.recordMeeting(root, winnerId);
        const updated = ds();
        renderPartnerList(
          activePartners(),
          updated.history,
          activeConfig().emptyText
        );
        renderHistory(activePartners(), updated.history);
        spinBtn.disabled = false;

        openWinnerDialog(winner.name, winner.id);
      }
    );
  });

  // Dialog close (Skip)
  dialogClose.addEventListener('click', () => {
    dialog.close();
    maybeStartIdle();
  });
  dialog.addEventListener('cancel', () => maybeStartIdle());

  // Clear history for active dataset
  clearBtn.addEventListener('click', () => {
    const label = activeConfig().label;
    if (
      !confirm(`Clear meeting history for "${label}"? This cannot be undone.`)
    )
      return;
    WheelRenderer.stopIdleSpin();
    StateManager.clearActive(root);
    WheelRenderer.resetAngle();
    renderAll();
    maybeStartIdle();
  });

  // Sync tab UI to persisted active dataset on load
  tabsEl
    .querySelectorAll('.tab-btn')
    .forEach((b) =>
      b.classList.toggle('active', b.dataset.dataset === root.activeDataset)
    );
  updateScopeText();

  renderAll();
  maybeStartIdle();

  // Expose state for automated tests (read-only)
  window.__wheel = {
    getHistory: () => StateManager.activeData(root).history,
    getPartners: () => activePartners(),
    getLastSlots: () =>
      lastGeneratedSlots
        ? lastGeneratedSlots.map((s) => ({
            start: s.start.toISOString(),
            end: s.end.toISOString(),
          }))
        : null,
  };
}

boot();
