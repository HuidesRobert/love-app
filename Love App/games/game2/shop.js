// shop.js: renders shop items and calls window.shopApply(itemId)
(function(){
  const shopItems = [
    {id:'buy_seeds', title:'Buy Seeds (x3)', cost:300, desc:'Buy 3 seeds'},
    {id:'buy_fert', title:'Buy Fertilizer', cost:150, desc:'Instant grow x1'},
    {id:'fast_growth', title:'Faster Growth', cost:500, desc:'Reduce growth time by 15% (stackable up to 75%)'},
  ];

  function renderShop(){
    const container = document.getElementById('shop-items');
    if(!container) return;
    container.innerHTML = '';
    shopItems.forEach(it=>{
      const el = document.createElement('div'); el.className='shop-item';
      el.innerHTML = `<div style="max-width:72%"><strong>${it.title}</strong><div style="font-size:12px;opacity:0.85">${it.desc}</div></div>
        <div style="text-align:right"><div style="font-weight:800">${it.cost} LP</div><button class="glow-btn buy">Buy</button></div>`;
      const btn = el.querySelector('.buy');
      btn.addEventListener('click', ()=>{ window.shopApply(it.id); });
      container.appendChild(el);
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    renderShop();
    const shopToggle = document.getElementById('shop-toggle-button');
    const shopPanel = document.getElementById('shop-container');
    const closeBtn = document.getElementById('close-shop');
    const openShopBtn = document.getElementById('open-shop-btn');
    if(!shopPanel) return;
    shopToggle && shopToggle.addEventListener('click', ()=>{ shopPanel.classList.toggle('open'); shopPanel.classList.toggle('hidden'); shopPanel.setAttribute('aria-hidden', shopPanel.classList.contains('open') ? 'false' : 'true'); });
    openShopBtn && openShopBtn.addEventListener('click', ()=>{ shopPanel.classList.add('open'); shopPanel.classList.remove('hidden'); shopPanel.setAttribute('aria-hidden','false'); });
    closeBtn && closeBtn.addEventListener('click', ()=>{ shopPanel.classList.remove('open'); shopPanel.setAttribute('aria-hidden','true'); setTimeout(()=>shopPanel.classList.add('hidden'),300); });
  });
})();
