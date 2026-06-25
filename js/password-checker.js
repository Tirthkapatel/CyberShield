// password-checker.js - 100% Real Live Check via HaveIBeenPwned API (via Backend)
document.addEventListener('DOMContentLoaded', () => {
  const pwdInput = document.getElementById('passwordInput');
  const checkBtn = document.getElementById('pwdAnalyzeBtn');
  const resultsDiv = document.getElementById('passwordResult');

  if (!pwdInput || !checkBtn) return;

  // Real SHA-1 hashing using Web Crypto API
  async function sha1(str) {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  // Calculate Entropy
  function calculateEntropy(pwd) {
    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 32;
    if (poolSize === 0) return 0;
    return pwd.length * Math.log2(poolSize);
  }

  function getCrackTime(entropy) {
    if (entropy < 28) return 'Instantly';
    if (entropy < 36) return 'Seconds';
    if (entropy < 60) return 'Days';
    if (entropy < 128) return 'Years';
    return 'Centuries';
  }

  checkBtn.addEventListener('click', async () => {
    const pwd = pwdInput.value;
    if (!pwd) return;

    // Reset UI state to loading
    resultsDiv.innerHTML = `
      <div style="color: var(--secondary); text-align: center; padding: 20px;">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
        <p style="margin-top: 10px;">Securely checking global data breaches...</p>
      </div>
    `;
    resultsDiv.classList.add('active');
    resultsDiv.hidden = false;

    try {
      // 1. Hash the password
      const hash = await sha1(pwd);
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);

      // 2. Send only prefix to our backend (k-Anonymity)
      const response = await fetch('/api/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha1Prefix: prefix })
      });

      if (!response.ok) throw new Error("Backend connection failed.");
      
      const breachText = await response.text();
      
      // 3. Parse HaveIBeenPwned result
      const lines = breachText.split('\n');
      let breachCount = 0;
      for (const line of lines) {
        const [lineSuffix, count] = line.split(':');
        if (lineSuffix && lineSuffix.trim() === suffix) {
          breachCount = parseInt(count.trim(), 10);
          break;
        }
      }

      // 4. Entropy calculation
      const entropy = calculateEntropy(pwd);
      const crackTime = getCrackTime(entropy);

      // 5. Build Result UI
      let scoreColor = '';
      let scoreIcon = '';
      let title = '';
      let breachMessage = '';

      if (breachCount > 0) {
        // Pwned password overrides any complexity
        scoreColor = 'var(--danger)';
        scoreIcon = 'fa-skull-crossbones';
        title = 'CRITICAL RISK';
        breachMessage = `<div style="margin-top: 15px; padding: 10px; background: rgba(255, 51, 102, 0.2); border-left: 4px solid var(--danger); color: var(--danger);"><strong>WARNING:</strong> This exact password has been exposed in <strong>${breachCount.toLocaleString()}</strong> data breaches. Change it immediately!</div>`;
      } else if (entropy < 40) {
        scoreColor = 'var(--danger)';
        scoreIcon = 'fa-times-circle';
        title = 'Weak Password';
        breachMessage = `<div style="margin-top: 15px; color: var(--success);"><i class="fas fa-check-circle"></i> Good news: Not found in any known data breaches. (But it is still too weak).</div>`;
      } else if (entropy < 60) {
        scoreColor = 'var(--warning)';
        scoreIcon = 'fa-exclamation-triangle';
        title = 'Moderate Password';
        breachMessage = `<div style="margin-top: 15px; color: var(--success);"><i class="fas fa-check-circle"></i> Good news: Not found in any known data breaches.</div>`;
      } else {
        scoreColor = 'var(--success)';
        scoreIcon = 'fa-check-shield';
        title = 'Strong Password';
        breachMessage = `<div style="margin-top: 15px; color: var(--success);"><i class="fas fa-check-circle"></i> Excellent: Not found in any known data breaches.</div>`;
      }

      resultsDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
          <i class="fas ${scoreIcon}" style="font-size: 2rem; color: ${scoreColor};"></i>
          <h3 style="color: ${scoreColor}; margin: 0;">${title}</h3>
        </div>
        
        <div class="result-details">
          <div class="detail-row">
            <span>Entropy Score:</span>
            <strong>${Math.round(entropy)} bits</strong>
          </div>
          <div class="detail-row">
            <span>Est. Crack Time:</span>
            <strong>${crackTime}</strong>
          </div>
        </div>
        ${breachMessage}
      `;

    } catch (e) {
      console.error(e);
      resultsDiv.innerHTML = `
        <div style="color: var(--danger); padding: 15px; border: 1px solid var(--danger); border-radius: 8px;">
          <i class="fas fa-exclamation-circle"></i> 
          Connection to backend failed. Make sure the Node.js server is running.
        </div>
      `;
    }
  });

  // Real-time UI indicator (without API call)
  pwdInput.addEventListener('input', () => {
    if(pwdInput.value.length === 0) {
      resultsDiv.classList.remove('active');
    }
  });
});
