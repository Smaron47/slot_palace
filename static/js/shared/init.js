(function () {
  'use strict';

  function start() {
    if (typeof window.startGame !== 'function') {
      const error = new Error('This game did not register its start function');
      console.error(error);
      document.body.textContent = 'Game could not start. Please return to the lobby and try again.';
      return;
    }
    try {
      window.startGame();
    } catch (error) {
      console.error('Game initialization failed:', error);
      const message = document.createElement('p');
      message.textContent = 'Game failed to start. Please return to the lobby and try again.';
      message.setAttribute('role', 'alert');
      document.body.append(message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once: true});
  } else {
    start();
  }
})();
