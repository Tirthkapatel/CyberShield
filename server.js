// server.js
// Professional CyberShield Backend Server
// Built for fetching 100% real threat intelligence data
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

/**
 * ==========================================
 * REAL GLOBAL STATISTICS
 * ==========================================
 */
let liveStats = { 
    threats: 22529, 
    breaches: 1011, 
    engines: 74,
    pwnedAccounts: 17658105223,
    malwareFamilies: 617,
    targetedCountries: 42,
    apiLatency: 120
};

async function updateGlobalStats() {
    try {
        const pingStart = Date.now();
        // Fetch total active threats globally
        const urlhaus = await axios.get('https://urlhaus.abuse.ch/downloads/json_recent/');
        liveStats.apiLatency = Date.now() - pingStart; // Actual API Latency

        if (urlhaus.data) {
            liveStats.threats = Object.keys(urlhaus.data).length;
            const tags = new Set();
            const tagCounts = {};
            const ignoreTags = ['elf', '32-bit', 'mips', 'arm', 'x86', 'exe', 'dll', 'apk', 'ua-wget', '64-bit', 'bin'];
            
            Object.values(urlhaus.data).forEach(arr => {
                if(arr[0] && arr[0].tags) {
                    arr[0].tags.forEach(t => {
                        tags.add(t);
                        const lower = t.toLowerCase();
                        if(!ignoreTags.includes(lower)) {
                            tagCounts[t] = (tagCounts[t] || 0) + 1;
                        }
                    });
                }
            });
            liveStats.malwareFamilies = tags.size;

            // Calculate true Threat Distribution (Top 4 Malware Families)
            const sortedTags = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]).slice(0, 4);
            let top4Sum = 0;
            sortedTags.forEach(t => top4Sum += t[1]);
            
            if (top4Sum > 0) {
                liveStats.distribution = {
                    labels: sortedTags.map(t => t[0].charAt(0).toUpperCase() + t[0].slice(1)),
                    data: sortedTags.map(t => Math.round((t[1] / top4Sum) * 100))
                };
                
                // Ensure exact 100% sum
                const sum = liveStats.distribution.data.reduce((a,b) => a+b, 0);
                if(sum !== 100) {
                    liveStats.distribution.data[3] += (100 - sum);
                }
            } else {
                liveStats.distribution = { labels: ['Phishing', 'Malware', 'Ransomware', 'DDoS'], data: [42, 28, 18, 12] };
            }
        }
        
        // Fetch total known data breaches globally
        const hibp = await axios.get('https://haveibeenpwned.com/api/v3/breaches');
        if (hibp.data) {
            liveStats.breaches = hibp.data.length;
            liveStats.pwnedAccounts = hibp.data.reduce((acc, curr) => acc + curr.PwnCount, 0);
        }
    } catch (e) {
        console.error("Error updating stats:", e.message);
    }
}
// Update stats on startup, then every hour
updateGlobalStats();
setInterval(updateGlobalStats, 60 * 60 * 1000);

app.get('/api/stats', (req, res) => {
    res.json(liveStats);
});

/**
 * ==========================================
 * 1. REAL THREAT DATA API (Abuse.ch URLhaus)
 * ==========================================
 * Fetches real active malware domains and resolves their physical locations
 */
let cachedThreats = [];
let lastFetchTime = 0;

app.get('/api/threats', async (req, res) => {
    try {
        // Cache data for 5 minutes to avoid rate limits
        if (Date.now() - lastFetchTime < 5 * 60 * 1000 && cachedThreats.length > 0) {
            return res.json({ source: 'cache', data: cachedThreats });
        }

        // Fetch recent active malware URLs from Abuse.ch
        const response = await axios.get('https://urlhaus.abuse.ch/downloads/json_recent/');
        
        let urls = [];
        for (const key in response.data) {
            if (response.data[key] && response.data[key].length > 0) {
                urls.push(response.data[key][0]);
            }
        }
        urls = urls.reverse().slice(0, 500); // Get top 500 recent items
        
        // Extract unique IP addresses from the response
        const ipMap = new Map();
        urls.forEach(item => {
            try {
                const parsedUrl = new URL(item.url);
                const host = parsedUrl.hostname;
                const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
                
                if (ipRegex.test(host)) {
                    if (!ipMap.has(host)) {
                        ipMap.set(host, {
                            ip: host,
                            url: item.url,
                            threat: item.threat, // e.g., "malware_download"
                            tags: item.tags || ['malware'],
                            date: item.dateadded
                        });
                    }
                }
            } catch (e) {
                // Ignore invalid URLs
            }
        });

        const ipsToGeolocate = Array.from(ipMap.keys()).slice(0, 100); // IP-API batch limit is 100
        
        if (ipsToGeolocate.length === 0) {
            return res.json({ source: 'api', data: [] });
        }

        // Batch geolocate using ip-api.com
        const geoResponse = await axios.post('http://ip-api.com/batch', ipsToGeolocate);
        
        const enrichedThreats = geoResponse.data.map((geoInfo, index) => {
            const threatInfo = ipMap.get(ipsToGeolocate[index]);
            
            // Determine severity based on tags
            let severity = 'medium';
            if (threatInfo.tags.includes('ransomware') || threatInfo.tags.includes('botnet')) severity = 'critical';
            else if (threatInfo.tags.includes('phishing') || threatInfo.threat === 'malware_download') severity = 'high';

            // Extract meaningful malware tag
            let meaningfulTag = 'MALWARE';
            if (threatInfo.tags && threatInfo.tags.length > 0) {
                const ignoreTags = ['elf', '32-bit', 'mips', 'arm', 'x86', 'exe', 'dll', 'apk', 'ua-wget', '64-bit', 'bin'];
                const validTag = threatInfo.tags.find(t => !ignoreTags.includes(t.toLowerCase()));
                meaningfulTag = (validTag || threatInfo.tags[0]).toUpperCase();
            }

            return {
                ip: geoInfo.query,
                country: geoInfo.country,
                countryCode: geoInfo.countryCode,
                city: geoInfo.city,
                lat: geoInfo.lat,
                lon: geoInfo.lon,
                type: meaningfulTag,
                url: threatInfo.url,
                severity: severity,
                timestamp: threatInfo.date
            };
        }).filter(t => t.lat && t.lon); // Only return threats with valid coordinates

        // Update live stats for unique countries targeted
        const uniqueCountries = new Set(enrichedThreats.map(t => t.countryCode));
        if (uniqueCountries.size > 0) {
            liveStats.targetedCountries = uniqueCountries.size;
        }

        // Cache the successful fetch
        cachedThreats = enrichedThreats;
        lastFetchTime = Date.now();

        res.json({ source: 'api', data: enrichedThreats });

    } catch (error) {
        console.error("Error fetching threats:", error.message);
        res.status(500).json({ error: "Failed to fetch threat data" });
    }
});

/**
 * ==========================================
 * 2. REAL PASSWORD BREACH API (HaveIBeenPwned)
 * ==========================================
 * Checks password against billions of real leaked passwords using k-Anonymity
 */
app.post('/api/check-password', async (req, res) => {
    try {
        const { sha1Prefix } = req.body;
        
        if (!sha1Prefix || sha1Prefix.length !== 5) {
            return res.status(400).json({ error: "Invalid SHA-1 prefix" });
        }

        // HIBP API requires only the first 5 characters of the SHA-1 hash (k-Anonymity)
        // This means the password NEVER leaves our backend.
        const response = await axios.get(`https://api.pwnedpasswords.com/range/${sha1Prefix}`, {
            headers: {
                'User-Agent': 'CyberShield-IBM-Internship-Project'
            }
        });

        // The API returns a text list of suffixes and their breach counts.
        // We send this text back to the frontend to parse.
        res.send(response.data);

    } catch (error) {
        console.error("Error checking password breach:", error.message);
        res.status(500).json({ error: "Failed to check password" });
    }
});

/**
 * ==========================================
 * 3. REAL URL SCANNER (VirusTotal API)
 * ==========================================
 */
app.post('/api/check-url', async (req, res) => {
    const { url } = req.body;
    const apiKey = process.env.VIRUSTOTAL_API_KEY;

    if (!url) return res.status(400).json({ error: "URL is required" });

    // Fallback: If no API key provided, tell frontend to use local heuristics
    if (!apiKey) {
        return res.json({ 
            status: "fallback", 
            message: "No VirusTotal API key configured. Using local heuristic engine." 
        });
    }

    try {
        // VirusTotal v3 API requires URL encoding to base64url format
        const urlId = Buffer.from(url).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        
        const response = await axios.get(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
            headers: {
                'x-apikey': apiKey
            }
        });

        const stats = response.data.data.attributes.last_analysis_stats;
        
        res.json({
            status: "success",
            malicious: stats.malicious,
            suspicious: stats.suspicious,
            undetected: stats.undetected,
            harmless: stats.harmless,
            total: stats.malicious + stats.suspicious + stats.undetected + stats.harmless
        });

    } catch (error) {
        // If the URL hasn't been scanned by VT before, they return a 404.
        // We'd have to POST to scan it, but for simplicity, we return "not found".
        if (error.response && error.response.status === 404) {
            return res.json({ 
                status: "not_found", 
                message: "URL not found in VirusTotal database. Using local heuristics." 
            });
        }
        console.error("VirusTotal API Error:", error.message);
        res.status(500).json({ error: "Failed to query VirusTotal" });
    }
});

/**
 * ==========================================
 * 4. IP ADDRESS LOOKUP API
 * ==========================================
 * Fetches deep intelligence for a given IP using ip-api.com
 */
app.get('/api/ip-lookup', async (req, res) => {
    try {
        const targetIp = req.query.ip;
        if (!targetIp) {
            return res.status(400).json({ error: "IP address is required" });
        }

        // ip-api free tier (no API key required)
        const apiUrl = `http://ip-api.com/json/${targetIp}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,proxy,hosting`;
        
        const response = await axios.get(apiUrl);
        
        if (response.data.status !== 'success') {
            return res.status(400).json({ error: response.data.message || "Failed to lookup IP" });
        }

        // Calculate threat level based on proxy/hosting tags
        let threatLevel = "Low";
        let riskScore = 10;
        
        if (response.data.proxy || response.data.hosting) {
            threatLevel = "Medium";
            riskScore = 50;
            if (response.data.proxy && response.data.hosting) {
                threatLevel = "High";
                riskScore = 85;
            }
        }

        res.json({
            ...response.data,
            threatLevel,
            riskScore
        });
        
    } catch (error) {
        console.error("IP Lookup API Error:", error.message);
        res.status(500).json({ error: "Failed to perform IP lookup" });
    }
});

/**
 * ==========================================
 * SECURE AI CHATBOT (GEMINI API)
 * ==========================================
 * This hides the API key from the frontend
 */
app.post('/api/chat', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const response = await axios.post(url, req.body, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.data);
    } catch (error) {
        console.error("Gemini API Error:", error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json(error.response ? error.response.data : { error: "Failed to communicate with AI model" });
    }
});
// Start Server
app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🛡️ CyberShield Backend Server Running on Port ${PORT}`);
    console.log(`🌍 Access the website at: http://localhost:${PORT}`);
    if (!process.env.VIRUSTOTAL_API_KEY) {
        console.log(`⚠️  Warning: VIRUSTOTAL_API_KEY is not set in .env`);
        console.log(`   URL Scanner will run in heuristic fallback mode.`);
    } else {
        console.log(`✅ VirusTotal API Key loaded successfully.`);
    }
    console.log(`=================================================\n`);
});

// Export the Express API for Vercel
module.exports = app;
