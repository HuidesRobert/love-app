(() => {
  const LS_KEY = 'love_garden_state_v1';

  // Default initial state
  const defaultState = {
    lp: 0,
    multiplier: 1,
    bonusPoints: 0,
    critChance: 0,
    upgrades: {}, // track purchased upgrades by key
    lastSave: Date.now()
  };

  let state = loadState();

  // Expose state globally so shop.js can access it
  window.state = state;

  // DOM elements
  const lpCounter = document.getElementById('lp-counter');
  const multiplierLabel = document.getElementById('multiplier-label');
  const clickArea = document.getElementById('click-area');
  const lpBurst = document.getElementById('lp-burst');

  const shopBtn = document.getElementById('open-shop-btn');
  const shopContainer = document.getElementById('shop-container');
  const closeShopBtn = document.getElementById('close-shop');
  const backBtn = document.getElementById('back-btn');

  // Load saved state or default
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to load state:', e);
    }
    return { ...defaultState };
  }

  // Save current state
  function saveState() {
    state.lastSave = Date.now();
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }

  // Render LP and multiplier UI
  function renderCounters() {
    lpCounter.textContent = `LP: ${state.lp}`;
    multiplierLabel.textContent = `x${state.multiplier}`;
  }

  // LP burst animation
  function animateLPBurst(points) {
    if (!lpBurst) return;
    lpBurst.textContent = `+${points}`;
    lpBurst.style.opacity = '1';
    lpBurst.style.transform = 'translate(-50%, 0) scale(1)';
    setTimeout(() => {
      lpBurst.style.transition = 'all 800ms ease-out';
      lpBurst.style.opacity = '0';
      lpBurst.style.transform = 'translate(-50%, -40px) scale(0.5)';
    }, 50);
    setTimeout(() => {
      lpBurst.style.transition = '';
      lpBurst.style.transform = 'translate(-50%, 0) scale(1)';
    }, 900);
  }

  // Click handler: add LP on click with multiplier & bonusPoints
  function onClickHeart() {
    const basePoints = 1;
    const pointsEarned = basePoints * (state.multiplier || 1) + (state.bonusPoints || 0);
    state.lp += pointsEarned;
    saveState();
    renderCounters();
    animateLPBurst(pointsEarned);
  }

  // Show toast / message (simple alert for now)
  function pulseMessage(msg) {
    alert(msg);
  }

  // API for shop and upgrades
  window.clickerAPI = {
    getMultiplierCost(level) {
      if(level === 2) return 100;
      if(level === 3) return 250;
      return 999999;
    },

    setMultiplier(level) {
      state.multiplier = level;
      state.upgrades.multiplier = level;
      saveState();
    },

    setBonusPoints(points) {
      state.bonusPoints = points;
      state.upgrades.bonusPoints = points;
      saveState();
    },

    setCriticalChance(chance) {
      state.critChance = chance;
      state.upgrades.critChance = chance;
      saveState();
    },

    showToast(msg) {
      pulseMessage(msg);
    },

    purchaseItem(cost, upgradeType, upgradeValue, cb) {
      // Prevent repurchasing the same upgrade
      if(upgradeType && state.upgrades && state.upgrades[upgradeType] === upgradeValue) {
        this.showToast("Already purchased");
        return false;
      }

      if(state.lp >= cost) {
        state.lp -= cost;

        if(upgradeType) {
          if(upgradeType === 'multiplier') {
            this.setMultiplier(upgradeValue);
          } else if(upgradeType === 'bonusPoints') {
            this.setBonusPoints(upgradeValue);
          } else if(upgradeType === 'critChance') {
            this.setCriticalChance(upgradeValue);
          }
        } else {
          saveState();
        }

        renderCounters();
        if(cb) cb();
        return true;
      } else {
        this.showToast("Not enough LP");
        return false;
      }
    }
  };

  // Attach event listeners
  function attachUI() {
    if(clickArea) {
      clickArea.addEventListener('click', onClickHeart);
    }

    if(shopBtn && shopContainer && closeShopBtn) {
      shopBtn.addEventListener('click', () => {
        shopContainer.classList.add('open');
        shopContainer.classList.remove('hidden');
        shopContainer.setAttribute('aria-hidden', 'false');
      });

      closeShopBtn.addEventListener('click', () => {
        shopContainer.classList.remove('open');
        shopContainer.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          if(!shopContainer.classList.contains('open')) {
            shopContainer.classList.add('hidden');
          }
        }, 300);
      });

      document.addEventListener('click', (e) => {
        if (!shopContainer.classList.contains('open')) return;
        const clickedInsideShop = e.target.closest('#shop-container') || e.target.closest('#open-shop-btn');
        if(!clickedInsideShop) {
          shopContainer.classList.remove('open');
          shopContainer.setAttribute('aria-hidden', 'true');
          setTimeout(() => {
            if(!shopContainer.classList.contains('open')) {
              shopContainer.classList.add('hidden');
            }
          }, 300);
        }
      });
    }

    if(backBtn) {
      backBtn.addEventListener('click', () => {
        window.history.back();
      });
    }
  }

  // Background effects (unchanged, copy your previous implementation)
  function startBackgroundEffects() {
    startWaveCanvas();
    startTwinklesCanvas();
    startParticlesCanvas();
    window.addEventListener('resize', () => {
      startWaveCanvas(true);
      startTwinklesCanvas(true);
      startParticlesCanvas(true);
    });
  }

  // Wave, Twinkles, Particles canvas code should be here (copy from your existing script.js)

  // Initialize app
  function init() {
    renderCounters();
    attachUI();
    startBackgroundEffects();
  }

  function startBackgroundEffects() {
  startWaveCanvas();
  startTwinklesCanvas();
  startParticlesCanvas();
  window.addEventListener('resize', () => {
    startWaveCanvas(true);
    startTwinklesCanvas(true);
    startParticlesCanvas(true);
  });
}

// --- Paste your full background effects code here ---
function startWaveCanvas(resizeOnly) {
  const c = document.getElementById('wave-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }
  resize();
  if (resizeOnly) return;
  let t = 0;
  function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const amplitude = 40 + i * 18;
      const freq = 0.002 + i * 0.0012;
      const ybase = c.height * 0.7 - i * 40;
      ctx.moveTo(0, c.height);
      for (let x = 0; x <= c.width; x += 10) {
        const y = ybase + Math.sin(x * freq + t * 0.001 * (1 + i)) * amplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(c.width, c.height);
      const g = ctx.createLinearGradient(0, ybase, c.width, ybase + 200);
      g.addColorStop(0, `rgba(0,217,255,${0.02 + i * 0.01})`);
      g.addColorStop(1, `rgba(140,86,255,${0.005 + i * 0.006})`);
      ctx.fillStyle = g;
      ctx.fill();
    }
    t += 1;
    requestAnimationFrame(frame);
  }
  frame();
}

function startTwinklesCanvas(resizeOnly) {
  const c = document.getElementById('twinkles-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W = (c.width = window.innerWidth),
    H = (c.height = window.innerHeight);
  let twinkles = [];
  function initTwinkles() {
    twinkles = [];
    const N = Math.max(20, Math.floor((W * H) / 90000));
    for (let i = 0; i < N; i++) {
      twinkles.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.6,
        r: Math.random() * 2 + 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.02,
      });
    }
  }
  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
    initTwinkles();
  }
  if (resizeOnly) {
    resize();
    return;
  }
  initTwinkles();
  function frame() {
    ctx.clearRect(0, 0, W, H);
    twinkles.forEach((p) => {
      p.phase += p.speed;
      const alpha = 0.15 + (Math.sin(p.phase) * 0.35 + 0.35);
      ctx.beginPath();
      ctx.fillStyle = `rgba(200,255,255,${alpha * 0.8})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
  window.addEventListener('resize', resize);
}

function startParticlesCanvas(resizeOnly) {
  const c = document.getElementById('particles-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W = (c.width = window.innerWidth),
    H = (c.height = window.innerHeight);
  let particles = [];
  function initParticles() {
    particles = Array.from({ length: 42 }).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      alpha: 0.06 + Math.random() * 0.08,
    }));
  }
  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
    initParticles();
  }
  if (resizeOnly) {
    resize();
    return;
  }
  initParticles();
  function frame() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.fillStyle = `rgba(0,217,255,${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
  window.addEventListener('resize', resize);
}

  document.addEventListener('DOMContentLoaded', init);
})();
