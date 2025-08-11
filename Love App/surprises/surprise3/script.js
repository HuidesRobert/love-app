$(document).ready(function () {
  // Particle creation script with some brighter particles
  const particleCount = 40;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    if (Math.random() < 0.25) p.classList.add('bright'); // 25% brighter
    const size = Math.random() * 6 + 4;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = (Math.random() * 100) + 'vw';
    p.style.top = (100 + Math.random() * 100) + 'vh';
    p.style.animationDuration = (6 + Math.random() * 8) + 's';
    document.body.appendChild(p);
  }

  const canvas = document.getElementById('constellation');
  const ctx = canvas.getContext('2d');
  let width, height;
  let stars = [];
  let animationFrameId = null;
  let isFormed = false;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  // Classic heart shape parametric points
  function generateHeartPoints(numPoints) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const t = (Math.PI * 2 * i) / numPoints;
      const xRaw = 16 * Math.pow(Math.sin(t), 3);
      const yRaw = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      points.push([xRaw, -yRaw]);
    }
    return points;
  }
  function normalizePoints(points, canvasWidth, canvasHeight, margin=40) {
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const scaleX = (canvasWidth - 2*margin) / (maxX - minX);
    const scaleY = (canvasHeight - 2*margin) / (maxY - minY);
    const scale = Math.min(scaleX, scaleY);
    return points.map(([x, y]) => [margin + (x - minX) * scale, margin + (y - minY) * scale]);
  }

  class Star {
    constructor(x, y) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.tx = x;
      this.ty = y;
      this.radius = 2.5;
      this.opacity = 0.8;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.movingToTarget = false;
      this.moveStartTime = 0;
      this.moveDuration = 1500; // 1.5 seconds per star movement
    }

    startMoveToTarget(delay) {
      this.movingToTarget = true;
      this.moveStartTime = performance.now() + delay;
    }

    update(time) {
      if (!isFormed) {
        // scattered movement
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;
      } else {
        // move one by one to target
        if (this.movingToTarget) {
          if (time < this.moveStartTime) return; // wait delay

          const progress = Math.min((time - this.moveStartTime) / this.moveDuration, 1);
          // easeInOutQuad easing
          const ease = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;

          this.x = this.x + (this.tx - this.x) * ease;
          this.y = this.y + (this.ty - this.y) * ease;

          if (progress === 1) {
            this.movingToTarget = false; // done moving
          }
        }
      }
    }

    draw() {
      ctx.beginPath();
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
      grad.addColorStop(0, 'rgba(0, 217, 255, 1)');
      grad.addColorStop(1, 'rgba(0, 217, 255, 0)');
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0, 217, 255, 0.8)';
      ctx.shadowBlur = 15;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initStars() {
    stars = [];
    const rawPoints = generateHeartPoints(60);
    const heartPoints = normalizePoints(rawPoints, width, height, 40);
    heartPoints.forEach(([x, y]) => {
      stars.push(new Star(x, y));
    });
  }

  function animate(time) {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(star => {
      star.update(time);
      star.draw();
    });
    animationFrameId = requestAnimationFrame(animate);
  }

  initStars();
  animate();

  $('.open-button').click(function (e) {
    e.stopPropagation();
    if (!isFormed) {
      // Sequentially move stars one by one with delay
      stars.forEach((star, i) => {
        star.startMoveToTarget(i * 200); // 200ms delay between each star
      });
      $(this).text('Reset Stars');
      isFormed = true;
    } else {
      // Reset: scatter stars instantly
      stars.forEach(star => {
        star.x = Math.random() * width;
        star.y = Math.random() * height;
        star.movingToTarget = false;
      });
      $(this).text('Show Heart Constellation');
      isFormed = false;
    }
  });

  $(document).click(function (e) {
    const container = $('.container')[0];
    if (!container.contains(e.target)) {
      window.location.href = '../surprise-category.html';
    }
  });
});