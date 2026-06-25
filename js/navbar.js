// navbar.js
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-links a');
  
  let lastScrollTop = 0;
  
  // Smart Navbar hide/show
  window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Transparent at very top, glass further down
    if (scrollTop > 50) {
      navbar.style.background = 'rgba(10, 14, 26, 0.85)';
      navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.background = 'transparent';
      navbar.style.boxShadow = 'none';
    }
    
    // Hide on scroll down, show on scroll up
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Downscroll
      navbar.classList.add('hidden');
      
      // Close mobile menu if open
      if(navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    } else {
      // Upscroll
      navbar.classList.remove('hidden');
    }
    lastScrollTop = scrollTop;
  }, {passive: true});

  // Hamburger menu toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    
    if (navLinks.classList.contains('active')) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    } else {
      document.body.style.overflow = 'auto';
    }
  });

  // Active link highlighting using IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger when section is half way in viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    if (section.id) observer.observe(section);
  });
});
