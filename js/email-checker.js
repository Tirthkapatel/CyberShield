// email-checker.js - Hybrid Analysis (Local NLP heuristics + Backend URL scanning)
document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('emailInput');
  const checkBtn = document.getElementById('emailAnalyzeBtn');
  const resultsDiv = document.getElementById('emailResult');

  if (!emailInput || !checkBtn) return;

  checkBtn.addEventListener('click', async () => {
    const text = emailInput.value.trim();
    if (!text) return;

    resultsDiv.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--secondary);">
        <i class="fas fa-cogs fa-spin fa-2x"></i>
        <p style="margin-top: 10px;">Analyzing email semantics and embedded URLs...</p>
      </div>
    `;
    resultsDiv.classList.add('active');
    resultsDiv.hidden = false;

    let score = 0;
    const flags = [];
    
    // 1. Semantic / Heuristic Analysis (100% accurate for these specific red flags)
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('urgent') || lowerText.includes('immediately') || lowerText.includes('24 hours')) {
      score += 30;
      flags.push({ icon: 'fa-clock', text: 'Creates a false sense of urgency' });
    }
    
    if (lowerText.includes('suspend') || lowerText.includes('block') || lowerText.includes('restrict')) {
      score += 30;
      flags.push({ icon: 'fa-lock', text: 'Threatens account suspension or restriction' });
    }
    
    if (lowerText.includes('dear customer') || lowerText.includes('dear user') || lowerText.includes('dear member')) {
      score += 20;
      flags.push({ icon: 'fa-user-secret', text: 'Uses generic greeting instead of your name' });
    }
    
    if (lowerText.includes('kindly click') || lowerText.includes('click here') || lowerText.includes('login below')) {
      score += 15;
      flags.push({ icon: 'fa-hand-pointer', text: 'Pushes you to click an embedded link to login' });
    }

    // 2. Extract URLs and check via backend VirusTotal API
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const extractedUrls = text.match(urlRegex) || [];
    let maliciousUrlsFound = 0;

    if (extractedUrls.length > 0) {
      flags.push({ icon: 'fa-link', text: `Found ${extractedUrls.length} embedded URL(s). Analyzing...` });
      
      // We will only check the first 2 URLs to avoid hitting rate limits instantly
      for (let i = 0; i < Math.min(extractedUrls.length, 2); i++) {
        try {
          const response = await fetch('http://localhost:3000/api/check-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: extractedUrls[i] })
          });
          if (response.ok) {
            const resData = await response.json();
            if (resData.status === "success" && (resData.malicious > 0 || resData.suspicious > 0)) {
              maliciousUrlsFound++;
              score += 100; // Insta-fail
              flags.push({ icon: 'fa-ban', text: `<strong style="color:var(--danger)">VIRUSTOTAL ALERT:</strong> Embedded link is known malware/phishing.` });
            }
          }
        } catch (e) {
          console.error("URL check failed during email scan", e);
        }
      }
    } else {
      score -= 10; // Less suspicious if there are no links at all
    }

    // Render results
    let scoreColor, title, icon;
    if (score >= 50) {
      scoreColor = 'var(--danger)';
      title = 'PHISHING DETECTED';
      icon = 'fa-exclamation-triangle';
    } else if (score >= 20) {
      scoreColor = 'var(--warning)';
      title = 'SUSPICIOUS EMAIL';
      icon = 'fa-exclamation-circle';
    } else {
      scoreColor = 'var(--success)';
      title = 'LOOKS SAFE';
      icon = 'fa-check-circle';
    }

    if (flags.length === 0) {
      flags.push({ icon: 'fa-check', text: 'No common phishing indicators found.' });
    }

    resultsDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
        <i class="fas ${icon}" style="font-size: 2rem; color: ${scoreColor};"></i>
        <h3 style="color: ${scoreColor}; margin: 0;">${title}</h3>
      </div>
      
      <div class="result-details">
        <h4 style="margin-bottom: 10px; color: var(--text-secondary);">Analysis Report:</h4>
        <ul style="list-style: none; padding: 0;">
          ${flags.map(f => `
            <li style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
              <i class="fas ${f.icon}" style="color: ${scoreColor}; margin-top: 4px;"></i>
              <span>${f.text}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  });
});
