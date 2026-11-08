(function () {
  'use strict';

  const spriteImage = new Image();
  const fallbackSymbols = [14, 15, 16];
  const themes = [
    {match: /pirate|sea|ocean|dive/i, symbols: [2, 3, 6], colors: ['#092d46', '#13b8be']},
    {match: /pharaoh|aztec|temple|olympus/i, symbols: [0, 10, 12], colors: ['#412408', '#edb839']},
    {match: /gem|obsidian|vault|coin|treasure/i, symbols: [4, 12, 16], colors: ['#102044', '#39d8ef']},
    {match: /dragon|phoenix|fire|thunder|storm/i, symbols: [1, 8, 10], colors: ['#431312', '#fb6744']},
    {match: /neon|cyber|matrix|strike/i, symbols: [15, 16, 18], colors: ['#210e4e', '#e54cff']},
    {match: /samurai|sakura|asia|odin|rune/i, symbols: [1, 7, 13], colors: ['#291337', '#fc70b0']},
    {match: /aurora|cosmic|mystic|phantom|magic|rift/i, symbols: [14, 16, 18], colors: ['#102052', '#66a8ff']},
  ];
  const fruitSymbols = [
    {id: 'fruit_grapes', icon: '🍇'},
    {id: 'fruit_strawberry', icon: '🍓'},
    {id: 'fruit_apple', icon: '🍎'},
  ];

  let spriteLoad;

  function loadSprites() {
    if (!spriteLoad) {
      spriteLoad = fetch('../../assets/symbols.json')
        .then(response => {
          if (!response.ok) throw new Error(`Sprite metadata request failed (${response.status})`);
          return response.json();
        })
        .then(data => {
          const symbols = data['ultimate_multi_slot_sprite.jpg'];
          if (!Array.isArray(symbols) || symbols.length < 19) {
            throw new Error('Game symbol sprite metadata is incomplete');
          }
          return new Promise(resolve => {
            spriteImage.onload = () => resolve(symbols);
            spriteImage.onerror = () => {
              console.error('Could not load game symbol sprite sheet');
              resolve(null);
            };
            spriteImage.src = '../../assets/ultimate_multi_slot_sprite.jpg';
          });
        })
        .catch(error => {
          console.error('Could not load game card symbols:', error);
          return null;
        });
    }
    return spriteLoad;
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  function drawFruit(ctx, symbol, x, y, width, height) {
    const glow = ctx.createRadialGradient(x + width / 2, y + height / 2, 2, x + width / 2, y + height / 2, width / 2);
    glow.addColorStop(0, 'rgba(255,255,255,.2)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, width, height);
    ctx.font = `${Math.floor(height * 0.62)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol.icon, x + width / 2, y + height / 2 + 2);
  }

  function drawSymbol(ctx, sheet, index, x, y, width, height) {
    const symbol = sheet?.[index];
    if (symbol && spriteImage.complete && spriteImage.naturalWidth) {
      ctx.drawImage(spriteImage, symbol.x, symbol.y, symbol.width, symbol.height,
        x + 5, y + 4, width - 10, height - 8);
      return true;
    }
    return false;
  }

  async function renderGameCardArt(canvas, game) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const title = `${game.title || ''} ${game.id || ''} ${game.file || ''}`;
    const isForge = /dragons-forge/i.test(title);
    const theme = themes.find(item => item.match.test(title)) || {
      symbols: fallbackSymbols,
      colors: ['#17213b', '#ffcc55'],
    };
    const colors = isForge ? ['#36140d', '#fb673b'] : theme.colors;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, '#080714');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const orb = ctx.createRadialGradient(width * 0.5, height * 0.39, 3, width * 0.5, height * 0.39, width * 0.52);
    orb.addColorStop(0, `${colors[1]}66`);
    orb.addColorStop(1, `${colors[1]}00`);
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, width, height);

    const symbols = isForge ? await Promise.resolve(null) : await loadSprites();
    const cellWidth = 68;
    const cellHeight = 88;
    const gap = 9;
    const totalWidth = cellWidth * 3 + gap * 2;
    const startX = (width - totalWidth) / 2;
    const startY = 49;
    const spriteIndexes = theme.symbols;

    for (let index = 0; index < 3; index++) {
      const x = startX + index * (cellWidth + gap);
      roundRect(ctx, x, startY, cellWidth, cellHeight, 12);
      ctx.fillStyle = 'rgba(5,8,19,.78)';
      ctx.fill();
      ctx.strokeStyle = `${colors[1]}99`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      roundRect(ctx, x + 3, startY + 3, cellWidth - 6, cellHeight - 6, 9);
      ctx.clip();
      if (isForge) {
        drawFruit(ctx, fruitSymbols[index], x + 3, startY + 3, cellWidth - 6, cellHeight - 6);
      } else if (!drawSymbol(ctx, symbols, spriteIndexes[index], x, startY, cellWidth, cellHeight)) {
        ctx.font = '44px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(game.emoji || '🎰', x + cellWidth / 2, startY + cellHeight / 2);
      }
      ctx.restore();
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 10px Orbitron, system-ui, sans-serif';
    ctx.fillStyle = `${colors[1]}dd`;
    ctx.fillText('SPIN  •  WIN  •  REPEAT', width / 2, 25);
    ctx.beginPath();
    ctx.moveTo(28, 157);
    ctx.lineTo(width - 28, 157);
    ctx.strokeStyle = `${colors[1]}55`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  window.renderGameCardArt = renderGameCardArt;
})();
