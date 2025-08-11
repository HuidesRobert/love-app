// Minimal background effect: particles and twinkles
// You can expand with your own effects here

const particlesContainer = document.getElementById('particles-container');
const twinklesContainer = document.getElementById('twinkles-container');

function createParticle() {
  const particle = document.createElement('div');
  particle.classList.add('particle');
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.top = `${Math.random() * 100}%`;
  particle.style.animationDuration = `${1 + Math.random() * 3}s`;
  particlesContainer.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 4000);
}

function createTwinkle() {
  const twinkle = document.createElement('div');
  twinkle.classList.add('twinkle');
  twinkle.style.left = `${Math.random() * 100}%`;
  twinkle.style.top = `${Math.random() * 100}%`;
  twinkle.style.animationDuration = `${0.8 + Math.random() * 1.5}s`;
  twinklesContainer.appendChild(twinkle);

  setTimeout(() => {
    twinkle.remove();
  }, 3000);
}

// Generate particles and twinkles continuously
setInterval(createParticle, 300);
setInterval(createTwinkle, 700);
