// Social Media Blocker: lightweight in-app blocker for Monk Mode
// - Intercepts in-app links and common social domains
// - Shows a blocking overlay with a reminder message
(() => {
  const BLOCKED_DOMAINS = [ 'instagram.com', 'youtube.com', 'twitter.com', 'x.com', 'reddit.com', 't.co' ];
  const OVERLAY_ID = 'monk-block-overlay';
  let active = false;

  function showOverlay(msg){ let o=document.getElementById(OVERLAY_ID); if(!o){ o=document.createElement('div'); o.id=OVERLAY_ID; o.style.position='fixed'; o.style.inset='0'; o.style.background='rgba(0,0,0,.85)'; o.style.display='flex'; o.style.alignItems='center'; o.style.justifyContent='center'; o.style.zIndex='99998'; o.style.color='#fff'; o.style.textAlign='center'; o.style.padding='20px'; document.body.appendChild(o); }
    o.innerHTML = `<div style="max-width:420px;margin:auto;background:rgba(15,15,20,.95);border-radius:18px;padding:20px;border:1px solid rgba(255,255,255,.15);">`+
      `<div style="font-size:20px;font-weight:700;margin-bottom:8px">Monk Mode Active</div>`+
      `<div style="font-size:14px;opacity:.92;margin-bottom:12px">You are in Monk Mode. Stay focused on your current task.</div>`+
      `<button id="monkDismiss" style="padding:8px 14px;border-radius:8px;border:1px solid #fff;background:#111;cursor:pointer">Dismiss</button>`+
      `</div>`;
    const btn=document.getElementById('monkDismiss'); btn.addEventListener('click',()=>{hideOverlay();});
  }
  function hideOverlay(){ const o=document.getElementById(OVERLAY_ID); if(o){ o.style.display='none'; } }

  function isBlocked(href){ try{ const url=new URL(href, window.location.href); return BLOCKED_DOMAINS.some(d=>url.hostname.includes(d)); }catch(_) { return false; } }

  function intercept(e){ const t=e.target.closest('a'); if(!t) return; const href=t.getAttribute('href'); if(!href) return; if(isBlocked(href)) { e.preventDefault(); showOverlay('You are in Monk Mode. Stay focused.'); window.focus(); } }

  function init(){ // minimal hook: intercept all clicks on anchor tags
    document.addEventListener('click', intercept, true);
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
