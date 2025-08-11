// effects.js - Love App particle background

document.addEventListener("DOMContentLoaded", () => {
    const particlesContainer = document.createElement("div");
    particlesContainer.id = "particles-container";
    document.body.appendChild(particlesContainer);

    const numParticles = 60;
    const colors = [
        "rgba(0, 217, 255, 0.8)", // neon blue
        "rgba(0, 150, 255, 0.6)", // soft blue
        "rgba(0, 217, 255, 0.4)"  // faint blue
    ];

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement("span");
        particle.classList.add("particle");
        particle.style.left = Math.random() * 100 + "vw";
        particle.style.top = Math.random() * 100 + "vh";
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = particle.style.height = Math.random() * 6 + 4 + "px";
        particle.style.animationDuration = Math.random() * 20 + 10 + "s";
        particle.style.animationDelay = Math.random() * 10 + "s";
        particlesContainer.appendChild(particle);
    }
});
