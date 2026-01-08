/* -- Indicating what the script is for: Robust Vanilla JS Shuffle Text Effect (Fixed Timing) */

class ShuffleText {
  constructor(elementOrSelector, options = {}) {
    this.element = typeof elementOrSelector === 'string' 
      ? document.querySelector(elementOrSelector) 
      : elementOrSelector;

    if (!this.element) {
      console.warn('ShuffleText: Element not found:', elementOrSelector);
      return;
    }

    // Default Config
    this.config = Object.assign({
      text: this.element.textContent.trim(),
      shuffleDirection: 'right', // 'right', 'left', 'up', 'down'
      shuffleTimes: 3,
      duration: 0.4,
      ease: 'power3.out',
      stagger: 0.05,
      scrambleCharset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%',
      triggerOnHover: true,
      triggerOnce: true,
    }, options);

    this.isPlaying = false;
    this.wrappers = [];
    
    // CRITICAL FIX: Wait for fonts to be ready before measuring
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        // Double safety: Wait one frame for layout paint
        requestAnimationFrame(() => this.init());
      });
    } else {
      setTimeout(() => this.init(), 100); // Fallback for older browsers
    }
  }

  init() {
    // 1. Prepare Text
    this.splitText();
    
    // 2. Build DOM (Slot Machine Structure)
    this.buildDOM();
    
    // 3. Play Initial Animation
    if (window.gsap) {
      this.play();
    } else {
      console.error('ShuffleText: GSAP not found. Please include GSAP in your HTML.');
    }

    // 4. Bind Hover
    if (this.config.triggerOnHover) {
      this.element.addEventListener('mouseenter', () => {
        if (!this.isPlaying) this.play();
      });
    }
  }

  splitText() {
    this.element.innerHTML = '';
    const chars = this.config.text.split('');
    
    this.chars = chars.map(char => {
      const span = document.createElement('span');
      span.textContent = char;
      // Important for measurement
      span.style.opacity = '1'; 
      span.style.display = 'inline-block';
      span.style.whiteSpace = 'pre';
      this.element.appendChild(span);
      return span;
    });
  }

  buildDOM() {
    this.wrappers = [];
    
    this.chars.forEach((charSpan) => {
      // Precise measurement
      const rect = charSpan.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      
      // Skip invisible/empty chars (like spaces that collapsed)
      if (w === 0 && charSpan.textContent.trim() !== '') return;
      
      // Preserve spaces without animating them if needed, or animate them as blockers
      if (charSpan.textContent.trim() === '') {
        return; // Leave spaces as simple spans
      }

      const parent = charSpan.parentNode;
      
      // Wrapper (The "Window")
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.width = `${w}px`;
      wrapper.style.height = ['up', 'down'].includes(this.config.shuffleDirection) ? `${h}px` : 'auto';
      wrapper.style.verticalAlign = 'bottom';
      wrapper.style.position = 'relative';
      wrapper.style.lineHeight = '1'; // Fix vertical alignment issues

      // Inner (The "Strip")
      const inner = document.createElement('span');
      inner.style.display = 'inline-block';
      inner.style.whiteSpace = ['up', 'down'].includes(this.config.shuffleDirection) ? 'normal' : 'nowrap';
      inner.style.willChange = 'transform';
      inner.style.lineHeight = '1';

      parent.insertBefore(wrapper, charSpan);
      wrapper.appendChild(inner);

      // --- CLONES ---
      // 1. Top Original
      const startNode = this.createClone(charSpan, w, h);
      inner.appendChild(startNode);

      // 2. Scramble Clones
      const rolls = Math.max(1, Math.floor(this.config.shuffleTimes));
      for (let i = 0; i < rolls; i++) {
        const clone = this.createClone(charSpan, w, h);
        if (this.config.scrambleCharset) {
          clone.textContent = this.getRandomChar();
        }
        inner.appendChild(clone);
      }

      // 3. Bottom Original
      const endNode = this.createClone(charSpan, w, h);
      inner.appendChild(endNode);

      // Remove original simple span
      charSpan.remove();

      this.wrappers.push({ inner, w, h, rolls });
    });
  }

  createClone(original, w, h) {
    const clone = original.cloneNode(true);
    clone.style.display = ['up', 'down'].includes(this.config.shuffleDirection) ? 'block' : 'inline-block';
    clone.style.width = `${w}px`;
    clone.style.height = `${h}px`; // Force height to match for vertical scroll
    clone.style.textAlign = 'center';
    clone.style.boxSizing = 'border-box';
    return clone;
  }

  getRandomChar() {
    const set = this.config.scrambleCharset;
    return set.charAt(Math.floor(Math.random() * set.length));
  }

  play() {
    if (this.isPlaying || this.wrappers.length === 0) return;
    this.isPlaying = true;

    const tl = gsap.timeline({
      onComplete: () => {
        this.isPlaying = false;
      }
    });

    this.wrappers.forEach((item, index) => {
      const { inner, w, h, rolls } = item;
      const steps = rolls + 1;
      
      let startVars = {};
      let endVars = {};

      switch (this.config.shuffleDirection) {
        case 'right':
          startVars = { x: -steps * w };
          endVars = { x: 0 };
          break;
        case 'left':
          startVars = { x: 0 };
          endVars = { x: -steps * w };
          break;
        case 'down':
          startVars = { y: -steps * h };
          endVars = { y: 0 };
          break;
        case 'up':
          startVars = { y: 0 };
          endVars = { y: -steps * h };
          break;
      }

      gsap.set(inner, startVars);

      tl.to(inner, {
        ...endVars,
        duration: this.config.duration,
        ease: this.config.ease,
        delay: index * this.config.stagger
      }, 0);
    });
  }
}
