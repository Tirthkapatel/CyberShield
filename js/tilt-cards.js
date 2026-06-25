// tilt-cards.js
document.addEventListener('DOMContentLoaded', () => {
  const tiltCards = document.querySelectorAll('.tilt-card');
  
  // Feature detection for touch devices (where hover doesn't make sense)
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
  
  if (isTouchDevice || window.innerWidth < 768) return;

  tiltCards.forEach(card => {
    let bounds;
    let requestAnimationFrameId;

    function rotateToMouse(e) {
      bounds = card.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };
      
      const distance = Math.sqrt(center.x**2 + center.y**2);
      
      // Calculate rotation (max 10 degrees)
      const maxRotation = 10;
      const rotateX = (center.y / (bounds.height / 2)) * -maxRotation;
      const rotateY = (center.x / (bounds.width / 2)) * maxRotation;
      
      // Calculate glow effect position
      const glowX = (leftX / bounds.width) * 100;
      const glowY = (topY / bounds.height) * 100;

      card.style.transform = `
        perspective(1000px)
        scale3d(1.02, 1.02, 1.02)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
      
      // Update background gradient position for glow effect
      card.style.background = `
        radial-gradient(
          circle at ${glowX}% ${glowY}%,
          rgba(0, 212, 255, 0.15) 0%,
          rgba(255, 255, 255, 0.05) 50%
        )
      `;
    }

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none'; // Remove transition for smooth tracking
    });

    card.addEventListener('mousemove', (e) => {
      // Throttle via rAF
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
      requestAnimationFrameId = requestAnimationFrame(() => {
        rotateToMouse(e);
      });
    });

    card.addEventListener('mouseleave', () => {
      if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId);
      card.style.transition = 'transform 0.5s ease, background 0.5s ease';
      card.style.transform = `
        perspective(1000px)
        scale3d(1, 1, 1)
        rotateX(0deg)
        rotateY(0deg)
      `;
      card.style.background = 'var(--glass-bg)';
    });
  });
});
