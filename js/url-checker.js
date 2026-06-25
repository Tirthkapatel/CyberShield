// url-checker.js - Real URL Checking via VirusTotal API (Backend Proxy)
document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const checkBtn = document.getElementById('urlAnalyzeBtn');
  const resultsDiv = document.getElementById('urlResult');

  if (!urlInput || !checkBtn) return;

  checkBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    // Show loading
    resultsDiv.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--secondary);">
        <i class="fas fa-radar fa-spin fa-2x"></i>
        <p style="margin-top: 10px;">Scanning URL with VirusTotal Threat Intelligence...</p>
      </div>
    `;
    resultsDiv.classList.add('active');
    resultsDiv.hidden = false;

    try {
      const response = await fetch('http://localhost:3000/api/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });

      if (!response.ok) throw new Error("Backend connection failed");
      const result = await response.json();

      let isMalicious = false;
      let scoreMessage = '';
      let detailsHTML = '';
      let scoreColor = 'var(--success)';
      let icon = 'fa-check-circle';

      if (result.status === "success") {
        // VirusTotal Results
        const totalAlerts = result.malicious + result.suspicious;
        if (totalAlerts > 0) {
          isMalicious = true;
          scoreColor = '#FF3366';
          icon = 'fa-ban';
          scoreMessage = 'MALICIOUS URL DETECTED';
        } else {
          scoreColor = '#008B74';
          icon = 'fa-check-circle';
          scoreMessage = 'URL IS CLEAN';
        }

        detailsHTML = `
          <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;"><span>Security Vendors Flagged:</span><strong style="color:${isMalicious ? '#FF3366' : '#008B74'}">${totalAlerts} / ${result.total}</strong></div>
          <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;"><span>Malicious Reports:</span><strong>${result.malicious}</strong></div>
          <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;"><span>Suspicious Reports:</span><strong>${result.suspicious}</strong></div>
          <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;"><span>Clean/Harmless:</span><strong>${result.harmless}</strong></div>
          <div style="margin-top: 15px; font-size: 0.8rem; color: #718096; text-align: right; border-top: 1px solid #e2e8f0; padding-top: 10px;">Powered by VirusTotal 100% Real API</div>
        `;
      } else {
        // Fallback or Not Found
        let score = 0;
        let risks = [];

        // Run local heuristic fallback
        try { new URL(url); } catch(e) { 
          if(!url.startsWith('http')) urlInput.value = 'http://' + url;
        }
        
        if (!url.startsWith('https://')) { score += 40; risks.push("Not using secure HTTPS encryption."); }
        if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) { score += 50; risks.push("URL uses an IP address instead of a domain name."); }
        if ((url.match(/\./g) || []).length > 3) { score += 30; risks.push("Excessive subdomains detected (possible obfuscation)."); }
        if (/(login|update|verify|secure|account|bank|paypal|apple|microsoft|google)/i.test(url)) { score += 40; risks.push("Contains common phishing keywords."); }

        if (score >= 50) {
          isMalicious = true;
          scoreColor = '#FF3366';
          icon = 'fa-exclamation-triangle';
          scoreMessage = 'HIGH RISK DETECTED (Heuristic)';
        } else if (score > 0) {
          scoreColor = '#FF8C00';
          icon = 'fa-exclamation-circle';
          scoreMessage = 'SUSPICIOUS (Heuristic)';
        } else {
          scoreColor = '#008B74';
          icon = 'fa-check-circle';
          scoreMessage = 'LOOKS SAFE (Heuristic)';
        }

        detailsHTML = `
          <div style="padding: 15px; background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 5px; margin-bottom: 15px; font-size: 0.9rem; color: #4a5568;">
            <i class="fas fa-info-circle"></i> ${result.message}
          </div>
          ${risks.length > 0 ? `<ul style="color: ${scoreColor}; padding-left: 20px;">${risks.map(r => `<li style="margin-bottom:5px;">${r}</li>`).join('')}</ul>` : '<p style="color: #008B74; font-weight: bold;"><i class="fas fa-check"></i> No heuristic risks found.</p>'}
        `;
      }

      resultsDiv.innerHTML = `
        <div id="pdfExportTarget" style="padding: 30px; background: #ffffff; color: #1a202c; border-radius: 8px; border: 1px solid #e2e8f0; text-align: left;">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
            <i class="fas ${icon}" style="font-size: 2rem; color: ${scoreColor};"></i>
            <h3 style="color: ${scoreColor}; margin: 0;">${scoreMessage}</h3>
          </div>
          <p style="margin-bottom: 15px; font-family: var(--font-mono); font-size: 0.9rem; word-break: break-all;">Target: ${url}</p>
          <div class="result-details">
            ${detailsHTML}
          </div>
        </div>
        <button id="exportPdfBtn" class="btn-ghost" style="margin-top: 15px; width: 100%;">
          <i class="fas fa-file-pdf"></i> Export Report as PDF
        </button>
      `;

      // Attach PDF export logic
      const exportBtn = document.getElementById('exportPdfBtn');
      if(exportBtn) {
        exportBtn.addEventListener('click', () => {
          const element = document.getElementById('pdfExportTarget');
          const opt = {
            margin:       0.3,
            filename:     'CyberShield_URL_Report.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: true, scrollY: 0 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          // html2pdf is loaded from CDN in index.html
          if(window.html2pdf) {
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
            html2pdf().set(opt).from(element).save().then(() => {
              exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export Report as PDF';
            });
          } else {
            alert("PDF library is still loading, please try again in a moment.");
          }
        });
      }

    } catch (e) {
      console.error(e);
      resultsDiv.innerHTML = `
        <div style="color: var(--danger); padding: 15px; border: 1px solid var(--danger); border-radius: 8px;">
          <i class="fas fa-exclamation-circle"></i> 
          Failed to scan URL. Ensure Node.js server is running.
        </div>
      `;
    }
  });
});
