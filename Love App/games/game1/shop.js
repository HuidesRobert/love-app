(() => {
  const shopItemsDef = [
    { id: 'buy-multiplier-2', type: 'multiplier', level: 2, cost: 100 },
    { id: 'buy-multiplier-3', type: 'multiplier', level: 3, cost: 250 },
    { id: 'buy-bonus-1', type: 'bonusPoints', points: 1, cost: 300 },
    { id: 'buy-bonus-3', type: 'bonusPoints', points: 3, cost: 700 },
    { id: 'buy-crit-5', type: 'critChance', chance: 0.05, cost: 500 },
    { id: 'buy-crit-10', type: 'critChance', chance: 0.10, cost: 1000 },
  ];

  const shopContainer = document.getElementById('shop-container');
  const shopItemsContainer = document.getElementById('shop-items');

  function renderShop() {
    if (!shopItemsContainer) return;

    shopItemsContainer.innerHTML = '';

    shopItemsDef.forEach(item => {
      const el = document.createElement('div');
      el.className = 'shop-item';

      let leftHtml = '';
      let rightHtml = '';

      if (item.type === 'multiplier') {
        leftHtml = `<strong>${item.level}x Multiplier</strong><div style="font-size:12px;opacity:0.85">Increase click value</div>`;
        rightHtml = `<div style="text-align:right"><div style="font-weight:800">${item.cost} LP</div><button id="${item.id}" class="glow-btn buy">Buy</button></div>`;
      } else if (item.type === 'bonusPoints') {
        leftHtml = `<strong>+${item.points} Bonus Points</strong><div style="font-size:12px;opacity:0.85">Adds flat bonus to each click</div>`;
        rightHtml = `<div style="text-align:right"><div style="font-weight:800">${item.cost} LP</div><button id="${item.id}" class="glow-btn buy">Buy</button></div>`;
      } else if (item.type === 'critChance') {
        leftHtml = `<strong>${Math.round(item.chance * 100)}% Critical Chance</strong><div style="font-size:12px;opacity:0.85">Chance for big extra on click</div>`;
        rightHtml = `<div style="text-align:right"><div style="font-weight:800">${item.cost} LP</div><button id="${item.id}" class="glow-btn buy">Buy</button></div>`;
      }

      el.innerHTML = leftHtml + rightHtml;
      shopItemsContainer.appendChild(el);

      const btn = document.getElementById(item.id);
      if (!btn) return;

      const state = window.state || {};
      if (item.type === 'multiplier' && (state.multiplier || 1) >= item.level) {
        btn.disabled = true;
        btn.textContent = 'Purchased';
        btn.classList.add('disabled');
      } else if (item.type === 'bonusPoints' && (state.bonusPoints || 0) >= item.points) {
        btn.disabled = true;
        btn.textContent = 'Purchased';
        btn.classList.add('disabled');
      } else if (item.type === 'critChance' && (state.critChance || 0) >= item.chance) {
        btn.disabled = true;
        btn.textContent = 'Purchased';
        btn.classList.add('disabled');
      }
    });

    attachShopEventListeners();
  }

  function attachShopEventListeners() {
    shopItemsDef.forEach(item => {
      const btn = document.getElementById(item.id);
      if (!btn || btn.disabled) return;

      btn.addEventListener('click', () => {
        let upgradeType, upgradeValue;

        if (item.type === 'multiplier') {
          upgradeType = 'multiplier';
          upgradeValue = item.level;
        } else if (item.type === 'bonusPoints') {
          upgradeType = 'bonusPoints';
          upgradeValue = item.points;
        } else if (item.type === 'critChance') {
          upgradeType = 'critChance';
          upgradeValue = item.chance;
        }

        const purchased = window.clickerAPI.purchaseItem(item.cost, upgradeType, upgradeValue, () => {
          window.clickerAPI.showToast(`Unlocked ${btn.textContent.replace('Buy','').trim()}!`);
          renderShop();  // Refresh shop UI
        });

        if (!purchased) {
          // Already handled inside purchaseItem
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderShop();

    const shopToggleBtn = document.getElementById('open-shop-btn');
    const closeShopBtn = document.getElementById('close-shop');

    if (shopToggleBtn && shopContainer) {
      shopToggleBtn.addEventListener('click', () => {
        shopContainer.classList.add('open');
        shopContainer.classList.remove('hidden');
        shopContainer.setAttribute('aria-hidden', 'false');
      });
    }

    if (closeShopBtn && shopContainer) {
      closeShopBtn.addEventListener('click', () => {
        shopContainer.classList.remove('open');
        shopContainer.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          if (!shopContainer.classList.contains('open')) {
            shopContainer.classList.add('hidden');
          }
        }, 300);
      });
    }
  });
})();
