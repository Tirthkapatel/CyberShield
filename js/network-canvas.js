// network-canvas.js - Live Network Packet Flow Visualization
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('shieldCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  // Configuration
  const NUM_NODES = 40;
  const CONNECTION_DISTANCE = 150;
  const PACKET_SPEED = 2;
  const THREAT_CHANCE = 0.15; // 15% chance a packet is a threat

  let nodes = [];
  let edges = [];
  let packets = [];
  let ripples = [];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height || 600;
    canvas.width = width;
    canvas.height = height;
    initNetwork();
  }

  window.addEventListener('resize', resize);

  class Node {
    constructor(x, y, isCenter = false) {
      this.x = x;
      this.y = y;
      this.isCenter = isCenter;
      this.radius = isCenter ? 15 : Math.random() * 3 + 2;
      this.color = isCenter ? '#00FFD1' : '#B0BEC5';
      this.pulse = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + Math.sin(this.pulse) * 2, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.isCenter ? 20 : 5;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      this.pulse += 0.05;
    }
  }

  class Edge {
    constructor(nodeA, nodeB) {
      this.nodeA = nodeA;
      this.nodeB = nodeB;
      this.distance = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);
    }

    draw() {
      ctx.beginPath();
      ctx.moveTo(this.nodeA.x, this.nodeA.y);
      ctx.lineTo(this.nodeB.x, this.nodeB.y);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  class Packet {
    constructor(startNode, endNode, isThreat) {
      this.start = startNode;
      this.end = endNode;
      this.isThreat = isThreat;
      this.progress = 0;
      this.color = isThreat ? '#FF3366' : '#00D4FF';
      this.size = isThreat ? 4 : 2;
      this.speed = (PACKET_SPEED / Math.hypot(startNode.x - endNode.x, startNode.y - endNode.y)) * (Math.random() * 0.5 + 0.5);
      this.dead = false;
    }

    update() {
      this.progress += this.speed;
      if (this.progress >= 1) {
        this.progress = 1;
        this.dead = true;
        
        // If threat reached center, trigger firewall ripple
        if (this.isThreat && this.end.isCenter) {
          ripples.push(new Ripple(this.end.x, this.end.y, '#FF3366'));
        } else if (!this.isThreat && this.end.isCenter) {
          // Normal packet reached center, slight blue glow
          this.end.pulse += 1;
        } else if (!this.end.isCenter && Math.random() > 0.3) {
          // Continue hopping to center
          const nextEdge = edges.find(e => e.nodeA === this.end || e.nodeB === this.end);
          if (nextEdge) {
            const nextNode = nextEdge.nodeA === this.end ? nextEdge.nodeB : nextEdge.nodeA;
            packets.push(new Packet(this.end, nextNode, this.isThreat));
          }
        }
      }
    }

    draw() {
      const x = this.start.x + (this.end.x - this.start.x) * this.progress;
      const y = this.start.y + (this.end.y - this.start.y) * this.progress;

      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Packet trail
      ctx.beginPath();
      ctx.moveTo(x, y);
      const tailLength = 0.1;
      const tailX = this.start.x + (this.end.x - this.start.x) * Math.max(0, this.progress - tailLength);
      const tailY = this.start.y + (this.end.y - this.start.y) * Math.max(0, this.progress - tailLength);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.stroke();
    }
  }

  class Ripple {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = 10;
      this.opacity = 1;
      this.dead = false;
    }

    update() {
      this.radius += 2;
      this.opacity -= 0.02;
      if (this.opacity <= 0) this.dead = true;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 51, 102, ${this.opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function initNetwork() {
    nodes = [];
    edges = [];
    packets = [];
    ripples = [];

    // Create center node (Main Server)
    const centerNode = new Node(width / 2, height / 2, true);
    nodes.push(centerNode);

    // Create scattered nodes
    for (let i = 0; i < NUM_NODES; i++) {
      let x = Math.random() * width;
      let y = Math.random() * height;
      
      // Avoid placing right on top of center
      if (Math.hypot(x - centerNode.x, y - centerNode.y) < 100) {
        x += 100;
      }
      nodes.push(new Node(x, y));
    }

    // Connect nodes based on distance
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < CONNECTION_DISTANCE || (nodes[i].isCenter && dist < CONNECTION_DISTANCE * 1.5) || (nodes[j].isCenter && dist < CONNECTION_DISTANCE * 1.5)) {
            edges.push(new Edge(nodes[i], nodes[j]));
        }
      }
    }
    
    // Ensure isolated nodes are connected to closest
    nodes.forEach(node => {
      if (node.isCenter) return;
      const hasEdge = edges.some(e => e.nodeA === node || e.nodeB === node);
      if (!hasEdge) {
        // Find closest
        let closest = centerNode;
        let minDist = Infinity;
        nodes.forEach(other => {
          if (node === other) return;
          const d = Math.hypot(node.x - other.x, node.y - other.y);
          if (d < minDist) { minDist = d; closest = other; }
        });
        edges.push(new Edge(node, closest));
      }
    });
  }

  function spawnPacket() {
    if (nodes.length < 2) return;
    
    const startNode = nodes[Math.floor(Math.random() * nodes.length)];
    if (startNode.isCenter) return; // Packets go TO center, not from

    // Find path to center
    const possibleEdges = edges.filter(e => e.nodeA === startNode || e.nodeB === startNode);
    if (possibleEdges.length === 0) return;

    // Pick edge that gets closer to center
    let bestEdge = possibleEdges[0];
    let minCenterDist = Infinity;

    possibleEdges.forEach(e => {
        const target = e.nodeA === startNode ? e.nodeB : e.nodeA;
        const distToCenter = Math.hypot(target.x - nodes[0].x, target.y - nodes[0].y);
        if (distToCenter < minCenterDist) {
            minCenterDist = distToCenter;
            bestEdge = e;
        }
    });

    const targetNode = bestEdge.nodeA === startNode ? bestEdge.nodeB : bestEdge.nodeA;
    const isThreat = Math.random() < THREAT_CHANCE;
    
    packets.push(new Packet(startNode, targetNode, isThreat));
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw network
    edges.forEach(e => e.draw());
    nodes.forEach(n => n.draw());

    // Update & draw ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].update();
      ripples[i].draw();
      if (ripples[i].dead) ripples.splice(i, 1);
    }

    // Update & draw packets
    for (let i = packets.length - 1; i >= 0; i--) {
      packets[i].update();
      packets[i].draw();
      if (packets[i].dead) packets.splice(i, 1);
    }

    // Randomly spawn new packets
    if (Math.random() < 0.1) spawnPacket();

    requestAnimationFrame(animate);
  }

  // Initialize
  setTimeout(() => {
    resize();
    animate();
  }, 100);

});
