// Ambient (Rain / Forest / White Noise) system using Web Audio API
// Features:
// - Looping ambient streams generated in-code (no external assets required)
// - Volume control and start/stop
// - Persist preference across sessions
// - Minimal UI: a floating control panel in the bottom-right
(async ()=>{
  const STORAGE_KEY='focusos:ambient';
  const TYPES = ['rain','forest','white'];
  let ctx=null; let source=null; let gain=null; let filter=null; let mode='rain'; let playing=false; let impulse=null; let loopId=null; let vol=0.5;

  function ensureCtx(){ if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)(); gain=ctx.createGain(); gain.gain.value=vol; gain.connect(ctx.destination);} return ctx; }

  function createNoiseBuffer(lenSec=6){ const sampleRate=44100; const frameCount=sampleRate*lenSec; const buffer=ctx.createBuffer(1,frameCount,sampleRate); const data=buffer.getChannelData(0); for(let i=0;i<frameCount;i++){ data[i]=(Math.random()*2-1)*0.4; } return buffer; }

  function connectNodes(bufferSource){ bufferSource.loop=true; const noiseGain=ctx.createGain(); noiseGain.gain.value=0.6; bufferSource.connect(noiseGain); // route to filter
  }

  function buildRainChain(){ const b = createNoiseBuffer(12); const src = ctx.createBufferSource(); src.buffer=b; // subtle cascading filters
  const low = ctx.createBiquadFilter(); low.type='lowpass'; low.frequency.value=6000;
  const high = ctx.createBiquadFilter(); high.type='highpass'; high.frequency.value=1000;
  const reverb = ctx.createConvolver(); // naive impulse (short decay)
  // Simple impulse response
  const irBuffer = ctx.createBuffer(2, 44100, 44100);
  for(let ch=0; ch<2; ch++){
    const channelData = irBuffer.getChannelData(ch);
    for(let i=0; i<44100; i++){ channelData[i] = (Math.random()*2-1) * Math.pow(1 - i/44100, 2) * 0.08; }
  }
  reverb.buffer = irBuffer;
  src.connect(low); low.connect(high); high.connect(reverb); reverb.connect(gain);
  return src;
  }

  function buildForestChain(){ const b = createNoiseBuffer(8); const src = ctx.createBufferSource(); src.buffer=b; src.loop=true; const filter = ctx.createBiquadFilter(); filter.type='peaking'; filter.frequency.value=1800; filter.Q.value=1; filter.gain.value=2; src.connect(filter); filter.connect(gain); return src; }

  function buildWhiteChain(){ const b = createNoiseBuffer(6); const src = ctx.createBufferSource(); src.buffer=b; src.loop=true; const bass = ctx.createBiquadFilter(); bass.type='lowshelf'; bass.frequency.value=200; bass.gain.value=-6; src.connect(bass); bass.connect(gain); return src; }

  function startStream(type){ stopStream(); ensureCtx(); gain.disconnect(); gain.connect(ctx.destination);
    if(type==='rain') { const s=buildRainChain(); source=s; s.start(0); s.connect(gain); playing=true; }
    else if(type==='forest') { const s=buildForestChain(); source=s; s.start(0); s.connect(gain); playing=true; }
    else { const s=buildWhiteChain(); source=s; s.start(0); s.connect(gain); playing=true; }
    mode=type;
  }

  function stopStream(){ if(source){ try{ source.stop(0); }catch(e){} } source=null; playing=false; }

  function setVolume(v){ vol=v; if(gain) gain.gain.value=v; localStorage.setItem(STORAGE_KEY, JSON.stringify({type:mode,volume:vol})); }

  function applyUI(){ // create a tiny ambient panel
    const panelId='ambientPanel';
    let panel=document.getElementById(panelId);
    if(panel) return;
    panel=document.createElement('div'); panel.id=panelId; panel.style.position='fixed'; panel.style.bottom='16px'; panel.style.right='16px'; panel.style.background='rgba(0,0,0,.6)'; panel.style.border='1px solid rgba(255,255,255,.15)'; panel.style.borderRadius='12px'; panel.style.padding='12px'; panel.style.zIndex='9999'; panel.style.backdropFilter='blur(6px)'; panel.style.display='flex'; panel.style.flexDirection='column'; panel.style.gap='8px';
    const t=document.createElement('div'); t.style.fontSize='12px'; t.style.color='var(--text)'; t.textContent='Ambient';
    const row=document.createElement('div'); row.style.display='flex'; row.style.gap='6px';
    TYPES.forEach((type)=>{ const btn=document.createElement('button'); btn.textContent=type; btn.style.padding='6px 10px'; btn.style.fontSize='11px'; btn.style.borderRadius='8px'; btn.style.border='1px solid var(--border)'; btn.style.cursor='pointer'; btn.addEventListener('click', ()=>startStream(type)); if(type===mode) btn.style.background='var(--accent)'; row.appendChild(btn); });
    const volIn=document.createElement('input'); volIn.type='range'; volIn.min=0; volIn.max=1; volIn.step=0.01; volIn.value=vol; volIn.style.width='120px'; volIn.addEventListener('input', (e)=>setVolume(parseFloat(e.target.value)));
    panel.appendChild(t); panel.appendChild(row); panel.appendChild(volIn);
    document.body.appendChild(panel);
  }

  function init(){ applyUI(); // restore last state if any
    const last = localStorage.getItem(STORAGE_KEY); if(last){ try{ const obj=JSON.parse(last); if(obj.type && TYPES.includes(obj.type)) startStream(obj.type); if(obj.volume!==undefined){setVolume(obj.volume);} }catch(e){} }
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); applyUI(); }
})();
