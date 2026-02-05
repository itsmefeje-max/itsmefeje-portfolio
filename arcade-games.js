(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const keys = new Set();
  const clearKeys = () => keys.clear();
  window.addEventListener('keydown', (event) => {
    keys.add(event.key.toLowerCase());
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.key.toLowerCase());
  });
  window.addEventListener('blur', clearKeys);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearKeys();
  });

  class NeonDriftCircuit {
    constructor(canvas, statusEl) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.statusEl = statusEl;
      this.running = false;
      this.reset();
    }

    reset() {
      this.player = { x: 90, y: this.canvas.height / 2, r: 12, speed: 2.8, boost: 1 };
      this.score = 0;
      this.timeLeft = 45;
      this.gates = [];
      this.spawnGate(true);
      this.lastTick = performance.now();
      this.countdownAccumulator = 0;
      this.running = false;
      this.updateStatus('Ready to launch.');
      this.draw();
    }

    spawnGate(initial = false) {
      this.gates.push({
        x: initial ? this.canvas.width * 0.5 : this.canvas.width + 40,
        y: 40 + Math.random() * (this.canvas.height - 80),
        size: 32 + Math.random() * 22,
        active: true
      });
    }

    updateStatus(text) {
      this.statusEl.textContent = text;
    }

    start() {
      if (this.running) return;
      if (this.timeLeft <= 0) this.reset();
      this.running = true;
      this.lastTick = performance.now();
      this.updateStatus('Race live — hit as many gates as possible.');
      requestAnimationFrame((t) => this.loop(t));
    }

    end() {
      this.running = false;
      this.updateStatus(`Run complete. Final score: ${this.score}`);
    }

    update(deltaMs) {
      const delta = deltaMs / 16.67;
      const up = keys.has('arrowup') || keys.has('w');
      const down = keys.has('arrowdown') || keys.has('s');
      const left = keys.has('arrowleft') || keys.has('a');
      const right = keys.has('arrowright') || keys.has('d');
      const boosting = keys.has('shift');

      this.player.boost = boosting ? 1.7 : 1;
      const velocity = this.player.speed * this.player.boost * delta;
      if (up) this.player.y -= velocity;
      if (down) this.player.y += velocity;
      if (left) this.player.x -= velocity;
      if (right) this.player.x += velocity;

      this.player.x = clamp(this.player.x, 12, this.canvas.width - 12);
      this.player.y = clamp(this.player.y, 12, this.canvas.height - 12);

      this.gates.forEach((gate) => {
        gate.x -= 3.2 * delta;
        if (gate.active) {
          const inX = this.player.x > gate.x - 8 && this.player.x < gate.x + 8;
          const inY = Math.abs(this.player.y - gate.y) < gate.size;
          if (inX && inY) {
            gate.active = false;
            this.score += boosting ? 15 : 10;
          }
        }
      });

      if (this.gates.length < 4 && this.gates[this.gates.length - 1].x < this.canvas.width - 120) {
        this.spawnGate();
      }
      this.gates = this.gates.filter((gate) => gate.x > -60);

      this.countdownAccumulator += deltaMs;
      if (this.countdownAccumulator >= 1000) {
        this.countdownAccumulator -= 1000;
        this.timeLeft -= 1;
        if (this.timeLeft <= 0) {
          this.timeLeft = 0;
          this.end();
        }
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
      gradient.addColorStop(0, '#050b1e');
      gradient.addColorStop(1, '#170a2b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.24)';
      for (let i = 1; i < 10; i += 1) {
        const y = (this.canvas.height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.canvas.width, y);
        ctx.stroke();
      }

      this.gates.forEach((gate) => {
        ctx.strokeStyle = gate.active ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(gate.x, gate.y - gate.size);
        ctx.lineTo(gate.x, gate.y + gate.size);
        ctx.stroke();
      });

      ctx.fillStyle = '#f0abfc';
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, this.player.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 14px Inter, sans-serif';
      ctx.fillText(`Score: ${this.score}`, 14, 24);
      ctx.fillText(`Time: ${this.timeLeft}s`, 14, 46);
      if (this.player.boost > 1) {
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('BOOST', 14, 68);
      }
    }

    loop(timestamp) {
      if (!this.running) {
        this.draw();
        return;
      }
      const deltaMs = Math.min(33, timestamp - this.lastTick);
      this.lastTick = timestamp;
      this.update(deltaMs);
      this.draw();
      if (this.running) requestAnimationFrame((t) => this.loop(t));
    }
  }

  class SignalSiege {
    constructor(canvas, statusEl) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.statusEl = statusEl;
      this.path = [
        { x: 0, y: 150 }, { x: 90, y: 150 }, { x: 90, y: 70 }, { x: 220, y: 70 },
        { x: 220, y: 220 }, { x: 350, y: 220 }, { x: 350, y: 120 }, { x: 520, y: 120 }
      ];
      this.turrets = [
        { x: 135, y: 118, online: true },
        { x: 265, y: 158, online: true },
        { x: 308, y: 84, online: true }
      ];

      this.canvas.addEventListener('click', (event) => this.toggleTurret(event));
      this.running = false;
      this.reset();
    }

    reset() {
      this.enemies = [];
      this.lives = 12;
      this.energy = 100;
      this.wave = 1;
      this.score = 0;
      this.turrets.forEach((turret) => {
        turret.online = true;
      });
      this.spawnInterval = 1400;
      this.lastSpawn = performance.now();
      this.lastTick = performance.now();
      this.running = false;
      this.statusEl.textContent = 'Ready to launch.';
      this.draw();
    }

    start() {
      if (this.running) return;
      if (this.energy <= 0 || this.lives <= 0) this.reset();
      this.running = true;
      this.lastSpawn = performance.now();
      this.lastTick = performance.now();
      this.statusEl.textContent = 'Defend the core — toggle turrets strategically.';
      requestAnimationFrame((t) => this.loop(t));
    }

    spawnEnemy() {
      this.enemies.push({ progress: 0, speed: 0.00012 + this.wave * 0.000015, hp: 26 + this.wave * 7 });
    }

    getPoint(progress) {
      const totalSegments = this.path.length - 1;
      const scaled = progress * totalSegments;
      const segment = Math.min(totalSegments - 1, Math.floor(scaled));
      const t = scaled - segment;
      const a = this.path[segment];
      const b = this.path[segment + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }

    toggleTurret(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const target = this.turrets.find((turret) => Math.hypot(turret.x - x, turret.y - y) <= 22);
      if (!target) return;
      target.online = !target.online;
      if (this.running) {
        this.statusEl.textContent = `${target.online ? 'Turret online' : 'Turret offline'} — energy ${Math.floor(this.energy)}%.`;
      }
      this.draw();
    }

    update(deltaMs) {
      if (this.energy <= 0 || this.lives <= 0) {
        this.running = false;
        this.statusEl.textContent = `Simulation failed. Wave ${this.wave}, score ${this.score}.`;
        return;
      }

      if (performance.now() - this.lastSpawn > this.spawnInterval) {
        this.spawnEnemy();
        this.lastSpawn = performance.now();
      }

      const onlineTurrets = this.turrets.filter((turret) => turret.online);
      this.energy = clamp(this.energy + (onlineTurrets.length === 0 ? 0.1 : -0.025 * onlineTurrets.length) * (deltaMs / 16.67), 0, 100);

      this.enemies.forEach((enemy) => {
        enemy.progress += enemy.speed * deltaMs;
      });

      onlineTurrets.forEach((turret) => {
        const target = this.enemies.find((enemy) => {
          const point = this.getPoint(enemy.progress);
          return Math.hypot(point.x - turret.x, point.y - turret.y) < 95;
        });
        if (target) {
          target.hp -= 0.19 * deltaMs;
        }
      });

      const remaining = [];
      this.enemies.forEach((enemy) => {
        if (enemy.hp <= 0) {
          this.score += 10;
          return;
        }
        if (enemy.progress >= 1) {
          this.lives -= 1;
          return;
        }
        remaining.push(enemy);
      });
      this.enemies = remaining;

      if (this.score >= this.wave * 120) {
        this.wave += 1;
        this.spawnInterval = Math.max(520, this.spawnInterval - 100);
      }

      this.statusEl.textContent = `Wave ${this.wave} · Lives ${this.lives} · Energy ${Math.floor(this.energy)}% · Score ${this.score}`;
    }

    drawPath() {
      const ctx = this.ctx;
      ctx.beginPath();
      ctx.moveTo(this.path[0].x, this.path[0].y);
      for (let i = 1; i < this.path.length; i += 1) {
        ctx.lineTo(this.path[i].x, this.path[i].y);
      }
      ctx.lineWidth = 24;
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
      ctx.stroke();

      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.9)';
      ctx.stroke();
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, '#071124');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.drawPath();

      this.turrets.forEach((turret) => {
        ctx.fillStyle = turret.online ? '#22c55e' : '#475569';
        ctx.beginPath();
        ctx.arc(turret.x, turret.y, 16, 0, Math.PI * 2);
        ctx.fill();
        if (turret.online) {
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(turret.x, turret.y, 34, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      this.enemies.forEach((enemy) => {
        const point = this.getPoint(enemy.progress);
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 14px Inter, sans-serif';
      ctx.fillText(`Core Integrity: ${this.lives}`, 14, 24);
      ctx.fillText(`Energy: ${Math.floor(this.energy)}%`, 14, 46);
      ctx.fillText(`Score: ${this.score}`, 14, 68);
    }

    loop(timestamp) {
      if (!this.running) {
        this.draw();
        return;
      }
      const deltaMs = Math.min(33, timestamp - this.lastTick);
      this.lastTick = timestamp;
      this.update(deltaMs);
      this.draw();
      if (this.running) requestAnimationFrame((t) => this.loop(t));
    }
  }

  class OrbitReverie {
    constructor(canvas, statusEl) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.statusEl = statusEl;
      this.running = false;
      this.reset();
    }

    reset() {
      this.ship = { x: this.canvas.width / 2, y: this.canvas.height / 2, r: 11 };
      this.stars = Array.from({ length: 40 }, () => ({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: 0.6 + Math.random() * 1.8
      }));
      this.nodes = Array.from({ length: 5 }, () => this.newNode());
      this.energy = 100;
      this.memory = 0;
      this.time = 60;
      this.running = false;
      this.lastTick = performance.now();
      this.countdownAccumulator = 0;
      this.statusEl.textContent = 'Ready to launch.';
      this.draw();
    }

    newNode() {
      return {
        x: 30 + Math.random() * (this.canvas.width - 60),
        y: 30 + Math.random() * (this.canvas.height - 60),
        r: 7 + Math.random() * 6
      };
    }

    start() {
      if (this.running) return;
      if (this.time <= 0 || this.energy <= 0) this.reset();
      this.running = true;
      this.lastTick = performance.now();
      this.statusEl.textContent = 'Exploration active — collect memory nodes.';
      requestAnimationFrame((t) => this.loop(t));
    }

    update(deltaMs) {
      const delta = deltaMs / 16.67;
      const up = keys.has('arrowup') || keys.has('w');
      const down = keys.has('arrowdown') || keys.has('s');
      const left = keys.has('arrowleft') || keys.has('a');
      const right = keys.has('arrowright') || keys.has('d');

      const speed = 2.1 * delta;
      if (up) this.ship.y -= speed;
      if (down) this.ship.y += speed;
      if (left) this.ship.x -= speed;
      if (right) this.ship.x += speed;

      this.ship.x = clamp(this.ship.x, 12, this.canvas.width - 12);
      this.ship.y = clamp(this.ship.y, 12, this.canvas.height - 12);

      if (up || down || left || right) {
        this.energy = clamp(this.energy - 0.045 * deltaMs, 0, 100);
      } else {
        this.energy = clamp(this.energy + 0.02 * deltaMs, 0, 100);
      }

      this.nodes = this.nodes.map((node) => {
        if (Math.hypot(node.x - this.ship.x, node.y - this.ship.y) <= node.r + this.ship.r) {
          this.memory += 1;
          this.energy = clamp(this.energy + 9, 0, 100);
          return this.newNode();
        }
        return node;
      });

      this.countdownAccumulator += deltaMs;
      if (this.countdownAccumulator >= 1000) {
        this.countdownAccumulator -= 1000;
        this.time -= 1;
      }

      if (this.time <= 0 || this.energy <= 0) {
        this.running = false;
        this.statusEl.textContent = `Session complete. Memory nodes: ${this.memory}`;
      } else {
        this.statusEl.textContent = `Energy ${Math.floor(this.energy)}% · Memory ${this.memory} · Time ${this.time}s`;
      }
    }

    draw() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = '#040711';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.stars.forEach((star) => {
        ctx.globalAlpha = 0.4 + Math.random() * 0.6;
        ctx.fillStyle = '#dbeafe';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      this.nodes.forEach((node) => {
        ctx.fillStyle = 'rgba(192, 132, 252, 0.25)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(this.ship.x, this.ship.y, this.ship.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 14px Inter, sans-serif';
      ctx.fillText(`Energy: ${Math.floor(this.energy)}%`, 14, 24);
      ctx.fillText(`Memory: ${this.memory}`, 14, 46);
      ctx.fillText(`Time: ${this.time}s`, 14, 68);
    }

    loop(timestamp) {
      if (!this.running) {
        this.draw();
        return;
      }
      const deltaMs = Math.min(33, timestamp - this.lastTick);
      this.lastTick = timestamp;
      this.update(deltaMs);
      this.draw();
      if (this.running) requestAnimationFrame((t) => this.loop(t));
    }
  }

  function wireGame(gameName, instance) {
    const buttons = document.querySelectorAll(`[data-game="${gameName}"]`);
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'start') instance.start();
        if (action === 'reset') instance.reset();
      });
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    const driftCanvas = document.getElementById('drift-game');
    const siegeCanvas = document.getElementById('siege-game');
    const orbitCanvas = document.getElementById('orbit-game');

    if (!driftCanvas || !siegeCanvas || !orbitCanvas) return;

    const drift = new NeonDriftCircuit(driftCanvas, document.getElementById('drift-status'));
    const siege = new SignalSiege(siegeCanvas, document.getElementById('siege-status'));
    const orbit = new OrbitReverie(orbitCanvas, document.getElementById('orbit-status'));

    wireGame('drift', drift);
    wireGame('siege', siege);
    wireGame('orbit', orbit);
  });
})();
