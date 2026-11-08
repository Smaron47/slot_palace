(function () {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100%;background:#030712;color:#f8fafc;font-family:Rajdhani,system-ui,sans-serif}
    body{min-height:100vh;overflow:hidden}
    #app{min-height:100vh;display:grid;place-items:center;padding:12px}
    .slot-shell{--accent:#ffcc33;position:relative;width:min(1280px,98vw);height:min(900px,96vh);min-height:520px;overflow:hidden;border:1px solid color-mix(in srgb,var(--accent),transparent 40%);border-radius:24px;background:linear-gradient(145deg,rgba(8,15,32,.96),rgba(4,7,18,.98));box-shadow:0 24px 80px #000b,0 0 42px color-mix(in srgb,var(--accent),transparent 82%);display:flex;flex-direction:column;isolation:isolate}
    #gifLayer{position:absolute;inset:0;z-index:-1;background-position:center;background-size:cover;opacity:.12;pointer-events:none}
    .top-bar{position:relative;z-index:20;display:flex;align-items:center;gap:14px;min-height:64px;padding:10px 18px;border-bottom:1px solid #ffffff20;background:#050914bb}
    .game-title{flex:1;margin:0;text-align:center;color:var(--accent);font:900 clamp(.8rem,2vw,1.3rem) Orbitron,system-ui,sans-serif;letter-spacing:1px}
    .top-btn,.action-btn,.bet-btn{border:1px solid color-mix(in srgb,var(--accent),transparent 40%);border-radius:10px;background:#ffffff0c;color:#fff;cursor:pointer;font:700 .8rem Orbitron,system-ui,sans-serif}
    .top-btn{padding:9px 12px}
    .main-area{position:relative;z-index:1;display:flex;flex:1;min-height:0;padding:12px;gap:12px}
    .reel-area{position:relative;flex:1;min-width:0;min-height:0;overflow:hidden;border:1px solid color-mix(in srgb,var(--accent),transparent 60%);border-radius:18px;background:#050914aa}
    #gameCanvas{display:block;width:100%;height:100%}
    .right-panel{width:176px;display:flex;flex-direction:column;gap:10px}
    .panel{padding:14px;border:1px solid #ffffff20;border-radius:14px;background:#07101fbb;text-align:center}
    .balance-label,.control-label{display:block;color:#9daec5;font:700 .62rem Orbitron,system-ui,sans-serif;letter-spacing:1.5px}
    .balance-value{margin-top:5px;color:var(--accent);font:900 1.25rem Orbitron,system-ui,sans-serif}
    .info-title{color:#a7b3c8;font-size:.75rem}
    .info-value{margin-top:6px;color:#fff;font:800 1.5rem Orbitron,system-ui,sans-serif}
    .win-value{min-height:20px;margin-top:8px;color:#58f6ac;font-weight:700}
    .controls{position:relative;z-index:30;display:flex;align-items:center;justify-content:center;gap:24px;padding:8px 18px 16px}
    .bet-control{display:flex;align-items:center;gap:9px}
    .bet-btn{width:38px;height:38px;font-size:1.2rem}
    .bet-value{min-width:38px;text-align:center;font:800 1rem Orbitron,system-ui,sans-serif}
    .action-btn{height:36px;padding:0 12px}
    .spin-btn{width:82px;height:82px;border:3px solid #fff9;border-radius:50%;background:radial-gradient(circle at 30% 25%,#fff4b0,var(--accent) 45%,#ad5d00);box-shadow:0 6px 24px color-mix(in srgb,var(--accent),transparent 45%);color:#171107;cursor:pointer;font:900 .82rem Orbitron,system-ui,sans-serif;transition:transform .18s,filter .18s}
    .spin-btn:hover:not(:disabled){transform:scale(1.05);filter:brightness(1.1)}
    .spin-btn:disabled{cursor:wait;filter:saturate(.6)}
    .feature-banner,.win-banner{position:absolute;z-index:80;left:50%;top:48%;width:min(86%,680px);padding:16px;border:1px solid var(--accent);border-radius:14px;background:#030712ec;box-shadow:0 0 30px color-mix(in srgb,var(--accent),transparent 50%);text-align:center;opacity:0;pointer-events:none;transform:translate(-50%,-40%) scale(.94);transition:opacity .2s,transform .2s}
    .feature-banner.visible,.win-banner.visible{opacity:1;transform:translate(-50%,-50%) scale(1)}
    .win-banner{display:flex;flex-direction:column;gap:8px;color:#fff}
    .win-banner strong{color:var(--accent);font:900 1.5rem Orbitron,system-ui,sans-serif}
    .toast-stack{position:absolute;z-index:100;right:14px;top:76px;display:grid;gap:8px;max-width:min(360px,80vw)}
    .toast-message{display:grid;gap:2px;padding:10px 14px;border:1px solid #ffffff35;border-radius:10px;background:#030712ed;box-shadow:0 8px 24px #0008}
    .toast-message strong{color:var(--accent)}
    .toast-message span{color:#d1d9e6;font-size:.85rem}
    .confetti-layer{position:absolute;inset:0;z-index:75;width:100%;height:100%;pointer-events:none}
    .shake{animation:cabinetShake .38s ease}
    @keyframes cabinetShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
    @media(max-width:700px){body{overflow:auto}#app{padding:0}.slot-shell{width:100vw;height:100dvh;min-height:500px;border-radius:0}.top-bar{min-height:55px;padding:8px}.main-area{padding:7px;gap:7px}.right-panel{width:102px}.panel{padding:9px 5px}.balance-value{font-size:.92rem}.controls{gap:12px;padding:7px 8px 12px}.spin-btn{width:68px;height:68px}.bet-control{gap:5px}.bet-btn{width:31px;height:33px}.action-btn{padding:0 7px;font-size:.65rem}.game-title{font-size:.75rem}}
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
  `;
  document.head.appendChild(style);
})();
