// scroll-animations.js - GSAP ScrollTrigger Animations
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return;

  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Common settings
  const animConfig = {
    scrub: false,
    once: true
  };

  // Refresh ScrollTrigger once after dynamic content loads to fix positions
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 2000);

  // 1. Fade Up Section Headers
  gsap.utils.toArray('.section-header').forEach(header => {
    gsap.from(header.children, {
      scrollTrigger: {
        trigger: header,
        start: "top 85%",
        once: animConfig.once
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out"
    });
  });

  // 2. Dashboard Cards Stagger
  gsap.from('.dashboard-card', {
    scrollTrigger: {
      trigger: '.dashboard-grid',
      start: "top 80%",
      once: animConfig.once
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out"
  });

  // 3. Bottom Stats Stagger
  gsap.from('.dash-stat', {
    scrollTrigger: {
      trigger: '.dashboard-stats',
      start: "top 85%",
      once: animConfig.once
    },
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "back.out(1.7)"
  });

  // 4. Tools Grid Stagger
  gsap.from('.toolkit-container', {
    scrollTrigger: {
      trigger: '.toolkit-container',
      start: "top 80%",
      once: animConfig.once
    },
    y: 50,
    duration: 0.7,
    ease: "power2.out"
  });

  gsap.from('.quiz-banner', {
    scrollTrigger: {
      trigger: '.quiz-banner',
      start: "top 85%",
      once: animConfig.once
    },
    y: 40,
    duration: 0.7,
    ease: "back.out(1.5)"
  });

  // 5. Threats Grid Stagger
  gsap.from('.threat-card', {
    scrollTrigger: {
      trigger: '.threats-grid',
      start: "top 85%",
      once: animConfig.once
    },
    y: 50,
    duration: 0.6,
    stagger: 0.15,
    ease: "power2.out"
  });

  // 6. About Section Slide In
  const aboutTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.about-container',
      start: "top 75%",
      once: animConfig.once
    }
  });

  aboutTl.from('.about-left', {
    x: -50,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
  })
  .from('.about-right', {
    x: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
  }, "-=0.6")
  .from('.skill-item', {
    y: 20,
    opacity: 0,
    duration: 0.4,
    stagger: 0.1,
    ease: "power2.out"
  }, "-=0.4");

  // Animate skill bars specifically when they come into view
  gsap.utils.toArray('.skill-bar').forEach(bar => {
    gsap.to(bar, {
      scrollTrigger: {
        trigger: '.skills',
        start: "top 80%",
        once: true
      },
      width: bar.getAttribute('data-value') + '%',
      duration: 1.5,
      ease: "power4.out",
      delay: 0.5
    });
  });

  // 7. Initial Hero Animations
  const heroTl = gsap.timeline();
  
  heroTl.from('.live-badge', {
    y: -20,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
    delay: 0.2
  })
  .from('.hero-title', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
  }, "-=0.3")
  .from('.typewriter-container', {
    opacity: 0,
    duration: 0.5
  }, "-=0.4")
  .from('.hero-subtitle', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.3")
  .from('.hero-buttons button', {
    y: 20,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: "back.out(1.5)"
  }, "-=0.2")
  .from('.hero-right', {
    x: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
  }, "-=1")
  .from('.stat-card', {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: "back.out(1.5)"
  }, "-=0.5");
});
