/* -- Indicating what the script is for: Vanilla JS Port of the ShinyText React Component */

class ShinyText {
  constructor(elementOrSelector, options = {}) {
    this.element = typeof elementOrSelector === 'string' 
      ? document.querySelector(elementOrSelector) 
      : elementOrSelector;

    if (!this.element) {
      console.warn('ShinyText: Element not found');
      return;
    }

    // Default Config (Matching React Props)
    this.options = Object.assign({
      speed: 3,             // Animation duration in seconds
      color: '#b5b5b5',     // Base text color
      shineColor: '#ffffff',// Shine color
      spread: 120,          // Gradient spread angle
      yoyo: false,          // Ping-pong animation
      pauseOnHover: false,  // Pause when mouse is over
      direction: 'left',    // 'left' or 'right'
      disabled: false
    }, options);

    this.isPaused = false;
    this.lastTime = null;
    this.elapsed = 0;
    this.animationId = null;

    this.init();
  }

  init() {
    // 1. Set static CSS styles for the gradient mask
    Object.assign(this.element.style, {
      backgroundImage: `linear-gradient(${this.options.spread}deg, ${this.options.color} 0%, ${this.options.color} 35%, ${this.options.shineColor} 50%, ${this.options.color} 65%, ${this.options.color} 100%)`,
      backgroundSize: '200% auto',
      webkitBackgroundClip: 'text',
      backgroundClip: 'text',
      webkitTextFillColor: 'transparent',
      display: 'inline-block', // Required for background movement
      textDecoration: 'none'
    });

    // 2. Bind Events
    if (this.options.pauseOnHover) {
      this.element.addEventListener('mouseenter', () => this.isPaused = true);
      this.element.addEventListener('mouseleave', () => this.isPaused = false);
    }

    // 3. Start Animation Loop
    if (!this.options.disabled) {
      this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  animate(time) {
    if (!this.lastTime) this.lastTime = time;
    const delta = (time - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = time;

    if (!this.isPaused && !this.options.disabled) {
      this.elapsed += delta;
    }

    const duration = this.options.speed;
    // Calculate progress (0 to 1) based on speed
    // If yoyo is on, the cycle is 2x duration (forward + back)
    const cycleDuration = this.options.yoyo ? duration * 2 : duration;
    let progress = (this.elapsed % cycleDuration) / duration;

    // Handle Yoyo Logic
    if (this.options.yoyo && progress > 1) {
      progress = 2 - progress; // Map 1.x -> 0.x (decreasing)
    } else if (!this.options.yoyo && progress > 1) {
      progress = 0; // Reset
    }

    // Map progress (0 to 1) to Background Position (150% to -50%)
    // This mimics the React code: backgroundPosition = `${150 - p * 2}% center`
    let positionValue = 150 - (progress * 200); 

    if (this.options.direction === 'right') {
      positionValue = -50 + (progress * 200);
    }

    this.element.style.backgroundPosition = `${positionValue}% center`;

    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }
}