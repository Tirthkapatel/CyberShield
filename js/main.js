// main.js - App Initialization

// Bootloader Sequence
window.addEventListener('load', () => {
  const bootloader = document.getElementById('bootloader');
  const progress = document.getElementById('bootProgress');
  const bootText = document.getElementById('bootText');
  
  if(bootloader && progress && bootText) {
    const steps = [
      { text: "Mounting core database...", p: 25 },
      { text: "Initializing Threat Intel APIs...", p: 50 },
      { text: "Establishing secure connection...", p: 75 },
      { text: "System Ready.", p: 100 }
    ];
    
    let currentStep = 0;
    
    const bootInterval = setInterval(() => {
      progress.style.width = steps[currentStep].p + '%';
      bootText.innerText = steps[currentStep].text;
      currentStep++;
      
      if(currentStep >= steps.length) {
        clearInterval(bootInterval);
        setTimeout(() => {
          bootloader.style.transition = 'opacity 0.5s ease';
          bootloader.style.opacity = '0';
          setTimeout(() => bootloader.style.display = 'none', 500);
        }, 500);
      }
    }, 400); // Fast 1.6s boot sequence
  }
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('CyberShield initialized.');
  
  // Custom scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if(targetId === '#') return;
      const target = document.querySelector(targetId);
      if(target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Close mobile menu if open
        const navLinks = document.getElementById('navLinks');
        const hamburger = document.getElementById('hamburger');
        if(navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          hamburger.classList.remove('active');
          document.body.style.overflow = 'auto';
        }
      }
    });
  });

  // Theme Toggle Logic
  const themeToggle = document.getElementById('themeToggle');
  const currentTheme = localStorage.getItem('theme') || 'dark';
  
  if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }

  themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    window.dispatchEvent(new Event('themeChanged'));
  });
});

// Toolkit Tab Switching Logic
// Toolkit Tab Switching Logic
window.switchTool = function(toolId) {
  // Hide all panels
  document.querySelectorAll('.tool-panel').forEach(panel => {
    panel.style.display = 'none';
    panel.classList.remove('active');
  });
  
  // Remove active from all tabs
  document.querySelectorAll('.toolkit-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show active panel
  const activePanel = document.getElementById('panel-' + toolId);
  if (activePanel) {
    activePanel.style.display = 'block';
    activePanel.classList.add('active');
  }
  
  // Set tab active
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
};

// Security Score Card Logic
document.addEventListener('DOMContentLoaded', () => {
  const calculateScoreBtn = document.getElementById('calculateScoreBtn');
  if(calculateScoreBtn) {
    calculateScoreBtn.addEventListener('click', calculateSecurityScore);
  }
});

function calculateSecurityScore() {
  const form = document.getElementById('scoreForm');
  const resultDiv = document.getElementById('scoreResult');
  
  // Get values
  const q1 = parseInt(form.q1.value);
  const q2 = parseInt(form.q2.value);
  const q3 = parseInt(form.q3.value);
  const q4 = parseInt(form.q4.value);
  const q5 = parseInt(form.q5.value);
  
  // Calculate total out of 100
  const totalScore = (q1 + q2 + q3 + q4 + q5) * 2;
  
  // Determine color and verdict
  let color = '#ff3366'; // Danger red
  let verdict = 'High Risk';
  
  if (totalScore >= 80) {
    color = '#00ff88'; // Safe green
    verdict = 'Excellent Security';
  } else if (totalScore >= 50) {
    color = '#ffaa00'; // Warning yellow
    verdict = 'Needs Improvement';
  }
  
  // Generate customized tips based on weaknesses
  let tipsHTML = '';
  
  if (q1 < 10) tipsHTML += `
    <div class="tip-item">
      <i class="fas fa-exclamation-triangle" style="color: #ffaa00;"></i>
      <div><strong>Enable 2FA:</strong> Two-Factor Authentication stops 99% of automated attacks. Turn it on for your email and banking immediately.</div>
    </div>`;
    
  if (q2 < 10) tipsHTML += `
    <div class="tip-item">
      <i class="fas fa-key" style="color: #00D4FF;"></i>
      <div><strong>Stop Reusing Passwords:</strong> Use a password manager like Bitwarden or 1Password to generate and store unique passwords for every site.</div>
    </div>`;
    
  if (q3 < 10) tipsHTML += `
    <div class="tip-item">
      <i class="fas fa-sync" style="color: #00ff88;"></i>
      <div><strong>Automate Updates:</strong> Software updates patch critical security holes. Turn on auto-updates for your OS and browser.</div>
    </div>`;
    
  if (q4 < 10) tipsHTML += `
    <div class="tip-item">
      <i class="fas fa-shield-alt" style="color: #ffaa00;"></i>
      <div><strong>Use a VPN on Public Wi-Fi:</strong> Hackers can intercept your traffic on coffee shop or airport Wi-Fi. A VPN encrypts your connection.</div>
    </div>`;
    
  if (q5 < 10) tipsHTML += `
    <div class="tip-item">
      <i class="fas fa-hdd" style="color: #ff3366;"></i>
      <div><strong>Start Backing Up Data:</strong> Ransomware encrypts your files and demands payment. Regular cloud backups are your best defense.</div>
    </div>`;
    
  if (totalScore === 100) tipsHTML += `
    <div class="tip-item" style="border-left-color: #00ff88;">
      <i class="fas fa-check-circle" style="color: #00ff88;"></i>
      <div><strong>Perfect Score!</strong> You're following all the major cybersecurity best practices. Keep up the great work!</div>
    </div>`;

  resultDiv.innerHTML = `
    <div class="score-display">
      <div class="score-circle" style="--score-percent: ${totalScore}%; --score-color: ${color};">
        <div class="score-number">${totalScore}</div>
      </div>
      <div class="score-text" style="color: ${color}">${verdict}</div>
    </div>
    
    <h4 style="margin-bottom: 10px; color: var(--text-primary); border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;">Personalized Action Plan</h4>
    <div class="tips-list">
      ${tipsHTML}
    </div>
  `;
  
  resultDiv.hidden = false;
  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
