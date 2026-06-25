// charts.js
document.addEventListener('DOMContentLoaded', () => {
  if (!window.Chart) return;
  
  // Custom defaults for dark theme
  Chart.defaults.color = '#B0BEC5';
  Chart.defaults.font.family = "'Inter', sans-serif";

  // 1. Threat Donut Chart
  const donutCtx = document.getElementById('threatDonutChart');
  let donutChart;
  
  if (donutCtx) {
    // Default fallback data
    let dynamicLabels = ['Phishing', 'Malware', 'Ransomware', 'DDoS'];
    let dynamicData = [42, 28, 18, 12];

    const initChart = () => {
        donutChart = new Chart(donutCtx, {
          type: 'doughnut',
          data: {
            labels: dynamicLabels,
            datasets: [{
              data: dynamicData,
              backgroundColor: [
                '#FF3366', // Danger
                '#FF8C00', // Warning
                '#00D4FF', // Secondary
                '#00FFD1'  // Accent
              ],
              borderWidth: 0,
              hoverOffset: 10
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(10, 14, 26, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(0, 212, 255, 0.3)',
                borderWidth: 1,
                padding: 10,
                displayColors: true,
                callbacks: {
                  label: function(context) {
                    return ` ${context.label}: ${context.raw}%`;
                  }
                }
              }
            },
            animation: {
              duration: 1500,
              easing: 'easeOutQuart'
            }
          }
        });

        // Build custom HTML legend
        const legendContainer = document.getElementById('threatLegend');
        if (legendContainer) {
          const data = donutChart.data;
          const html = data.labels.map((label, i) => `
            <div class="legend-item">
              <div class="legend-color" style="background-color: ${data.datasets[0].backgroundColor[i]}"></div>
              <span>${label} (${data.datasets[0].data[i]}%)</span>
            </div>
          `).join('');
          legendContainer.innerHTML = html;
        }
    };

    // Fetch True Real-Time Distribution from Backend
    fetch('/api/stats')
      .then(res => res.json())
      .then(stats => {
          if(stats && stats.distribution) {
              dynamicLabels = stats.distribution.labels;
              dynamicData = stats.distribution.data;
          }
          initChart();
      })
      .catch(e => {
          console.error("Failed to fetch chart stats", e);
          initChart();
      });
  }



  // 2. Weekly Line Chart
  const lineCtx = document.getElementById('weeklyLineChart');
  let lineChart;
  
  if (lineCtx) {
    const gradient = lineCtx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.0)');

    // Generate last 7 days labels
    const labels = [];
    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', {weekday: 'short'}));
    }

    lineChart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Threats Blocked',
          data: [12400, 15300, 14800, 18200, 21500, 24000, 28400],
          borderColor: '#00D4FF',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0A0E1A',
          pointBorderColor: '#00D4FF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10, 14, 26, 0.9)',
            borderColor: 'rgba(0, 212, 255, 0.3)',
            borderWidth: 1,
            padding: 10
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255,255,255,0.05)',
              drawBorder: false
            },
            ticks: {
              callback: function(value) {
                return value / 1000 + 'k';
              }
            }
          },
          x: {
            grid: {
              display: false,
              drawBorder: false
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  // Use IntersectionObserver to animate charts only when visible
  // We recreate the chart data or call update to trigger animation
  const observerOptions = {
    threshold: 0.2
  };

  const chartObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.id === 'threatTypeCard' && donutChart) {
          donutChart.update();
        }
        if (entry.target.id === 'weeklyCard' && lineChart) {
          lineChart.update();
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  if (document.getElementById('threatTypeCard')) chartObserver.observe(document.getElementById('threatTypeCard'));
  if (document.getElementById('weeklyCard')) chartObserver.observe(document.getElementById('weeklyCard'));
});
