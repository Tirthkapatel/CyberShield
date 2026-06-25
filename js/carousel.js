// carousel.js
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');
  if (!track || !dotsContainer) return;

  const tips = [
    { icon: 'fas fa-lock', title: 'Use a Password Manager', text: 'Stop memorizing weak passwords. Let a manager generate and store unique, complex passwords for every site.' },
    { icon: 'fas fa-mobile-alt', title: 'Enable 2FA Everywhere', text: 'Two-factor authentication blocks 99% of automated attacks. Use an authenticator app, not SMS.' },
    { icon: 'fas fa-wifi', title: 'Avoid Public Wi-Fi for Banking', text: 'Public networks are easy to intercept. Use a VPN or your cellular data when accessing sensitive information.' },
    { icon: 'fas fa-sync', title: 'Update Software Immediately', text: 'Software updates often contain critical security patches. Enable automatic updates wherever possible.' },
    { icon: 'fas fa-fish', title: 'Think Before You Click', text: 'Phishing is the #1 attack vector. Verify the sender\'s email address and hover over links before clicking.' },
    { icon: 'fas fa-hdd', title: 'Backup Your Data', text: 'Ransomware is on the rise. Keep an offline, encrypted backup of your most important files.' },
    { icon: 'fas fa-user-secret', title: 'Limit Personal Info Online', text: 'Attackers use your social media to craft targeted spear-phishing emails and answer security questions.' },
    { icon: 'fas fa-shield-virus', title: 'Use Reputable Antivirus', text: 'Windows Defender is good, but a dedicated endpoint protection adds an extra layer against zero-day threats.' }
  ];

  // Populate Track
  track.innerHTML = tips.map(tip => `
    <div class="carousel-slide">
      <div class="carousel-icon"><i class="${tip.icon}"></i></div>
      <div class="carousel-content">
        <h3>${tip.title}</h3>
        <p>${tip.text}</p>
      </div>
    </div>
  `).join('');

  // Populate Dots
  dotsContainer.innerHTML = tips.map((_, i) => `
    <div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
  `).join('');

  const dots = document.querySelectorAll('.dot');
  let currentIndex = 0;
  let interval;

  function goToSlide(index) {
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach(d => d.classList.remove('active'));
    dots[currentIndex].classList.add('active');
  }

  function nextSlide() {
    let nextIndex = (currentIndex + 1) % tips.length;
    goToSlide(nextIndex);
  }

  function startAutoPlay() {
    interval = setInterval(nextSlide, 4000);
  }

  function stopAutoPlay() {
    clearInterval(interval);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.getAttribute('data-index')));
      stopAutoPlay();
      startAutoPlay();
    });
  });

  // Touch/Swipe Support
  let touchStartX = 0;
  let touchEndX = 0;

  const container = document.querySelector('.carousel-container');
  
  container.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoPlay();
  }, {passive: true});

  container.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    startAutoPlay();
  }, {passive: true});

  container.addEventListener('mouseenter', stopAutoPlay);
  container.addEventListener('mouseleave', startAutoPlay);

  function handleSwipe() {
    const threshold = 50;
    if (touchEndX < touchStartX - threshold) {
      // Swipe left
      nextSlide();
    }
    if (touchEndX > touchStartX + threshold) {
      // Swipe right
      let prevIndex = (currentIndex - 1 + tips.length) % tips.length;
      goToSlide(prevIndex);
    }
  }

  startAutoPlay();
});
