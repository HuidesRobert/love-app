// lock.js
// Assumptions:
// - Your LP state is stored in localStorage under key 'love_garden_state_v1'.
// - Category anchor elements use: <a href="#" class="btn locked" data-category="letters">Letters</a>
// - Games should remain unlocked and navigate normally.
// - Unlock cost = 10000 LP.

(function () {
  const LS_KEY = 'love_garden_state_v1';
  const UNLOCK_COST = 10000;
  const CATEGORY_URLS = {
    letters: './letters/love-letters.html',
    notes: './notebook/notebook.html',
    surprises: './surprises/surprise-category.html',
    games: './games/game-category.html'
  };

  // Safe parse
  function safeParse(raw) {
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  // Load state from LS BUT KEEP existing lp if present.
  function loadState() {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = safeParse(raw);

    // If parsed exists, ensure minimal structure and keep everything else intact
    if (parsed && typeof parsed === 'object') {
      // Ensure lp is a number
      if (typeof parsed.lp !== 'number') parsed.lp = Number(parsed.lp) || 0;

      // Ensure unlockedCategories exists and games is unlocked
      if (!parsed.unlockedCategories || typeof parsed.unlockedCategories !== 'object') {
        parsed.unlockedCategories = { games: true, letters: false, notes: false, surprises: false };
      } else {
        if (typeof parsed.unlockedCategories.games !== 'boolean') parsed.unlockedCategories.games = true;
        // ensure keys exist (don't overwrite any existing)
        parsed.unlockedCategories.letters = !!parsed.unlockedCategories.letters;
        parsed.unlockedCategories.notes = !!parsed.unlockedCategories.notes;
        parsed.unlockedCategories.surprises = !!parsed.unlockedCategories.surprises;
      }

      return parsed;
    }

    // No valid saved state — return default (lp = 0 only if none present)
    return {
      lp: 0,
      unlockedCategories: { games: true, letters: false, notes: false, surprises: false }
    };
  }

  // Save full state back to LS
  function saveState(state) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('saveState error', e);
    }
  }

  // UI: transient message
  function showMessage(text, duration = 2200) {
    let msg = document.getElementById('lp-message');
    if (!msg) {
      msg = document.createElement('div');
      msg.id = 'lp-message';
      Object.assign(msg.style, {
        position: 'fixed',
        bottom: '22px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.82)',
        color: '#00d9ff',
        padding: '10px 18px',
        borderRadius: '22px',
        fontFamily: "'Great Vibes', cursive",
        fontSize: '1.05rem',
        zIndex: 99999,
        boxShadow: '0 0 12px rgba(0,217,255,0.6)',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 200ms ease'
      });
      document.body.appendChild(msg);
    }
    msg.textContent = text;
    // show
    requestAnimationFrame(() => { msg.style.opacity = '1'; });
    // hide
    setTimeout(() => {
      msg.style.opacity = '0';
    }, duration);
  }

  // Update LP counter element if present (#lp-display)
  function updateLpDisplayFromState(state) {
    const el = document.getElementById('lp-display');
    if (!el || !state) return;
    // preserve whatever text style you want
    el.textContent = `💙 LP: ${Number(state.lp || 0).toLocaleString()}`;
  }

  // Add lock UI and href handling
  function refreshButtons(state) {
    const buttons = document.querySelectorAll('.btn[data-category]');
    buttons.forEach(btn => {
      const cat = btn.dataset.category;
      if (!cat) return;

      // Games always unlocked
      if (cat === 'games') {
        btn.classList.remove('locked');
        btn.removeAttribute('data-locked');
        btn.setAttribute('href', CATEGORY_URLS.games);
        btn.textContent = btn.textContent.replace(/\s*🔒\s*$/, '');
        return;
      }

      const unlocked = !!(state.unlockedCategories && state.unlockedCategories[cat]);

      if (unlocked) {
        btn.classList.remove('locked');
        btn.removeAttribute('data-locked');
        btn.setAttribute('href', CATEGORY_URLS[cat] || '#');
        btn.textContent = btn.textContent.replace(/\s*🔒\s*$/, '');
      } else {
        // locked
        btn.classList.add('locked');
        btn.setAttribute('data-locked', 'true');
        btn.setAttribute('href', '#'); // prevent default navigation
        // Append lock emoji only once
        if (!/\u{1F512}/u.test(btn.textContent)) { // 🔒 unicode check
          btn.textContent = btn.textContent.trim() + ' 🔒';
        }
      }
    });
  }

  // Try unlocking (returns true if unlocked)
  function tryUnlock(cat) {
    const state = loadState();
    if (!state) return false;
    const lp = Number(state.lp || 0);
    if (lp < UNLOCK_COST) {
      showMessage(`Not enough LP to unlock ${capitalize(cat)}. Need ${UNLOCK_COST.toLocaleString()}.`);
      return false;
    }

    // Deduct and mark unlocked
    state.lp = lp - UNLOCK_COST;
    state.unlockedCategories = state.unlockedCategories || {};
    state.unlockedCategories[cat] = true;
    saveState(state);
    refreshButtons(state);
    updateLpDisplayFromState(state);
    showMessage(`${capitalize(cat)} unlocked! 🎉`);
    return true;
  }

  // small helper
  function capitalize(s) { return s ? (s.charAt(0).toUpperCase() + s.slice(1)) : s; }

  // Block navigation for locked items robustly (click + auxclick + key)
  function attachHandlers() {
    // delegated click handler
    document.body.addEventListener('click', function (e) {
      const el = e.target.closest('.btn[data-category]');
      if (!el) return;

      const cat = el.dataset.category;
      if (!cat) return;

      // If locked, prevent navigation and attempt unlock
      if (el.dataset.locked === 'true') {
        e.preventDefault();
        tryUnlock(cat);
        return;
      }

      // unlocked => proceed normally (anchor href will be set to the real URL)
      // no action needed
    });

    // prevent middle-click / ctrl/cmd+click from opening locked links
    document.body.addEventListener('auxclick', function (e) {
      const el = e.target.closest('.btn[data-category]');
      if (!el) return;
      if (el.dataset.locked === 'true') {
        e.preventDefault();
        tryUnlock(el.dataset.category);
      }
    });

    // also prevent open-in-new-tab from context menu if locked (mousedown captures middle/right before default)
    document.body.addEventListener('mousedown', function (e) {
      const el = e.target.closest('.btn[data-category]');
      if (!el) return;
      if (el.dataset.locked === 'true' && e.button !== 0) { // non-left click
        e.preventDefault();
      }
    });

    // Optional: keyboard activation handling (Enter) for locked
    document.body.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        const el = document.activeElement;
        if (el && el.matches && el.matches('.btn[data-category][data-locked="true"]')) {
          e.preventDefault();
          tryUnlock(el.dataset.category);
        }
      }
    });
  }

  // Init
  function init() {
    const state = loadState();
    // Guard: if parsed state existed but didn't have unlockedCategories, initialize it in saved state
    if (!state.unlockedCategories) {
      state.unlockedCategories = { games: true, letters: false, notes: false, surprises: false };
      saveState(state);
    } else {
      state.unlockedCategories.games = true; // ensure games unlocked
      saveState(state);
    }
    refreshButtons(state);
    updateLpDisplayFromState(state);
    attachHandlers();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // expose small helper (optional) to unlock programmatically
  window.unlockCategory = function (cat) {
    return tryUnlock(cat);
  };

})();
