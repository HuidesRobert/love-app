// love.points.js
// Single source of truth for Love Points and the shared state.
// Saves under 'love_garden_state_v1' so it's compatible with existing files.

const LovePoints = (function(){
  const LS_KEY = 'love_garden_state_v1';

  const DEFAULT = {
    lp: 0,
    seeds: 0,
    fertilizer: 0,
    upgrades: {
      multiplier: 1,
      bonusPoints: 0,
      critChance: 0,
      fastPercent: 0,
      extraSeeds: 0
    },
    plots: [],
    lastSave: 0
  };

  let state = loadState();
  let listeners = [];

  function loadState(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        return deepMerge(JSON.parse(JSON.stringify(DEFAULT)), parsed);
      }
    }catch(e){
      console.warn('LovePoints load error', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT));
  }

  function deepMerge(target, src){
    for(const k in src){
      if(src[k] && typeof src[k] === 'object' && !Array.isArray(src[k])){
        target[k] = deepMerge(target[k] || {}, src[k]);
      } else {
        target[k] = src[k];
      }
    }
    return target;
  }

  // Update the LP counter element in DOM
function updateLPDisplay() {
  const lpCountSpan = document.getElementById('lp-count');
  if (lpCountSpan && state && typeof state.lovePoints === 'number') {
    lpCountSpan.textContent = state.lovePoints.toLocaleString();
  }
}

// After loading state, update LP display
document.addEventListener('DOMContentLoaded', () => {
  state = loadState();
  updateLPDisplay();
});

// Modify your save function to update LP display as well
function save(){
  state.lastSave = Date.now();
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  listeners.forEach(cb => { try { cb(state); } catch(e){ console.warn(e); } });
  updateLPDisplay();  // Update display every save
}

  // Reset function to clear localStorage and reset state
  function reset(){
    localStorage.clear();
    state = JSON.parse(JSON.stringify(DEFAULT));
    save();
    console.log('Love App progress reset.');
  }

  return {
    getState(){ return JSON.parse(JSON.stringify(state)); },
    setState(partial){
      state = deepMerge(state, partial);
      save();
    },
    replaceState(newState){
      state = deepMerge(JSON.parse(JSON.stringify(DEFAULT)), newState || {});
      save();
    },
    getLP(){ return Number(state.lp || 0); },
    setLP(n){ state.lp = Math.max(0, Math.round(n)); save(); return state.lp; },
    addLP(n){ n = Number(n)||0; state.lp = Math.max(0, Math.round((state.lp||0) + n)); save(); return state.lp; },
    spendLP(cost){
      cost = Number(cost)||0;
      if((state.lp||0) < cost) return false;
      state.lp = Math.max(0, Math.round(state.lp - cost));
      save();
      return true;
    },
    onChange(cb){ if(typeof cb === 'function') listeners.push(cb); return ()=>{ listeners = listeners.filter(x=>x!==cb); }; },
    purchase(cost){ return this.spendLP(cost); },
    reset,  // <--- added here
    _raw(){ return state; }
  };
})();
