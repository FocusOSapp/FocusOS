// Monk Mode: Minimal, distraction-free focus state that leverages existing fullscreen CSS
// - Toggles fullscreen mode and hides non-timer UI via CSS (body.fullscreen rules in index.html)
// - Lightweight: no changes to core timer logic; assumes the timer remains visible inside the focus card
// - Provides a simple UI toggle injected into the header if not present
(() => {
  const CLS = 'fullscreen';
  const BTN_ID = 'monkModeBtn';

  function createButton(){
    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.innerHTML = 'Monk Mode';
    btn.title = 'Enter immersive focus mode';
    btn.style.borderRadius = '999px';
    btn.style.padding = '10px 14px';
    btn.style.border = '1px solid var(--border)';
    btn.style.background = 'var(--surface2)';
    btn.style.color = 'var(--text)';
    btn.style.cursor = 'pointer';
    btn.style.fontWeight = '700';
    btn.style.fontSize = '12px';
    return btn;
  }

  function isFullscreenSupported(){return document.documentElement && typeof document.documentElement.requestFullscreen === 'function';}

  function enterFullscreen(){
    const el = document.documentElement;
    if(isFullscreenSupported()){
      el.requestFullscreen().catch(()=>{});
    }
  }

  function exitFullscreen(){
    if(document.fullscreenElement){document.exitFullscreen().catch(()=>{});}    
  }

  function toggleMonkMode(){
    const isOn = document.body.classList.toggle(CLS);
    if(isOn){
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }

  async function init(){
    // Avoid duplicate buttons
    if(document.getElementById(BTN_ID)) return;
    // Try to place in header right area if exists
    const container = document.querySelector('.nav-right') || document.body;
    const btn = createButton();
    container.appendChild(btn);
    btn.addEventListener('click', ()=>{
      toggleMonkMode();
    });

    // Reflect initial state if user reloads with fullscreen active
    // If the browser restored fullscreen state, respect it visually
    if(document.fullscreenElement){ document.body.classList.add(CLS); }
  }

  // Initialize after DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
