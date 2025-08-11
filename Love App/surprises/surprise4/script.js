// Hearts tap sequence logic
const hearts = document.querySelectorAll('.heart');
const message = document.querySelector('.message');
const correctOrder = [2, 1, 3];  // Set secret tap order here
let currentStep = 0;

hearts.forEach(heart => {
  heart.addEventListener('click', () => {
    const id = Number(heart.dataset.id);

    if (id === correctOrder[currentStep]) {
      heart.classList.add('active');
      currentStep++;
      if (currentStep === correctOrder.length) {
        message.hidden = false;
      }
    } else {
      hearts.forEach(h => h.classList.remove('active'));
      message.hidden = true;
      currentStep = 0;
    }
  });
});

// Background particles creation
const particlesContainer = document.getElementById('particles-container');
const totalParticles = 80;

function createParticle() {
  const p = document.createElement('div');
  p.classList.add('particle');
  if (Math.random() < 0.3) p.classList.add('bright'); // 30% chance bright
  p.style.left = Math.random() * 100 + 'vw';
  p.style.top = Math.random() * 100 + 'vh';
  const size = 4 + Math.random() * 4;
  p.style.width = size + 'px';
  p.style.height = size + 'px';
  p.style.animationDuration = 10 + Math.random() * 20 + 's';
  particlesContainer.appendChild(p);
}

for (let i = 0; i < totalParticles; i++) {
  createParticle();
}

// Tap outside hearts returns to surprise category
document.body.addEventListener('click', (e) => {
  if (!e.target.classList.contains('heart')) {
    window.location.href = '../surprise-category.html';
  }
});
