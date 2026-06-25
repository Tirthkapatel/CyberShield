// attack-map.js - 100% Real Live Attack Map
document.addEventListener('DOMContentLoaded', () => {
  const mapElement = document.getElementById('attackMap');
  if (!mapElement || !window.am5 || !window.am5map) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      initMap();
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById('attackMapCard'));

  async function fetchRealThreats() {
    try {
      const response = await fetch('/api/threats');
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      return result.data || [];
    } catch (e) {
      console.error("Failed to fetch real threats.", e);
      return [];
    }
  }

  async function initMap() {
    let root = am5.Root.new("attackMap");

    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(am5map.MapChart.new(root, {
      panX: "translateX",
      panY: "translateY",
      projection: am5map.geoMercator(),
      minZoomLevel: 1,
      maxZoomLevel: 5
    }));

    chart.set("wheelY", "none");

    // Map Theme Colors
    function getMapColors() {
      let isLight = document.documentElement.getAttribute('data-theme') === 'light';
      return {
        fill: isLight ? am5.color(0xE2E8F0) : am5.color(0x0A0E1A),
        stroke: isLight ? am5.color(0x3182CE) : am5.color(0x00D4FF),
        hoverFill: isLight ? am5.color(0xCBD5E0) : am5.color(0x00D4FF)
      };
    }

    let polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
      exclude: ["AQ"] 
    }));

    let colors = getMapColors();

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      toggleKey: "active",
      interactive: true,
      fill: colors.fill,
      stroke: colors.stroke,
      strokeWidth: 0.5,
      fillOpacity: 0.5
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: colors.hoverFill,
      fillOpacity: 0.3
    });

    // Listen to Theme Changes
    window.addEventListener('themeChanged', () => {
      let newColors = getMapColors();
      polygonSeries.mapPolygons.each(function(polygon) {
        polygon.setAll({
          fill: newColors.fill,
          stroke: newColors.stroke
        });
        if (polygon.states.lookup("hover")) {
          polygon.states.lookup("hover").setAll({
            fill: newColors.hoverFill
          });
        }
      });
    });

    // Point Series for Attacker Origins
    let pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

    pointSeries.bullets.push(function(root, series, dataItem) {
      let data = dataItem.dataContext;
      let color;
      if (data.severity === 'critical') color = am5.color(0xFF3366);
      else if (data.severity === 'high') color = am5.color(0xFF8C00);
      else color = am5.color(0x00FFD1);

      let container = am5.Container.new(root, {});

      // Attacker Point
      container.children.push(am5.Circle.new(root, {
        radius: 4,
        fill: color,
        tooltipText: "[bold]{title}[/]\nIP: {ip}\nType: {type}",
        cursorOverStyle: "pointer"
      }));
      let circle2 = container.children.push(am5.Circle.new(root, { radius: 4, fill: color, opacity: 0.5 }));
      circle2.animate({ key: "radius", to: 20, duration: 1500, easing: am5.math.easeOutQuad, loops: Infinity });
      circle2.animate({ key: "opacity", to: 0, duration: 1500, easing: am5.math.easeOutQuad, loops: Infinity });

      container.animate({ key: "opacity", from: 0, to: 1, duration: 300 });

      // Fade out and disappear
      setTimeout(() => {
        if(container) {
          container.animate({ key: "opacity", to: 0, duration: 1000 });
        }
      }, 7000);

      return am5.Bullet.new(root, { sprite: container });
    });

    let realThreats = await fetchRealThreats();
    let threatIndex = 0;
    
    function addThreatToMap() {
      if (!realThreats || realThreats.length === 0) return;
      if (threatIndex >= realThreats.length) return;

      const threat = realThreats[threatIndex];
      
      // Plot Attacker Point
      let attackerItem = pointSeries.data.push({
        geometry: { type: "Point", coordinates: [threat.lon, threat.lat] },
        title: "ATTACKER: " + (threat.city ? `${threat.city}, ${threat.country}` : threat.country),
        ip: threat.ip,
        type: threat.type,
        severity: threat.severity
      });

      // Cleanup point to free memory
      setTimeout(() => {
        if(pointSeries.dataItems.indexOf(attackerItem) !== -1) {
            pointSeries.data.removeIndex(pointSeries.dataItems.indexOf(attackerItem));
        }
      }, 8500);
      
      threatIndex++;
    }

    function queueNextPlot() {
      if (threatIndex < realThreats.length) {
        addThreatToMap();
        const nextDelay = 400 + Math.random() * 3100;
        setTimeout(queueNextPlot, nextDelay);
      }
    }
    setTimeout(queueNextPlot, 1000);

    setInterval(async () => {
      const newData = await fetchRealThreats();
      if(newData && newData.length > 0) {
        if(realThreats.length === 0 || newData[0].ip !== realThreats[0].ip) {
            pointSeries.data.clear();
            realThreats = newData;
            threatIndex = 0;
            queueNextPlot();
        }
      }
    }, 300000);
  }
});
