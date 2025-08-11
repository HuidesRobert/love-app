function createParticles(containerClass, count, className, sizeRange = [2, 6], animationDurationRange = [5, 15]) {
  const container = document.querySelector(containerClass);
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add(className);
    const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
    p.style.width = p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * (animationDurationRange[1] - animationDurationRange[0]) + animationDurationRange[0]) + 's';
    container.appendChild(p);
  }
}

function createGlowWave(containerClass) {
  const container = document.querySelector(containerClass);
  if (!container) return;
  const wave = document.createElement('div');
  wave.classList.add('glow-wave');
  container.appendChild(wave);
}

createParticles('.particles-container', 30, 'particle');
createParticles('.twinkles-container', 50, 'twinkle');
createGlowWave('.glow-wave-container');
