// =============================================
//   AuraithX — High-Tech Welcome Intro
//   Works on Desktop, Android, iOS
// =============================================

(function () {

  // ---- Inject Styles ----
  const style = document.createElement('style');
  style.textContent = `
    #ax-intro {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #040812;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-family: 'Orbitron', monospace;
    }

    /* Grid background */
    #ax-intro::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
      animation: ax-grid-fade 3s ease forwards;
    }

    @keyframes ax-grid-fade {
      0%   { opacity: 0; }
      30%  { opacity: 1; }
      85%  { opacity: 1; }
      100% { opacity: 0; }
    }

    /* Scanlines */
    #ax-intro::after {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.1) 2px,
        rgba(0,0,0,0.1) 4px
      );
      pointer-events: none;
    }

    /* Corner brackets */
    .ax-corner {
      position: absolute;
      width: 32px;
      height: 32px;
      opacity: 0;
      animation: ax-corner-in 0.5s ease forwards;
    }
    .ax-corner.tl { top: 24px; left: 24px; border-top: 2px solid #00f5ff; border-left: 2px solid #00f5ff; animation-delay: 0.1s; }
    .ax-corner.tr { top: 24px; right: 24px; border-top: 2px solid #00f5ff; border-right: 2px solid #00f5ff; animation-delay: 0.2s; }
    .ax-corner.bl { bottom: 24px; left: 24px; border-bottom: 2px solid #00f5ff; border-left: 2px solid #00f5ff; animation-delay: 0.3s; }
    .ax-corner.br { bottom: 24px; right: 24px; border-bottom: 2px solid #00f5ff; border-right: 2px solid #00f5ff; animation-delay: 0.4s; }

    @keyframes ax-corner-in {
      from { opacity: 0; transform: scale(0.5); }
      to   { opacity: 1; transform: scale(1); }
    }

    /* Center content */
    .ax-center {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      z-index: 2;
    }

    /* Hex ring */
    .ax-ring {
      width: 120px;
      height: 120px;
      position: relative;
      margin-bottom: 28px;
      animation: ax-ring-in 0.6s ease 0.3s both;
    }

    @keyframes ax-ring-in {
      from { opacity: 0; transform: scale(0.4) rotate(-90deg); }
      to   { opacity: 1; transform: scale(1) rotate(0deg); }
    }

    .ax-ring svg {
      width: 100%;
      height: 100%;
      animation: ax-ring-spin 8s linear infinite;
    }

    @keyframes ax-ring-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    .ax-ring-inner {
      position: absolute;
      inset: 20px;
      border-radius: 50%;
      border: 1px solid rgba(0,245,255,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: ax-ring-spin 4s linear infinite reverse;
    }

    .ax-ring-core {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,245,255,0.9) 0%, rgba(0,245,255,0.1) 60%, transparent 100%);
      box-shadow: 0 0 20px rgba(0,245,255,0.8), 0 0 40px rgba(0,245,255,0.4);
      animation: ax-core-pulse 1.5s ease-in-out infinite;
    }

    @keyframes ax-core-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50%       { transform: scale(1.2); opacity: 0.7; }
    }

    /* Brand name */
    .ax-brand {
      font-size: clamp(1.8rem, 6vw, 3rem);
      font-weight: 900;
      letter-spacing: 8px;
      color: #00f5ff;
      text-shadow: 0 0 30px rgba(0,245,255,0.7), 0 0 60px rgba(0,245,255,0.3);
      opacity: 0;
      animation: ax-brand-in 0.7s ease 0.8s forwards;
      text-transform: uppercase;
    }

    @keyframes ax-brand-in {
      from { opacity: 0; letter-spacing: 20px; filter: blur(8px); }
      to   { opacity: 1; letter-spacing: 8px;  filter: blur(0); }
    }

    /* Subtitle */
    .ax-sub {
      font-family: 'Share Tech Mono', monospace;
      font-size: clamp(0.55rem, 2vw, 0.7rem);
      letter-spacing: 5px;
      color: #b042ff;
      text-transform: uppercase;
      margin-top: 8px;
      opacity: 0;
      animation: ax-fade-up 0.6s ease 1.3s forwards;
    }

    @keyframes ax-fade-up {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Divider line */
    .ax-divider {
      width: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #00f5ff, transparent);
      margin: 20px 0;
      animation: ax-line-grow 0.8s ease 1.5s forwards;
    }

    @keyframes ax-line-grow {
      from { width: 0; opacity: 0; }
      to   { width: 240px; opacity: 1; }
    }

    /* Boot text */
    .ax-boot {
      font-family: 'Share Tech Mono', monospace;
      font-size: clamp(0.6rem, 2vw, 0.72rem);
      color: rgba(0,245,255,0.5);
      letter-spacing: 2px;
      min-height: 1.2em;
      text-align: center;
      opacity: 0;
      animation: ax-fade-up 0.4s ease 1.8s forwards;
    }

    /* Progress bar */
    .ax-progress-wrap {
      width: 240px;
      height: 2px;
      background: rgba(0,245,255,0.1);
      border-radius: 2px;
      margin-top: 16px;
      overflow: hidden;
      opacity: 0;
      animation: ax-fade-up 0.4s ease 1.9s forwards;
    }

    .ax-progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #b042ff, #00f5ff);
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(0,245,255,0.6);
      transition: width 0.12s linear;
    }

    /* System tags */
    .ax-tags {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      opacity: 0;
      animation: ax-fade-up 0.4s ease 2s forwards;
    }

    .ax-tag {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.55rem;
      letter-spacing: 2px;
      padding: 4px 10px;
      border: 1px solid rgba(0,245,255,0.2);
      border-radius: 2px;
      color: rgba(0,245,255,0.4);
      text-transform: uppercase;
    }

    /* Exit flash */
    .ax-flash {
      position: absolute;
      inset: 0;
      background: #00f5ff;
      opacity: 0;
      pointer-events: none;
    }

    .ax-flash.active {
      animation: ax-flash-out 0.5s ease forwards;
    }

    @keyframes ax-flash-out {
      0%   { opacity: 0.6; }
      100% { opacity: 0; }
    }

    /* Whole overlay exit */
    #ax-intro.ax-exit {
      animation: ax-intro-exit 0.6s ease forwards;
    }

    @keyframes ax-intro-exit {
      0%   { opacity: 1; transform: scale(1); }
      40%  { opacity: 1; transform: scale(1.03); }
      100% { opacity: 0; transform: scale(0.96); pointer-events: none; }
    }
  `;
  document.head.appendChild(style);

  // ---- Build DOM ----
  const overlay = document.createElement('div');
  overlay.id = 'ax-intro';
  overlay.innerHTML = `
    <div class="ax-corner tl"></div>
    <div class="ax-corner tr"></div>
    <div class="ax-corner bl"></div>
    <div class="ax-corner br"></div>

    <div class="ax-center">
      <div class="ax-ring">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="56" stroke="rgba(0,245,255,0.15)" stroke-width="1"/>
          <circle cx="60" cy="60" r="56" stroke="url(#axGrad)" stroke-width="2"
            stroke-dasharray="60 295" stroke-linecap="round"/>
          <circle cx="60" cy="60" r="56" stroke="url(#axGrad2)" stroke-width="1"
            stroke-dasharray="20 335" stroke-linecap="round"/>
          <defs>
            <linearGradient id="axGrad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#00f5ff"/>
              <stop offset="100%" stop-color="#b042ff"/>
            </linearGradient>
            <linearGradient id="axGrad2" x1="120" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#b042ff"/>
              <stop offset="100%" stop-color="#00f5ff"/>
            </linearGradient>
          </defs>
        </svg>
        <div class="ax-ring-inner">
          <div class="ax-ring-core"></div>
        </div>
      </div>

      <div class="ax-brand">AuraithX</div>
      <div class="ax-sub">Task Management System</div>

      <div class="ax-divider"></div>

      <div class="ax-boot" id="ax-boot-text">INITIALIZING...</div>

      <div class="ax-progress-wrap">
        <div class="ax-progress-bar" id="ax-bar"></div>
      </div>

      <div class="ax-tags">
        <div class="ax-tag">PWA</div>
        <div class="ax-tag">Offline</div>
        <div class="ax-tag">v2.0.0</div>
      </div>
    </div>

    <div class="ax-flash" id="ax-flash"></div>
  `;
  if (document.body) {
    document.body.appendChild(overlay);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(overlay);
    });
  }

  // ---- Boot sequence text ----
  const bootLines = [
    'INITIALIZING SYSTEM...',
    'LOADING MODULES...',
    'CONNECTING LOCAL STORAGE...',
    'CALIBRATING INTERFACE...',
    'SYSTEM READY'
  ];

  const bootEl = document.getElementById('ax-boot-text');
  const bar     = document.getElementById('ax-bar');
  const flash   = document.getElementById('ax-flash');

  let lineIndex = 0;
  const totalDuration = 2200; // ms for progress bar to fill
  const startTime = Date.now() + 2000; // start after intro animations

  // Animate progress bar
  function animateBar() {
    const elapsed = Date.now() - startTime;
    const pct = Math.min((elapsed / totalDuration) * 100, 100);
    bar.style.width = pct + '%';

    // Update boot text at intervals
    const expectedLine = Math.floor((pct / 100) * (bootLines.length - 1));
    if (expectedLine !== lineIndex && expectedLine < bootLines.length) {
      lineIndex = expectedLine;
      bootEl.textContent = bootLines[lineIndex];
    }

    if (pct < 100) {
      requestAnimationFrame(animateBar);
    } else {
      bootEl.textContent = bootLines[bootLines.length - 1];
      // Flash and exit
      setTimeout(() => {
        flash.classList.add('active');
        setTimeout(() => {
          overlay.classList.add('ax-exit');
          setTimeout(() => {
            overlay.remove();
            style.remove();
          }, 650);
        }, 200);
      }, 400);
    }
  }

  // Start bar after intro animations settle
  setTimeout(() => requestAnimationFrame(animateBar), 2000);

})();
