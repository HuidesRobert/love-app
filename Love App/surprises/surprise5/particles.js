// Create floating background particles all over the screen
const particlesContainer = document.getElementById('particles-container');

function createParticle() {
  const p = document.createElement('div');
  p.classList.add('particle');
  if (Math.random() > 0.7) p.classList.add('bright');

  p.style.left = Math.random() * 100 + 'vw';
  p.style.top = 110 + Math.random() * 50 + 'vh'; // start slightly below viewport
  p.style.width = p.style.height = (4 + Math.random() * 4) + 'px';
  p.style.animationDuration = 10 + Math.random() * 15 + 's';
  p.style.animationDelay = '-' + Math.random() * 15 + 's';

  particlesContainer.appendChild(p);

  // Remove after animation to keep DOM light
  p.addEventListener('animationend', () => {
    p.remove();
    createParticle();
  });
}

// Create initial particles count
for(let i=0; i<40; i++) {
  createParticle();
}
