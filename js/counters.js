// counters.js - Animated stat counters
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('.counter');
  
  function animateCounter(element) {
    const target = +element.getAttribute('data-target');
    const suffix = element.getAttribute('data-suffix') || '';
    
    // Determine duration based on target size
    const duration = 2000; 
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    
    let frame = 0;
    
    // Easing function (easeOutQuad)
    function easeOutQuad(t) {
      return t * (2 - t);
    }
    
    // Number formatting helper
    function formatNumber(num) {
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
      }
      return num.toLocaleString();
    }
    
    const counterInterval = setInterval(() => {
      frame++;
      const progress = easeOutQuad(frame / totalFrames);
      const currentCount = Math.round(target * progress);
      
      element.innerText = formatNumber(currentCount) + suffix;
      
      if (frame === totalFrames) {
        clearInterval(counterInterval);
        element.innerText = formatNumber(target) + suffix;
      }
    }, frameDuration);
  }
  
  // Use IntersectionObserver to start animation when visible
  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px 0px -50px 0px"
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  // Fetch true live stats from backend before animating
  fetch('/api/stats')
    .then(res => res.json())
    .then(stats => {
      if (stats) {
        const countThreats = document.getElementById('countThreats');
        const countEngines = document.getElementById('countEngines');
        const countBreaches = document.getElementById('countBreaches');
        
        const countPwned = document.getElementById('countPwned');
        const countFamilies = document.getElementById('countFamilies');
        const countCountries = document.getElementById('countCountries');
        const countLatency = document.getElementById('countLatency');
        
        if(countThreats) countThreats.setAttribute('data-target', stats.threats);
        if(countEngines) countEngines.setAttribute('data-target', stats.engines);
        if(countBreaches) countBreaches.setAttribute('data-target', stats.breaches);
        
        if(countPwned) countPwned.setAttribute('data-target', stats.pwnedAccounts || 17658105223);
        if(countFamilies) countFamilies.setAttribute('data-target', stats.malwareFamilies || 617);
        if(countCountries) countCountries.setAttribute('data-target', stats.targetedCountries || 45);
        if(countLatency) countLatency.setAttribute('data-target', stats.apiLatency || 120);
      }
      
      counters.forEach(counter => {
        observer.observe(counter);
      });
    })
    .catch(e => {
      console.error("Failed to fetch live stats", e);
      // Fallback to hardcoded HTML targets if backend is down
      counters.forEach(counter => {
        observer.observe(counter);
      });
    });
});
