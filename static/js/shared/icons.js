(function () {
  'use strict';

  const sheet = new Image();
  const sprites = {};
  let loadPromise;

  function getSprite() {
    if (!loadPromise) {
      loadPromise = fetch('../../assets/symbols.json')
        .then(response => {
          if (!response.ok) throw new Error('Could not load game symbols');
          return response.json();
        })
        .then(data => {
          Object.assign(sprites, data['ultimate_multi_slot_sprite.jpg'] || {});
          return new Promise(resolve => {
            sheet.onload = () => resolve(true);
            sheet.onerror = () => resolve(false);
            sheet.src = '../../assets/ultimate_multi_slot_sprite.jpg';
          });
        })
        .catch(error => {
          console.error(error);
          return false;
        });
    }
    return loadPromise;
  }

  function emojiFor(id) {
    if (id === 'wild') return '🃏';
    if (id === 'scatter') return '🔮';
    if (id.startsWith('fruit_')) {
      return ({grapes:'🍇', strawberry:'🍓', apple:'🍎', cherry:'🍒', plum:'🍑',
        pear:'🍐', orange:'🍊', lemon:'🍋', pineapple:'🍍'})[id.slice(6)] || '🍒';
    }
    if (id.startsWith('suit_')) {
      return id.includes('diamond') ? '♦️' : id.includes('spade') ? '♠️' : '♣️';
    }
    return '💎';
  }

  function drawSvgSym(ctx, id, x, y, width, height, alpha = 1, glow = 0) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const spriteIndex = /^spr_(\d{2})$/.exec(String(id));
    const sprite = spriteIndex && sprites[Number(spriteIndex[1]) - 1];
    if (sprite && sheet.complete && sheet.naturalWidth) {
      ctx.drawImage(sheet, sprite.x, sprite.y, sprite.width, sprite.height,
        x + width * 0.08, y + height * 0.06, width * 0.84, height * 0.88);
    } else {
      const color = id === 'wild' ? '#3ddc97' : id === 'scatter' ? '#9b7bff' : '#f8cc62';
      const size = Math.floor(Math.min(width, height) * 0.59);
      ctx.shadowColor = color;
      ctx.shadowBlur = glow ? Math.min(20, glow * 18) : 8;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${size}px system-ui, sans-serif`;
      ctx.fillText(emojiFor(String(id)), x + width / 2, y + height / 2);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  function drawSpriteToCanvas(id, size) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.fillStyle = 'rgba(0,0,0,.24)';
    ctx.fillRect(0, 0, size, size);
    drawSvgSym(ctx, String(id), 2, 2, size - 4, size - 4, 1, 0.2);
    return canvas.toDataURL('image/png');
  }

  const ICON_LIB = {
    getSprite,
    drawSpriteToCanvas,
    drawSvgSym,
    glow,
    Easing: {
      outBack(t) {
        const c = 1.70158;
        return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
      },
    },
  };

  function glow(ctx, text, x, y, color, size = 14, blur = 10) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${size}px Orbitron, system-ui, sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  window.ICON_LIB = ICON_LIB;
  window.drawSvgSym = drawSvgSym;
  window.glow = glow;
})();
