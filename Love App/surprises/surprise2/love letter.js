$(document).ready(function () {
  // Particle creation script
  const particleCount = 40;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 4;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = (Math.random() * 100) + 'vw';
    p.style.top = (100 + Math.random() * 100) + 'vh';
    p.style.animationDuration = (6 + Math.random() * 8) + 's';
    document.body.appendChild(p);
  }

  // Open/close toggle for the envelope card
  let isOpen = false;

  $('.open-button').click(function (e) {
    e.stopPropagation(); // Prevent event bubbling to document click
    if (!isOpen) {
      $(".card").stop().animate({ top: "-90px" }, "slow");
      $(this).text("Close Love Letter");
      isOpen = true;
    } else {
      $(".card").stop().animate({ top: "0" }, "slow");
      $(this).text("Open Love Letter");
      isOpen = false;
    }
  });

  // Clicking outside the container redirects back to surprise-category.html one folder up
  $(document).click(function (e) {
    const container = $('.container')[0];
    if (!container.contains(e.target)) {
      window.location.href = '../surprise-category.html';
    }
  });
});
