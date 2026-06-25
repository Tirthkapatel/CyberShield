document.addEventListener('DOMContentLoaded', () => {
    const ipAnalyzeBtn = document.getElementById('ipAnalyzeBtn');
    const ipInput = document.getElementById('ipInput');
    const ipResult = document.getElementById('ipResult');

    if (!ipAnalyzeBtn) return;

    ipAnalyzeBtn.addEventListener('click', async () => {
        const ip = ipInput.value.trim();
        
        if (!ip) {
            ipResult.innerHTML = `
                <div class="glass" style="padding: 20px; border-radius: 12px; border-left: 4px solid var(--danger); margin-top: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: var(--danger);"><i class="fas fa-exclamation-triangle"></i> Input Error</h4>
                    <p style="margin: 0; color: var(--text-secondary);">Please enter a valid IP address.</p>
                </div>
            `;
            ipResult.hidden = false;
            return;
        }

        // Show Loading State
        ipResult.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-circle-notch fa-spin" style="font-size: 2.5rem; color: var(--accent);"></i>
                <p style="margin-top: 15px; color: var(--text-secondary); font-family: var(--font-mono);">Tracing IP route and gathering intelligence...</p>
            </div>
        `;
        ipResult.hidden = false;
        
        // Change button state
        const originalBtnText = ipAnalyzeBtn.innerHTML;
        ipAnalyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracing...';
        ipAnalyzeBtn.disabled = true;

        try {
            const response = await fetch(`/api/ip-lookup?ip=${encodeURIComponent(ip)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to lookup IP");
            }

            // Determine styles based on threat level
            let threatColor = 'var(--success)';
            let threatIcon = 'fa-shield-alt';
            
            if (data.threatLevel === 'Medium') {
                threatColor = '#FF8C00'; // Orange
                threatIcon = 'fa-exclamation-triangle';
            } else if (data.threatLevel === 'High') {
                threatColor = 'var(--danger)';
                threatIcon = 'fa-skull-crossbones';
            }

            // Build result HTML
            const resultHtml = `
                <div class="glass" style="padding: 25px; border-radius: 12px; margin-top: 20px; animation: slideUp 0.4s ease forwards;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
                        <h3 style="margin: 0; color: var(--text-primary); font-family: var(--font-mono); font-size: 1.3rem;">
                            <i class="fas fa-network-wired" style="color: var(--accent); margin-right: 10px;"></i>${data.query}
                        </h3>
                        <span style="padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; background: rgba(0,0,0,0.3); color: ${threatColor}; border: 1px solid ${threatColor};">
                            <i class="fas ${threatIcon}"></i> Threat: ${data.threatLevel}
                        </span>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
                        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
                            <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0 0 8px 0; letter-spacing: 1px;">LOCATION</p>
                            <p style="font-weight: 500; margin: 0; color: var(--text-primary);"><i class="fas fa-map-marker-alt" style="color: var(--danger); margin-right: 8px;"></i>${data.city || 'Unknown'}, ${data.country || 'Unknown'}</p>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
                            <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0 0 8px 0; letter-spacing: 1px;">ISP / ORGANIZATION</p>
                            <p style="font-weight: 500; margin: 0; color: var(--text-primary);"><i class="fas fa-server" style="color: var(--accent); margin-right: 8px;"></i>${data.isp || 'Unknown'}</p>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
                            <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0 0 8px 0; letter-spacing: 1px;">ANONYMITY</p>
                            <p style="font-weight: 500; margin: 0;">
                                ${data.proxy ? '<span style="color: var(--danger);"><i class="fas fa-user-secret" style="margin-right: 8px;"></i>VPN/Proxy Detected</span>' : '<span style="color: var(--success);"><i class="fas fa-user-check" style="margin-right: 8px;"></i>No Proxy Detected</span>'}
                            </p>
                        </div>
                        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 10px;">
                            <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0 0 8px 0; letter-spacing: 1px;">CONNECTION TYPE</p>
                            <p style="font-weight: 500; margin: 0;">
                                ${data.hosting ? '<span style="color: #FF8C00;"><i class="fas fa-building" style="margin-right: 8px;"></i>Data Center / Hosting</span>' : '<span style="color: var(--text-primary);"><i class="fas fa-home" style="margin-right: 8px;"></i>Residential IP</span>'}
                            </p>
                        </div>
                    </div>

                    <div style="width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                        <iframe 
                            width="100%" 
                            height="250" 
                            style="border:0;" 
                            loading="lazy" 
                            allowfullscreen 
                            src="https://www.openstreetmap.org/export/embed.html?bbox=${data.lon - 0.05},${data.lat - 0.05},${data.lon + 0.05},${data.lat + 0.05}&layer=mapnik&marker=${data.lat},${data.lon}">
                        </iframe>
                    </div>
                </div>
            `;
            
            ipResult.innerHTML = resultHtml;

        } catch (error) {
            ipResult.innerHTML = `
                <div class="glass" style="padding: 20px; border-radius: 12px; border-left: 4px solid var(--danger); margin-top: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: var(--danger);"><i class="fas fa-exclamation-triangle"></i> Lookup Failed</h4>
                    <p style="margin: 0; color: var(--text-secondary);">${error.message}</p>
                </div>
            `;
        } finally {
            ipAnalyzeBtn.innerHTML = originalBtnText;
            ipAnalyzeBtn.disabled = false;
        }
    });
});
