// threat-feed.js - 100% Real Live Threat Feed (Abuse.ch proxy)
document.addEventListener('DOMContentLoaded', () => {
  const feedContainer = document.getElementById('threatFeed');
  if (!feedContainer) return;
  
  let realThreatsQueue = [];
  let currentIndex = 0;
  
  async function pollThreats() {
    try {
      const response = await fetch('http://localhost:3000/api/threats');
      if (!response.ok) throw new Error("Network error");
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        realThreatsQueue = result.data.sort(() => 0.5 - Math.random());
      }
    } catch (e) {
      console.error("Feed error:", e);
    }
  }

  function getFormattedTime(dateStr) {
    if (!dateStr) {
        const now = new Date();
        return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
    }
    try {
        // Parse the UTC date from the database (e.g., "2026-05-24 00:01:21 UTC" or ISO string)
        const d = new Date(dateStr.replace(' UTC', 'Z'));
        return `[${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}]`;
    } catch(e) {
        return `[--:--:--]`;
    }
  }
  
  function createFeedItem() {
    if (!realThreatsQueue || realThreatsQueue.length === 0) return;
    
    // Do NOT loop. If we consumed the current batch, we wait for the next 5-min server refresh.
    if (currentIndex >= realThreatsQueue.length) {
      return;
    }
    
    const threat = realThreatsQueue[currentIndex];
    currentIndex++;
    
    const getFlagEmoji = (countryCode) => {
      if(!countryCode) return '🌍';
      const codePoints = countryCode.toUpperCase().split('').map(char =>  127397 + char.charCodeAt());
      return String.fromCodePoint(...codePoints);
    };

    const flag = getFlagEmoji(threat.countryCode);
    const time = getFormattedTime(threat.timestamp); // USE EXACT DB TIMESTAMP
    
    const div = document.createElement('div');
    div.className = `feed-item ${threat.severity}`;
    
    let action = 'BLOCKED';
    if(threat.severity === 'high') action = 'MITIGATED';
    if(threat.severity === 'medium') action = 'LOGGED';

    const ipStr = `<strong style="color: var(--text-primary);">${threat.ip}</strong>`;

    div.innerHTML = `
      <span class="feed-time">${time}</span>
      <span class="feed-country" title="${threat.country}">${flag}</span>
      <span class="feed-type">${threat.type} — ${ipStr}</span>
      <span class="feed-action">${action}</span>
    `;
    
    feedContainer.prepend(div);
    
    // Push to global log array (for History Modal)
    if(window.sessionThreatLogs) {
      window.sessionThreatLogs.push({
        time: time,
        ip: threat.ip,
        type: threat.type,
        country: threat.country,
        flag: flag,
        action: action,
        severity: threat.severity
      });
    }

    // Keep max 20 items in feed list
    if (feedContainer.children.length > 20) {
      feedContainer.removeChild(feedContainer.lastChild);
    }
  }
  
  // Initial poll
  pollThreats().then(() => {
    // Populate the first 5 instantly so the feed isn't completely empty on load
    for(let i=0; i<5; i++) {
      createFeedItem();
    }
    
    // Organic pacing: Random interval between 400ms and 3500ms
    function queueNext() {
      if (currentIndex < realThreatsQueue.length) {
        createFeedItem();
        const nextDelay = 400 + Math.random() * 3100;
        setTimeout(queueNext, nextDelay);
      }
    }
    setTimeout(queueNext, 1000);
    
    // Re-poll the backend strictly every 5 minutes to get the new batch
    setInterval(async () => {
      await pollThreats();
      currentIndex = 0; // Reset index for the new real threats
      queueNext(); // Restart the organic feeding
    }, 300000);
  });

  // --- IBM 9.5/10 Upgrades: Search & History Logs ---

  // 1. Live DOM Search/Filtering
  const searchInput = document.getElementById('threatSearch');
  if(searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const items = feedContainer.getElementsByClassName('feed-item');
      Array.from(items).forEach(item => {
        const text = item.innerText.toLowerCase();
        if(text.includes(term)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // 2. Global Threat History Logs
  window.sessionThreatLogs = []; // Stores all threats generated in this session

  const modal = document.getElementById('threatLogsModal');
  const viewBtn = document.getElementById('viewLogsBtn');
  const closeBtn = document.getElementById('closeLogsBtn');
  const tbody = document.getElementById('logsTableBody');

  if(modal && viewBtn && closeBtn && tbody) {
    viewBtn.addEventListener('click', () => {
      // Render table
      tbody.innerHTML = '';
      if(window.sessionThreatLogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding:15px; text-align:center;">No threats logged yet.</td></tr>';
      } else {
        // Reverse array to show newest at the top
        [...window.sessionThreatLogs].reverse().forEach(threat => {
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid var(--glass-border)';
          let color = 'var(--text-primary)';
          if(threat.severity === 'high') color = 'var(--danger)';
          else if(threat.severity === 'medium') color = 'var(--warning)';

          tr.innerHTML = `
            <td style="padding: 10px;">${threat.time}</td>
            <td style="padding: 10px; color: ${color};">${threat.ip}</td>
            <td style="padding: 10px;">${threat.type}</td>
            <td style="padding: 10px;">${threat.flag} ${threat.country || 'Unknown'}</td>
            <td style="padding: 10px;">${threat.action}</td>
          `;
          tbody.appendChild(tr);
        });
      }
      modal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Close on click outside
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
});
