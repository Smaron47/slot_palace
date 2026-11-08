/* ============================================================
   Spin Palace - Shared Game JS
   Common utilities for all slot games:
   - GIF overlays (loading, win, transaction)
   - Toast notifications
   - Shared demo overlays and notifications
   ============================================================ */

const GP = {
  soundEnabled: true,

  init: function(options = {}) {
    this.soundEnabled = options.soundEnabled !== false;
    this._createOverlay('gp-overlay-loading', '../../assets/loading&win.gif');
    this._createOverlay('gp-overlay-win', '../../assets/win.gif');
    this._createOverlay('gp-overlay-tx', '../../assets/transaction.gif');
    this._injectStyles();
    console.log('[GP] static demo initialized');
  },

  _createOverlay: function(id, gifSrc) {
    if (document.getElementById(id)) return;
    const wrap = document.createElement('div');
    wrap.id = id;
    wrap.className = 'gp-overlay';
    const img = document.createElement('img');
    img.src = gifSrc;
    img.alt = id;
    wrap.appendChild(img);
    document.body.appendChild(wrap);
  },

  _injectStyles: function() {
    // Ensure overlay CSS exists even if game-shell.css not loaded
    if (document.getElementById('gp-styles')) return;
    const s = document.createElement('style');
    s.id = 'gp-styles';
    s.textContent = `
      .gp-overlay { position: fixed; inset: 0; z-index: 999; display: none;
        align-items: center; justify-content: center; background: rgba(0,0,0,.7);
        backdrop-filter: blur(4px); flex-direction: column; }
      .gp-overlay img { max-width: 320px; max-height: 320px;
        animation: gp-overlay-pop .4s cubic-bezier(.175,.885,.32,1.275); }
      @keyframes gp-overlay-pop {
        0% { transform: scale(.6); opacity: 0; }
        70% { transform: scale(1.15); opacity: .9; }
        100% { transform: scale(1); opacity: 1; }
      }
      #gp-overlay-loading { z-index: 1000; }
      #gp-overlay-win { z-index: 1001; }
      #gp-overlay-tx { z-index: 1002; }
      .gp-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        z-index: 2000; padding: 10px 20px; border-radius: 10px;
        background: rgba(0,0,0,.8); color: #fff; font-size: .9rem;
        border: 1px solid rgba(255,255,255,.2);
        box-shadow: 0 10px 30px rgba(0,0,0,.6);
        animation: gp-toast-slide .3s ease; pointer-events: none; }
      @keyframes gp-toast-slide {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(s);
  },

  showLoading: function() {
    const el = document.getElementById('gp-overlay-loading');
    if (el) el.style.display = 'flex';
  },
  hideLoading: function() {
    const el = document.getElementById('gp-overlay-loading');
    if (el) el.style.display = 'none';
  },
  showWin: function(amount, cb) {
    const el = document.getElementById('gp-overlay-win');
    if (el) el.style.display = 'flex';
    this.toast(`Win: ${amount}`, 'success');
    setTimeout(() => {
      if (el) el.style.display = 'none';
      if (cb) cb();
    }, 1800);
  },
  showTx: function(cb) {
    const el = document.getElementById('gp-overlay-tx');
    if (el) el.style.display = 'flex';
    setTimeout(() => {
      if (el) el.style.display = 'none';
      if (cb) cb();
    }, 1200);
  },
  toast: function(msg, type) {
    const t = document.createElement('div');
    t.className = 'gp-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  },

  playSound: function(id) {
    if (!this.soundEnabled) return;
    try {
      const audio = new Audio(`../../assets/sounds/${id}.mp3`);
      audio.play().catch(() => {});
    } catch (e) {}
  }
};

// Auto-init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GP.init());
} else {
  GP.init();
}