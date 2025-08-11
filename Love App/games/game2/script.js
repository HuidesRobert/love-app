// Game state and plant logic + background effects
(function(){
  const PLOTS = 10; // 5x2 grid
  const BASE_GROW_MS = 60 * 1000; // base 60s growth (adjust as desired)

  const defaultState = {
    seeds: 5,
    fertilizer: 1,
    lp: 120,
    upgrades: {fastPercent:0,extraSeeds:0},
    plots: Array.from({length:PLOTS}).map(()=>({status:'empty',plantedAt:0,growthMs:0})),
    lastSave: Date.now()
  };

  const LS_KEY = 'love_garden_state_v1';
  let state = loadState();

  // DOM refs
  const seedsCounter = document.getElementById('seeds-counter');
  const fertCounter = document.getElementById('fert-counter');
  const lpCounter = document.getElementById('lp-counter');
  const plotGrid = document.getElementById('plot-grid');
  const shopBtn = document.getElementById('shop-toggle-button');
  const shopContainer = document.getElementById('shop-container');
  const openShopBtn = document.getElementById('open-shop-btn');
  const closeShopBtn = document.getElementById('close-shop');
  const backBtn = document.getElementById('back-btn');

  // --- init / state ---
  function init(){
    renderCounters();
    renderPlots();
    attachUI();
    tick(); // immediate
    setInterval(tick, 1000);
    startBackgroundEffects();
  }

  function loadState(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if(raw) {
        const parsed = JSON.parse(raw);
        if(!parsed.plots || parsed.plots.length !== PLOTS){
          parsed.plots = Array.from({length:PLOTS}).map(()=>({status:'empty',plantedAt:0,growthMs:0}));
        }
        return parsed;
      }
    }catch(e){ console.warn('load error', e); }
    return JSON.parse(JSON.stringify(defaultState));
  }

  function saveState(){
    state.lastSave = Date.now();
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }

  // --- rendering ---
  function renderCounters(){
    const extra = state.upgrades.extraSeeds || 2;
    seedsCounter.textContent = `Seeds: ${state.seeds} (+${extra})`;
    fertCounter.textContent = `Fertilizer: ${state.fertilizer}`;
    lpCounter.textContent = `LP: ${state.lp}`;
  }

  function renderPlots(){
    plotGrid.innerHTML = '';
    state.plots.forEach((p, idx)=>{
      const el = document.createElement('div');
      el.className = 'plot';
      el.dataset.index = idx;

      const overlay = document.createElement('div'); overlay.className = 'overlay';
      const actions = document.createElement('div'); actions.className = 'actions';

      const stage = document.createElement('div'); stage.className = 'plant-stage';

      if(p.status === 'empty'){
        stage.innerHTML = `<div class="plant-pot"></div>`;
        const plantBtn = document.createElement('button');
        plantBtn.className = 'glow-btn';
        plantBtn.textContent = 'Plant';
        plantBtn.onclick = (e)=>{ e.stopPropagation(); plantSeed(idx); };
        actions.appendChild(plantBtn);
      } else if(p.status === 'growing'){
        const elapsed = Date.now() - p.plantedAt;
        const progress = Math.min(1, elapsed / p.growthMs || 1);
        if(progress < 0.33) stage.innerHTML = `<div class="plant-pot"></div><div class="plant-sprout"></div>`;
        else if(progress < 0.85) stage.innerHTML = `<div class="plant-pot"></div><div class="plant-leaves"><div class="leaf l1"></div><div class="leaf l2"></div></div>`;
        else stage.innerHTML = `<div class="plant-pot"></div><div class="plant-leaves"><div class="leaf l1"></div><div class="leaf l2"></div></div><div class="bloom"></div>`;

        const info = document.createElement('div'); info.style.pointerEvents = 'auto';
        const timeLeft = Math.max(0, Math.ceil((p.growthMs - elapsed)/1000));
        const tLabel = document.createElement('div'); tLabel.textContent = `Time: ${timeLeft}s`;
        const fertBtn = document.createElement('button'); fertBtn.className='glow-btn'; fertBtn.textContent='Use Fertilizer';
        fertBtn.onclick = (e)=>{ e.stopPropagation(); useFertilizer(idx); };
        info.appendChild(tLabel);
        info.appendChild(fertBtn);
        actions.appendChild(info);
      } else if(p.status === 'grown'){
        stage.innerHTML = `<div class="plant-pot"></div><div class="plant-leaves"><div class="leaf l1"></div><div class="leaf l2"></div></div><div class="bloom"></div>`;
        const harvestBtn = document.createElement('button'); harvestBtn.className='glow-btn'; harvestBtn.textContent='Harvest';
        harvestBtn.onclick = (e)=>{ e.stopPropagation(); harvest(idx); };
        actions.appendChild(harvestBtn);
      }

      overlay.appendChild(actions);
      el.appendChild(stage);
      el.appendChild(overlay);
      el.onclick = ()=>plotClicked(idx);
      plotGrid.appendChild(el);
    });
  }

  // --- gameplay actions ---
  function plotClicked(idx){
    const p = state.plots[idx];
    if(p.status === 'empty'){
      plantSeed(idx);
    } else if(p.status === 'grown'){
      harvest(idx);
    }
  }

  function plantSeed(idx){
  if((state.seeds) <= 0){
    pulseMessage('No seeds available');
    return;
  }
  state.seeds = Math.max(0, state.seeds - 1);
  const effectiveMs = Math.max(3000, Math.round(BASE_GROW_MS * (1 - (state.upgrades.fastPercent||0))));
  state.plots[idx] = {status:'growing', plantedAt:Date.now(), growthMs: effectiveMs};
  saveState(); renderCounters(); renderPlots();
  pulseMessage('Seed planted');
}


  function useFertilizer(idx){
    if(state.fertilizer <= 0){ pulseMessage('No fertilizer'); return; }
    if(state.plots[idx].status !== 'growing'){ pulseMessage('Nothing to fertilize'); return; }
    state.fertilizer -= 1;
    state.plots[idx] = {status:'grown', plantedAt:0, growthMs:0};
    saveState(); renderCounters(); renderPlots();
    pulseMessage('Plant instantly grown');
  }

  function harvest(idx){
    const reward = 150 + Math.floor(Math.random()*50); // 20-35 LP
    state.lp += reward;
    state.plots[idx] = {status:'empty', plantedAt:0, growthMs:0};
    saveState(); renderCounters(); renderPlots();
    pulseMessage(`+${reward} LP`);
  }

  function tick(){
    let changed = false;
    state.plots.forEach((p)=>{
      if(p.status === 'growing'){
        const elapsed = Date.now() - p.plantedAt;
        if(elapsed >= p.growthMs){
          p.status = 'grown'; p.plantedAt = 0; p.growthMs = 0; changed = true;
        }
      }
    });
    if(changed){ saveState(); renderPlots(); }
  }

  // --- UI / shop ---
  function attachUI(){
    shopBtn && shopBtn.addEventListener('click', toggleShop);
    openShopBtn && openShopBtn.addEventListener('click', ()=>{ openShop(); });
    closeShopBtn && closeShopBtn.addEventListener('click', closeShop);
    backBtn && backBtn.addEventListener('click', ()=>{ window.history.back(); });

    // clicking outside shop closes it
    document.addEventListener('click', (e)=>{
      const panel = document.getElementById('shop-container');
      if(!panel) return;
      if(panel.classList.contains('open')){
        const within = e.target.closest('#shop-container') || e.target.closest('#open-shop-btn') || e.target.closest('#shop-toggle-button');
        if(!within){
          closeShop();
        }
      }
    });
  }

  function toggleShop(){ if(shopContainer.classList.contains('open')) closeShop(); else openShop(); }
  function openShop(){ shopContainer.classList.add('open'); shopContainer.classList.remove('hidden'); shopContainer.setAttribute('aria-hidden','false'); }
  function closeShop(){ shopContainer.classList.remove('open'); shopContainer.setAttribute('aria-hidden','true'); setTimeout(()=>{ if(!shopContainer.classList.contains('open')) shopContainer.classList.add('hidden'); },300); }

  // small floating message
  function pulseMessage(txt){
    const msg = document.createElement('div'); msg.className='pulse-msg'; msg.textContent = txt;
    document.body.appendChild(msg);
    msg.animate([{opacity:1, transform:'translateY(0)'},{opacity:0, transform:'translateY(-24px)'}],{duration:1400,easing:'ease'});
    setTimeout(()=>msg.remove(),1400);
  }

  // shop interface uses this global function
  window.shopApply = function(itemId){
    if(itemId === 'buy_seeds'){
      if(state.lp >= 50){ state.lp -= 50; state.seeds += 3; pulseMessage('Bought 3 seeds'); saveState(); renderCounters(); renderPlots(); }
      else pulseMessage('Not enough LP');
    } else if(itemId === 'buy_fert'){
      if(state.lp >= 90){ state.lp -= 90; state.fertilizer += 1; pulseMessage('Bought 1 fertilizer'); saveState(); renderCounters(); }
      else pulseMessage('Not enough LP');
    } else if(itemId === 'fast_growth'){
      if(state.lp >= 200){
        state.lp -= 200;
        state.upgrades.fastPercent = Math.min(0.75, (state.upgrades.fastPercent||0) + 0.15);
        pulseMessage('Growth speed upgraded');
        saveState(); renderCounters();
      } else pulseMessage('Not enough LP');
    } else if(itemId === 'extra_seeds_upgrade'){
      if(state.lp >= 180){
        state.lp -= 180;
        state.upgrades.extraSeeds = (state.upgrades.extraSeeds||0) + 2;
        pulseMessage('Permanent +2 seeds');
        saveState(); renderCounters();
      } else pulseMessage('Not enough LP');
    }
    renderPlots();
  };

  // --- BACKGROUND EFFECTS (particles, twinkles, wave) ---
  function startBackgroundEffects(){
    startWaveCanvas();
    startTwinklesCanvas();
    startParticlesCanvas();
    window.addEventListener('resize', () => {
      startWaveCanvas(true); startTwinklesCanvas(true); startParticlesCanvas(true);
    });
  }

  // Wave: subtle moving gradient waves drawn on canvas
  function startWaveCanvas(resizeOnly){
    const c = document.getElementById('wave-canvas');
    if(!c) return;
    const ctx = c.getContext('2d');
    function resize(){
      c.width = innerWidth; c.height = innerHeight;
    }
    resize();
    if(resizeOnly) return;
    let t = 0;
    function frame(){
      ctx.clearRect(0,0,c.width,c.height);
      // draw 2 translucent waves
      for(let i=0;i<3;i++){
        ctx.beginPath();
        const amplitude = 40 + i*18;
        const freq = 0.002 + i*0.0012;
        const ybase = c.height*0.7 - i*40;
        ctx.moveTo(0,c.height);
        for(let x=0;x<=c.width;x+=10){
          const y = ybase + Math.sin((x*freq) + (t*0.001*(1+i))) * amplitude;
          ctx.lineTo(x,y);
        }
        ctx.lineTo(c.width, c.height);
        const g = ctx.createLinearGradient(0,ybase, c.width, ybase+200);
        g.addColorStop(0, `rgba(0,217,255,${0.02 + i*0.01})`);
        g.addColorStop(1, `rgba(140,86,255,${0.005 + i*0.006})`);
        ctx.fillStyle = g;
        ctx.fill();
      }
      t += 1;
      requestAnimationFrame(frame);
    }
    frame();
  }

  // Twinkles: faint star-like dots that occasionally pulse
  function startTwinklesCanvas(resizeOnly){
    const c = document.getElementById('twinkles-canvas');
    if(!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = innerWidth, H = c.height = innerHeight;
    const N = Math.max(20, Math.floor((W*H) / 90000)); // density
    let tw = [];
    for(let i=0;i<N;i++){
      tw.push({x: Math.random()*W, y: Math.random()*H*0.6, r: Math.random()*2+0.6, phase: Math.random()*Math.PI*2, speed: 0.008 + Math.random()*0.02});
    }
    function resize(){
      W = c.width = innerWidth; H = c.height = innerHeight;
      // regenerate sparsely
      tw = [];
      const NN = Math.max(20, Math.floor((W*H) / 90000));
      for(let i=0;i<NN;i++) tw.push({x: Math.random()*W, y: Math.random()*H*0.6, r: Math.random()*2+0.6, phase: Math.random()*Math.PI*2, speed: 0.008 + Math.random()*0.02});
    }
    if(resizeOnly){ resize(); return; }
    function frame(t){
      ctx.clearRect(0,0,W,H);
      tw.forEach(p=>{
        p.phase += p.speed;
        const alpha = 0.15 + (Math.sin(p.phase)*0.35 + 0.35);
        ctx.beginPath();
        ctx.fillStyle = `rgba(200,255,255,${alpha*0.8})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    frame();
    window.addEventListener('resize', resize);
  }

  // Particles: floating soft dots
  function startParticlesCanvas(resizeOnly){
    const c = document.getElementById('particles-canvas');
    if(!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = innerWidth, H = c.height = innerHeight;
    let particles = [];
    function initParticles(){
      particles = Array.from({length:42}).map(()=>({
        x: Math.random()*W, y: Math.random()*H,
        r: Math.random()*2+0.8,
        vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2,
        alpha: 0.06 + Math.random()*0.08
      }));
    }
    function resize(){
      W = c.width = innerWidth; H = c.height = innerHeight;
      initParticles();
    }
    if(resizeOnly){ resize(); return; }
    initParticles();
    function frame(){
      ctx.clearRect(0,0,W,H);
      particles.forEach(p=>{
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0) p.x = W;
        if(p.x > W) p.x = 0;
        if(p.y < 0) p.y = H;
        if(p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.fillStyle = `rgba(0,217,255,${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    frame();

    window.addEventListener('resize', resize);
  }

  // start everything
  document.addEventListener('DOMContentLoaded', init);
})();
