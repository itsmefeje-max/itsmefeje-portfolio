/* -- Indicating what the script is for: GSAP-based Shuffle Text (Replicates React Component Logic) */

class ShuffleText {
  constructor(elementOrSelector, options = {}) {
    this.element = typeof elementOrSelector === 'string' 
      ? document.querySelector(elementOrSelector) 
      : elementOrSelector;

    if (!this.element) {
      console.warn('ShuffleText: Element not found');
      return;
    }

    // Default Config (Matching React Props)
    this.config = Object.assign({
      text: this.element.textContent.trim(),
      shuffleDirection: 'right', // 'right', 'left', 'up', 'down'
      shuffleTimes: 3,
      duration: 0.35, 
      ease: 'power3.out',
      stagger: 0.03,
      animationMode: 'evenodd', // 'evenodd' or 'random'
      scrambleCharset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%',
      triggerOnHover: true,
      triggerOnce: true
    }, options);

    this.isPlaying = false;
    this.wrappers = [];
    this.splits = [];
    
    // Init when fonts are ready
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.init());
    } else {
      setTimeout(() => this.init(), 100);
    }
  }

  init() {
    this.splitText();
    this.buildDOM();
    
    // Bind Hover
    if (this.config.triggerOnHover) {
      this.element.addEventListener('mouseenter', () => {
        if (!this.isPlaying) this.play();
      });
    }
    
    // Initial Play
    this.play();
  }

  splitText() {
    this.element.innerHTML = '';
    const chars = this.config.text.split('');
    
    this.splits = chars.map(char => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.opacity = '1'; 
      span.style.display = 'inline-block';
      span.style.whiteSpace = 'pre';
      this.element.appendChild(span);
      return span;
    });
  }

  buildDOM() {
    this.wrappers = [];
    
    this.splits.forEach((charSpan) => {
      const rect = charSpan.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      
      if (charSpan.textContent.trim() === '') return;

      const parent = charSpan.parentNode;
      
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.width = `${w}px`;
      wrapper.style.height = ['up', 'down'].includes(this.config.shuffleDirection) ? `${h}px` : 'auto';
      wrapper.style.verticalAlign = 'bottom';
      wrapper.style.position = 'relative';
      wrapper.style.lineHeight = '1'; 

      const inner = document.createElement('span');
      inner.style.display = 'inline-block';
      inner.style.whiteSpace = ['up', 'down'].includes(this.config.shuffleDirection) ? 'normal' : 'nowrap';
      inner.style.willChange = 'transform';
      
      parent.insertBefore(wrapper, charSpan);
      wrapper.appendChild(inner);

      // 1. Original
      inner.appendChild(this.createClone(charSpan, w, h));

      // 2. Scrambles
      const rolls = Math.max(1, Math.floor(this.config.shuffleTimes));
      for (let i = 0; i < rolls; i++) {
        const clone = this.createClone(charSpan, w, h);
        if (this.config.scrambleCharset) {
          clone.textContent = this.getRandomChar();
        }
        inner.appendChild(clone);
      }

      // 3. Target
      inner.appendChild(this.createClone(charSpan, w, h));

      charSpan.remove();

      const steps = rolls + 1;
      let startVars = {};

      switch (this.config.shuffleDirection) {
        case 'right': startVars = { x: -steps * w }; break;
        case 'left': startVars = { x: 0 }; break;
        case 'down': startVars = { y: -steps * h }; break;
        case 'up': startVars = { y: 0 }; break;
      }

      gsap.set(inner, startVars);
      this.wrappers.push({ inner, w, h });
    });
  }

  createClone(original, w, h) {
    const clone = original.cloneNode(true);
    const isVertical = ['up', 'down'].includes(this.config.shuffleDirection);
    clone.style.display = isVertical ? 'block' : 'inline-block';
    clone.style.width = `${w}px`;
    clone.style.height = `${h}px`;
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

    const targets = this.wrappers.map(w => w.inner);
    const odd = targets.filter((_, i) => i % 2 !== 0);
    const even = targets.filter((_, i) => i % 2 === 0);

    const tl = gsap.timeline({
      onComplete: () => { this.isPlaying = false; }
    });

    // "EvenOdd" Logic from React Code
    if (this.config.animationMode === 'evenodd') {
      const oddTotal = this.config.duration + Math.max(0, odd.length - 1) * this.config.stagger;
      const evenStart = odd.length ? oddTotal * 0.7 : 0;
      
      if (odd.length) {
        tl.to(odd, {
          x: 0, y: 0,
          duration: this.config.duration,
          ease: this.config.ease,
          stagger: this.config.stagger
        }, 0);
      }
      if (even.length) {
        tl.to(even, {
          x: 0, y: 0,
          duration: this.config.duration,
          ease: this.config.ease,
          stagger: this.config.stagger
        }, evenStart);
      }
    } else {
      // Fallback simple stagger
      tl.to(targets, {
        x: 0, y: 0,
        duration: this.config.duration,
        ease: this.config.ease,
        stagger: this.config.stagger
      }, 0);
    }
  }
}
