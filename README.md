# CyberShield 🛡️

A professional, fullstack cybersecurity awareness and threat detection platform built for an IBM Internship Project.

## Features
- **100% Real Live Attack Map**: Fetches active malware infrastructure globally using the open URLhaus threat intelligence feed and geolocates them via IP-API.
- **Real-Time Threat Feed**: Streams live threats as they are detected.
- **VirusTotal URL Scanner**: A robust URL checker backed by VirusTotal's 70+ antivirus engines.
- **HaveIBeenPwned Password Analyzer**: Hashes passwords locally and uses k-Anonymity to check if they have been compromised in billions of global data breaches.
- **Phishing Email Scanner**: Uses semantic heuristic analysis to detect social engineering.

## Architecture
- **Frontend**: HTML5, Vanilla CSS (Glassmorphism), Vanilla JavaScript, Three.js, amCharts 5, GSAP.
- **Backend**: Node.js, Express.js. Serves as a secure proxy to fetch data from real-world threat APIs (Abuse.ch, HIBP, VirusTotal) to prevent CORS issues and protect API keys.

## Setup Instructions

1. **Install Node.js**: Ensure you have Node.js installed on your computer.
2. **Install Dependencies**:
   Open a terminal in this folder and run:
   ```bash
   npm install
   ```
3. **Configure API Keys (Optional but Recommended)**:
   - Create an account on [VirusTotal](https://www.virustotal.com/gui/join-us)
   - Go to your profile to get your free API key.
   - Open the `.env` file in this folder and paste your key: `VIRUSTOTAL_API_KEY=your_key_here`
   - *(Note: If you skip this, the URL checker will run in heuristic fallback mode).*
4. **Start the Server**:
   ```bash
   node server.js
   ```
5. **View the Website**:
   Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

## Credits
Built by **Tirth Kapatel** for the IBM Internship Project Review.
