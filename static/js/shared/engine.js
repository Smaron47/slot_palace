(function () {
  'use strict';

  function buildGameUI(root, options) {
    root.innerHTML = `
      <section id="gameContainer" class="slot-shell">
        <div id="gifLayer"></div>
        <header class="top-bar">
          <button class="top-btn" type="button" data-home aria-label="Back to game lobby">← Lobby</button>
          <h1 class="game-title"></h1>
          <button class="top-btn" type="button" data-how aria-label="How to play">? Help</button>
        </header>
        <div class="main-area">
          <div class="reel-area"><canvas id="gameCanvas" aria-label="Slot reels"></canvas></div>
          <aside class="right-panel">
            <section class="panel"><div class="balance-label">VIRTUAL CREDITS</div><div class="balance-value"></div></section>
            <section class="panel info-panel"><div class="info-title"></div><div class="info-value"></div><div class="win-value"></div></section>
          </aside>
        </div>
        <footer class="controls">
          <div class="bet-control">
            <span class="control-label">BET</span>
            <button class="bet-btn" type="button" data-bet="-1" aria-label="Decrease bet">−</button>
            <strong class="bet-value"></strong>
            <button class="bet-btn" type="button" data-bet="1" aria-label="Increase bet">+</button>
            <button class="action-btn" type="button" data-max>MAX</button>
          </div>
          <button class="spin-btn" type="button" aria-label="Spin reels">SPIN</button>
        </footer>
        <div class="feature-banner" aria-live="polite"></div>
        <div class="win-banner" aria-live="polite"><strong></strong><span></span></div>
        <div class="toast-stack" aria-live="polite"></div>
        <canvas class="confetti-layer" aria-hidden="true"></canvas>
      </section>
    `;

    const container = root.querySelector('#gameContainer');
    const canvas = root.querySelector('#gameCanvas');
    const ctx = canvas.getContext('2d');
    const balanceValue = root.querySelector('.balance-value');
    const betValue = root.querySelector('.bet-value');
    const infoTitle = root.querySelector('.info-title');
    const infoValue = root.querySelector('.info-value');
    const winValue = root.querySelector('.win-value');
    const featureBanner = root.querySelector('.feature-banner');
    const winBanner = root.querySelector('.win-banner');
    const spinButton = root.querySelector('.spin-btn');
    const betSteps = [1, 2, 5, 10, 20, 50, 100];
    const state = {balance: options.balance || 1000, bet: options.bet || 1};
    let spinHandler = null;
    let featureTimer = 0;
    let winTimer = 0;

    root.querySelector('.game-title').textContent = options.title || 'Slot Game';
    root.querySelector('[data-home]').addEventListener('click', () => { window.location.href = '/'; });
    root.querySelector('[data-how]').addEventListener('click', () => showFeature(options.howToWin || 'Match symbols to win virtual credits.'));
    root.querySelector('.bet-control').addEventListener('click', event => {
      const button = event.target.closest('[data-bet], [data-max]');
      if (!button || spinButton.disabled) return;
      if (button.hasAttribute('data-max')) {
        state.bet = betSteps[betSteps.length - 1];
      } else {
        const delta = Number(button.dataset.bet);
        const index = betSteps.indexOf(state.bet);
        state.bet = betSteps[Math.max(0, Math.min(betSteps.length - 1, (index < 0 ? 0 : index) + delta))];
      }
      updateBalance();
      betValue.textContent = String(state.bet);
    });
    spinButton.addEventListener('click', () => {
      if (!spinButton.disabled && spinHandler) spinHandler();
    });

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.round(bounds.width * ratio));
      const height = Math.max(1, Math.round(bounds.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    window.addEventListener('resize', resize, {passive: true});
    requestAnimationFrame(resize);
    betValue.textContent = String(state.bet);
    updateBalance();

    function showFeature(message) {
      featureBanner.textContent = message;
      featureBanner.classList.add('visible');
      clearTimeout(featureTimer);
      featureTimer = setTimeout(() => featureBanner.classList.remove('visible'), 2600);
    }

    function showWinOverlay(amount, title = 'WIN!', subtitle = '') {
      winBanner.querySelector('strong').textContent = title;
      winBanner.querySelector('span').textContent = `${subtitle} · +${Number(amount).toLocaleString()} credits`;
      winBanner.classList.add('visible');
      clearTimeout(winTimer);
      winTimer = setTimeout(() => winBanner.classList.remove('visible'), 2200);
    }

    function toastShow(title, message = '') {
      const item = document.createElement('div');
      item.className = 'toast-message';
      const heading = document.createElement('strong');
      heading.textContent = title;
      const detail = document.createElement('span');
      detail.textContent = message;
      item.append(heading, detail);
      root.querySelector('.toast-stack').append(item);
      setTimeout(() => item.remove(), 3000);
    }

    function playTone(frequency, duration = 0.1) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.055, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start();
        oscillator.stop(audio.currentTime + duration);
        oscillator.onended = () => audio.close();
      } catch (error) {
        console.warn('Audio is unavailable:', error);
      }
    }

    const confetti = {
      spawn(count = 40) {
        const layer = root.querySelector('.confetti-layer');
        const bounds = layer.getBoundingClientRect();
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        layer.width = Math.max(1, bounds.width * ratio);
        layer.height = Math.max(1, bounds.height * ratio);
        const particles = Array.from({length: Math.min(150, count)}, () => ({
          x: Math.random() * layer.width,
          y: -Math.random() * layer.height * 0.3,
          vy: 2 + Math.random() * 4,
          vx: (Math.random() - 0.5) * 2,
          size: 2 + Math.random() * 5,
          color: ['#ffcc33', '#ff4fd8', '#22d3ee', '#22ff88'][Math.floor(Math.random() * 4)],
        }));
        const started = performance.now();
        const draw = now => {
          const elapsed = now - started;
          const context = layer.getContext('2d');
          context.clearRect(0, 0, layer.width, layer.height);
          for (const particle of particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            context.fillStyle = particle.color;
            context.fillRect(particle.x, particle.y, particle.size, particle.size * 1.8);
          }
          if (elapsed < 1500) requestAnimationFrame(draw);
          else context.clearRect(0, 0, layer.width, layer.height);
        };
        requestAnimationFrame(draw);
      },
    };

    function updateBalance() {
      balanceValue.textContent = Math.max(0, Number(state.balance) || 0).toLocaleString();
      betValue.textContent = String(state.bet);
    }

    return {
      canvas,
      ctx,
      state,
      confetti,
      toast: {show: toastShow},
      setInfoTitle(value) { infoTitle.textContent = value; },
      setInfo(value) { infoValue.textContent = value; },
      updateBalance,
      setOnSpin(handler) { spinHandler = handler; },
      setSpinning(value) {
        spinButton.disabled = Boolean(value);
        spinButton.textContent = value ? 'SPINNING…' : 'SPIN';
      },
      finishSpin() { this.setSpinning(false); },
      animateWinDisplay(value) { winValue.textContent = `+${Number(value).toLocaleString()}`; },
      showWinOverlay,
      showFeature,
      playSpinSound() { playTone(210, 0.12); },
      playWinSound(amount) { if (amount > 0) playTone(660, 0.18); },
      playBonusSound() { playTone(880, 0.24); },
      shake() {
        container.classList.remove('shake');
        void container.offsetWidth;
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 450);
      },
    };
  }

  window.GameEngine = {buildGameUI};
})();
