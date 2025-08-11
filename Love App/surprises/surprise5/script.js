const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fireworks = [];
let fireworkInterval = null;

function createFirework(x, y) {
  const colors = ['#00d9ff', '#00aaff', '#ffffff'];
  for (let i = 0; i < 30; i++) {
    fireworks.push({
      x: x,
      y: y,
      radius: 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 4 + 2,
      alpha: 1
    });
  }
}

function updateFireworks() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fireworks.forEach((f, index) => {
    f.x += Math.cos(f.angle) * f.speed;
    f.y += Math.sin(f.angle) * f.speed;
    f.alpha -= 0.005;  // Stays 4x longer on screen

    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${hexToRgb(f.color)}, ${f.alpha})`;
    ctx.fill();

    if (f.alpha <= 0) {
      fireworks.splice(index, 1);
    }
  });
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

function animate() {
  requestAnimationFrame(animate);
  updateFireworks();
}

animate();

document.getElementById('fireworks-button').addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent redirect when clicking button

  if (fireworkInterval) return; // Prevent multiple triggers

  fireworkInterval = setInterval(() => {
    const x = Math.random() * canvas.width * 0.9 + canvas.width * 0.05;
    const y = Math.random() * canvas.height * 0.9 + canvas.height * 0.05;
    createFirework(x, y);
  }, 800); // Firework every 0.8 seconds
});

// Clicking outside redirects back
document.body.addEventListener('click', (e) => {
  if (
    e.target.id !== 'fireworks-button' &&
    e.target.id !== 'fireworks-canvas' &&
    !e.target.closest('.container')
  ) {
    window.location.href = '../surprise-category.html';
  }
});

// Adjust canvas on resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
