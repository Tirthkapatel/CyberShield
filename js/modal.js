// modal.js - Modal logic and Threats content generation
const threatsData = [
  {
    id: 'phishing',
    icon: 'fas fa-fish',
    color: '#FF3366',
    name: 'Phishing',
    short: 'Deceptive emails/sites stealing your credentials and personal data.',
    description: 'Phishing is a cybercrime in which a target or targets are contacted by email, telephone or text message by someone posing as a legitimate institution to lure individuals into providing sensitive data such as personally identifiable information, banking and credit card details, and passwords.',
    howToDetect: [
      'Check the sender\'s email address carefully for misspellings.',
      'Look for a sense of urgency or threatening language.',
      'Hover over links to verify the actual destination URL.',
      'Notice generic greetings like "Dear Customer".'
    ],
    howToProtect: [
      'Enable Two-Factor Authentication (2FA) on all accounts.',
      'Never click suspicious links directly; manually type the URL.',
      'Use a password manager to auto-fill passwords only on legitimate sites.',
      'Keep your browser and security software updated.'
    ],
    realWorldExample: 'In 2020, Twitter employees were targeted via phone phishing, resulting in the compromise of high-profile accounts like Barack Obama and Elon Musk to promote a Bitcoin scam.'
  },
  {
    id: 'ransomware',
    icon: 'fas fa-lock',
    color: '#FF8C00',
    name: 'Ransomware',
    short: 'Malware that encrypts your files and demands payment for the key.',
    description: 'Ransomware is a type of malicious software designed to block access to a computer system or files until a sum of money is paid. It encrypts the victim\'s files, making them inaccessible, and demands a ransom payment (often in cryptocurrency) to provide the decryption key.',
    howToDetect: [
      'Unexpected file extensions (e.g., .encrypted, .locked) on your documents.',
      'A sudden pop-up window demanding payment.',
      'Inability to open normal files like PDFs or Word documents.',
      'System runs unusually slowly or hard drive activity is extremely high.'
    ],
    howToProtect: [
      'Maintain regular offline backups of your critical data.',
      'Never open email attachments from unverified senders.',
      'Keep OS and software patched to prevent vulnerability exploits.',
      'Use an endpoint protection platform with anti-ransomware capabilities.'
    ],
    realWorldExample: 'The 2017 WannaCry ransomware attack spread rapidly across 150 countries, severely impacting the UK\'s National Health Service (NHS) and causing billions in damages.'
  },
  {
    id: 'social-engineering',
    icon: 'fas fa-users-slash',
    color: '#00D4FF',
    name: 'Social Engineering',
    short: 'Psychological manipulation to trick users into making security mistakes.',
    description: 'Social engineering relies on human psychology rather than technical hacking techniques. Attackers manipulate people into breaking normal security procedures or giving away confidential information by building trust, creating urgency, or posing as an authority figure.',
    howToDetect: [
      'Unsolicited requests for help or information.',
      'Someone claiming authority (e.g., IT Dept, CEO) requesting a bypass of security rules.',
      'Offers that sound too good to be true.',
      'Requests for passwords or sensitive data over phone or text.'
    ],
    howToProtect: [
      'Verify identities via an independent channel (call the person back on a known number).',
      'Never share your password with anyone, even IT support.',
      'Establish and enforce strict security protocols that no one can bypass.',
      'Be skeptical of unsolicited communications.'
    ],
    realWorldExample: 'The 2013 Target data breach began with a social engineering attack against an HVAC vendor, stealing their credentials to access Target\'s corporate network.'
  },
  {
    id: 'ddos',
    icon: 'fas fa-network-wired',
    color: '#00FFD1',
    name: 'DDoS Attack',
    short: 'Overwhelming a system with traffic to make it unavailable to users.',
    description: 'A Distributed Denial-of-Service (DDoS) attack is a malicious attempt to disrupt normal traffic of a targeted server, service, or network by overwhelming the target or its surrounding infrastructure with a flood of Internet traffic from multiple compromised computer systems (a botnet).',
    howToDetect: [
      'Unavailability of a specific website or service.',
      'Unusually slow network performance.',
      'Spike in traffic from unknown or suspicious IP addresses.',
      '503 Service Unavailable errors on web servers.'
    ],
    howToProtect: [
      'Use a Content Delivery Network (CDN) to absorb traffic.',
      'Implement rate limiting and web application firewalls (WAF).',
      'Have a DDoS mitigation service in place (e.g., Cloudflare, AWS Shield).',
      'Monitor network traffic baselines to quickly spot anomalies.'
    ],
    realWorldExample: 'In 2016, the Mirai botnet executed a massive DDoS attack against Dyn (a DNS provider), taking down major sites like Twitter, Netflix, and Reddit across the US.'
  },
  {
    id: 'mitm',
    icon: 'fas fa-user-secret',
    color: '#FF3366',
    name: 'Man-in-the-Middle',
    short: 'Intercepting communications between two parties to steal data.',
    description: 'A Man-in-the-Middle (MitM) attack occurs when an attacker secretly intercepts and relays communications between two parties who believe they are communicating directly with each other. This allows the attacker to eavesdrop on the conversation or alter the data being transferred.',
    howToDetect: [
      'Browser warnings about invalid SSL/TLS certificates.',
      'Unexpected disconnects or strange redirects on networks.',
      'Being asked to install custom root certificates on your device.',
      'URLs starting with HTTP instead of HTTPS on sensitive sites.'
    ],
    howToProtect: [
      'Always use a Virtual Private Network (VPN) on public Wi-Fi.',
      'Ensure websites use HTTPS (look for the padlock).',
      'Do not ignore browser certificate warnings.',
      'Use end-to-end encrypted messaging apps.'
    ],
    realWorldExample: 'The Superfish adware pre-installed on Lenovo laptops in 2014 intercepted encrypted web traffic by installing a self-signed root certificate, acting as a local MitM.'
  },
  {
    id: 'malware',
    icon: 'fas fa-bug',
    color: '#FF8C00',
    name: 'Malware (Trojans/Worms)',
    short: 'Malicious software designed to disrupt, damage, or gain access.',
    description: 'Malware (short for malicious software) is an umbrella term for any software intentionally designed to cause damage to a computer, server, client, or computer network. It includes viruses, worms, Trojan horses, spyware, adware, and more.',
    howToDetect: [
      'System crashing, freezing, or running unusually slow.',
      'New toolbars, extensions, or homepage changes in your browser.',
      'Antivirus software being mysteriously disabled.',
      'Unexplained network traffic or sending spam emails from your account.'
    ],
    howToProtect: [
      'Install and update reputable antivirus/anti-malware software.',
      'Do not download pirated software or media.',
      'Scan all downloaded files before opening them.',
      'Keep your operating system and applications up to date.'
    ],
    realWorldExample: 'The Stuxnet worm (discovered in 2010) was a highly sophisticated malware designed specifically to target and physically damage Iran\'s nuclear centrifuges.'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Generate Threats Grid
  const threatsContainer = document.getElementById('threatsContainer');
  if (threatsContainer) {
    threatsContainer.innerHTML = threatsData.map(t => `
      <div class="threat-card glass tilt-card" onclick="openThreatModal('${t.id}')">
        <div class="threat-header">
          <div class="threat-icon" style="color: ${t.color}; box-shadow: 0 0 15px ${t.color}40;"><i class="${t.icon}"></i></div>
          <h3>${t.name}</h3>
        </div>
        <p class="threat-desc">${t.short}</p>
        <div class="threat-learn-more">Learn Details <i class="fas fa-arrow-right"></i></div>
      </div>
    `).join('');
  }

  // Handle Modal Clicks outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
    }
  });
  
  // Escape key to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }
  });
});

window.openThreatModal = function(id) {
  const threat = threatsData.find(t => t.id === id);
  if (!threat) return;
  
  const content = document.getElementById('threatModalContent');
  
  content.innerHTML = `
    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 25px;">
      <div style="width: 70px; height: 70px; border-radius: 15px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: ${threat.color}; box-shadow: 0 0 20px ${threat.color}50;">
        <i class="${threat.icon}"></i>
      </div>
      <h2 style="font-size: 2rem; margin: 0;">${threat.name}</h2>
    </div>
    
    <div style="margin-bottom: 25px;">
      <h4 style="color: var(--secondary); margin-bottom: 10px; font-family: var(--font-body); text-transform: uppercase; letter-spacing: 1px;">Overview</h4>
      <p style="color: var(--text-secondary); line-height: 1.7; font-size: 1.05rem;">${threat.description}</p>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
      <div style="background: rgba(255, 51, 102, 0.1); border: 1px solid rgba(255, 51, 102, 0.2); padding: 20px; border-radius: 12px;">
        <h4 style="color: var(--danger); margin-bottom: 15px;"><i class="fas fa-search"></i> How to Detect</h4>
        <ul style="padding-left: 20px; color: var(--text-secondary);">
          ${threat.howToDetect.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
        </ul>
      </div>
      
      <div style="background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.2); padding: 20px; border-radius: 12px;">
        <h4 style="color: var(--success); margin-bottom: 15px;"><i class="fas fa-shield-alt"></i> How to Protect</h4>
        <ul style="padding-left: 20px; color: var(--text-secondary);">
          ${threat.howToProtect.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
        </ul>
      </div>
    </div>
    
    <div style="background: rgba(255,255,255,0.05); border-left: 4px solid ${threat.color}; padding: 20px; border-radius: 4px;">
      <h4 style="margin-bottom: 10px;"><i class="fas fa-globe-americas"></i> Real World Example</h4>
      <p style="color: var(--text-secondary); font-style: italic;">"${threat.realWorldExample}"</p>
    </div>
  `;
  
  document.getElementById('threatModal').classList.add('active');
};

window.closeThreatModal = function() {
  document.getElementById('threatModal').classList.remove('active');
};

window.openQuizModal = function() {
  document.getElementById('quizModal').classList.add('active');
  if(window.initQuiz) window.initQuiz();
};

window.closeQuizModal = function() {
  document.getElementById('quizModal').classList.remove('active');
};
