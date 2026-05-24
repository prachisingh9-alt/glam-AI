/* ===========================
   GLAM AI — main.js
   =========================== */

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, [class*="btn"], [class*="card"], [class*="chip"], [class*="pill"]').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
});

document.body.style.cursor = 'none';


// ===== SCROLL REVEAL =====
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      e.target.querySelectorAll('[data-count]').forEach(el => animateCount(el));
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => revealObserver.observe(el));


// ===== COUNT-UP ANIMATION =====
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const isDecimal = target % 1 !== 0;
  const suffix = el.dataset.count === '1' ? 'B+' : el.dataset.count === '4.8' ? '' : 'M+';
  const startTime = performance.now();
  const duration = 2000;

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}


// ===== GALLERY MARQUEE =====
const showcaseData = [
  { bg: 'linear-gradient(135deg,#2d1b69,#11998e)', icon: '🌸', title: 'Beauty Filter',  meta: 'Skin Retouching + Glow',   effect: 'Glamour'   },
  { bg: 'linear-gradient(135deg,#c94b4b,#4b134f)', icon: '🎬', title: 'Cinematic Look', meta: 'Color Grade + Vignette',   effect: 'Cinematic' },
  { bg: 'linear-gradient(135deg,#373b44,#4286f4)', icon: '✨', title: 'City Night',      meta: 'Background Swap',          effect: 'Night'     },
  { bg: 'linear-gradient(135deg,#b06ab3,#4568dc)', icon: '💫', title: 'Dreamy Pastel',  meta: 'AI Glow + Soft',           effect: 'Dream'     },
  { bg: 'linear-gradient(135deg,#1a1a2e,#16213e)', icon: '🖤', title: 'Noir Series',    meta: 'B&W + Grain',              effect: 'Noir'      },
  { bg: 'linear-gradient(135deg,#f7971e,#ffd200)', icon: '🌅', title: 'Golden Hour',    meta: 'Warmth + Haze',            effect: 'Golden'    },
  { bg: 'linear-gradient(135deg,#56ccf2,#2f80ed)', icon: '🌊', title: 'Cool Tones',     meta: 'Teal & Blue Split',        effect: 'Arctic'    },
  { bg: 'linear-gradient(135deg,#f953c6,#b91d73)', icon: '🦋', title: 'Vibrant Pop',    meta: 'Saturation Boost',         effect: 'Pop'       },
];

const marqueeEl = document.getElementById('marquee');

// Double the array for seamless infinite scroll
[...showcaseData, ...showcaseData].forEach(item => {
  const card = document.createElement('div');
  card.className = 'showcase-card';
  card.innerHTML = `
    <div class="showcase-card-bg" style="background:${item.bg};">${item.icon}</div>
    <div class="effect-badge">${item.effect}</div>
    <div class="showcase-card-info">
      <div class="showcase-card-title">${item.title}</div>
      <div class="showcase-card-meta">${item.meta}</div>
    </div>
  `;
  marqueeEl.appendChild(card);
});


// ===== EDITOR =====
const fileInput       = document.getElementById('fileInput');
const uploadZone      = document.getElementById('uploadZone');
const editorResult    = document.getElementById('editorResult');
const previewImg      = document.getElementById('previewImg');
const processingOverlay = document.getElementById('processingOverlay');
const processingText  = document.getElementById('processingText');

// Open file picker on text click
document.getElementById('uploadTrigger').addEventListener('click', () => fileInput.click());

// Drag & drop handlers
uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
});

// File input change
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadImage(fileInput.files[0]);
});

/**
 * Load an image file into the editor canvas.
 * @param {File} file
 */
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = e => {
    previewImg.src = e.target.result;
    uploadZone.style.display = 'none';
    editorResult.classList.add('visible');
    showProcessing('ANALYZING WITH AI...');
    setTimeout(() => {
      processingText.textContent = 'APPLYING ENHANCEMENT...';
      setTimeout(() => {
        hideProcessing();
        applyCurrentFilter();
      }, 900);
    }, 700);
  };
  reader.readAsDataURL(file);
}


// ===== FILTER LOGIC =====
let currentFilter = 'natural';
let adjustValues  = { brightness: 50, contrast: 50, saturation: 50 };

/**
 * Select a filter preset and apply it.
 * @param {HTMLElement} btn  — clicked button
 * @param {string} filter    — filter key
 */
function applyFilter(btn, filter) {
  document.querySelectorAll('#tab-filters .filter-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = filter;
  applyCurrentFilter();
}

/** Build and set CSS filter string on preview image. */
function applyCurrentFilter() {
  const b = adjustValues.brightness;
  const c = adjustValues.contrast;
  const s = adjustValues.saturation;
  let filterStr = '';

  switch (currentFilter) {
    case 'glamour':
      filterStr = `brightness(${0.9 + b / 90}) saturate(${0.8 + s / 60}) contrast(${0.9 + c / 80})`;
      break;
    case 'vintage':
      filterStr = `sepia(0.4) contrast(${0.9 + c / 80}) brightness(${0.8 + b / 90})`;
      break;
    case 'cinematic':
      filterStr = `contrast(${1.1 + c / 120}) saturate(${0.5 + s / 120}) brightness(${0.7 + b / 100})`;
      break;
    case 'glow':
      filterStr = `brightness(${1 + b / 60}) blur(0.3px) saturate(${1 + s / 80})`;
      break;
    case 'bw':
      filterStr = `grayscale(1) contrast(${0.9 + c / 80}) brightness(${0.8 + b / 90})`;
      break;
    default: // natural
      filterStr = `brightness(${0.6 + b / 80}) contrast(${0.6 + c / 80}) saturate(${0.6 + s / 80})`;
  }

  previewImg.style.filter = filterStr;
}

/**
 * Update an adjustment slider value and re-render.
 * @param {HTMLInputElement} input
 * @param {string} type   — 'brightness' | 'contrast' | 'saturation'
 * @param {string} valId  — id of the display span
 */
function updateAdjust(input, type, valId) {
  adjustValues[type] = parseInt(input.value);
  document.getElementById(valId).textContent = input.value;
  if (previewImg.src) applyCurrentFilter();
}

/** Update vignette display value (cosmetic only). */
function updateVignette(input) {
  document.getElementById('vVal').textContent = input.value;
}

/** Toggle a beauty tool button on/off. */
function toggleBeauty(btn) {
  btn.classList.toggle('active');
}

/** Switch sidebar tabs. */
function switchTab(name, btn) {
  document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

/** Show processing overlay with a message. */
function showProcessing(msg) {
  processingText.textContent = msg;
  processingOverlay.classList.add('active');
}

/** Hide processing overlay. */
function hideProcessing() {
  processingOverlay.classList.remove('active');
}

/**
 * Simulate an AI enhancement pipeline with sequential messages.
 * If no image is loaded, trigger file picker instead.
 */
function applyAI() {
  if (!previewImg.src || previewImg.src === window.location.href) {
    fileInput.click();
    return;
  }

  const messages = [
    'RUNNING AI MODEL...',
    'DETECTING FACIAL FEATURES...',
    'APPLYING ENHANCEMENT...',
    'FINAL RENDER...',
  ];

  let i = 0;
  showProcessing(messages[i]);

  const interval = setInterval(() => {
    i++;
    if (i < messages.length) {
      processingText.textContent = messages[i];
    } else {
      clearInterval(interval);
      hideProcessing();
      applyCurrentFilter();
    }
  }, 500);
}

// Expose functions called via inline onclick attributes
window.applyFilter   = applyFilter;
window.updateAdjust  = updateAdjust;
window.updateVignette = updateVignette;
window.toggleBeauty  = toggleBeauty;
window.switchTab     = switchTab;
window.applyAI       = applyAI;
