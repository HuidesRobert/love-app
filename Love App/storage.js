// Change this to your actual LS_KEY used in lovepoints.js
const LS_KEY = 'love_garden_state_v1';

// Default state shape (if you want to safely parse)
const DEFAULT_STATE = {
  lovePoints: 0,
  // other properties if needed
};

// Deep merge helper (optional, if you want to merge defaults)
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

// Load state from localStorage
function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      return deepMerge(JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
    }
  }catch(e){
    console.warn('LP Display load error', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

// Update the LP display in the DOM
function updateLPDisplay() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    const lp = state.lp || 0;  // <-- use "lp" here
    
    const lpCountSpan = document.getElementById('lp-count');
    if (lpCountSpan) {
      lpCountSpan.textContent = lp.toLocaleString();
    }
  } catch (e) {
    console.warn('Error parsing LP state', e);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  updateLPDisplay();
});

// Optional: expose globally to update on-demand
window.updateLPDisplay = updateLPDisplay;

