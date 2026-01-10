/* -- Indicating what the script is for: GSAP-based Shuffle Text (Fixed Vertical Animation Logic) */

class ShuffleText {
  constructor(elementOrSelector, options = {}) {
    this.element = typeof elementOrSelector === 'string' 
      ? document.querySelector(elementOrSelector) 
      : elementOrSelector;

    if (!this.element) {
      console.warn('ShuffleText: Element not found');
      return;
    }

    // Default Config
    this.config = Object.assign({
      text: this.element.textContent.trim(),
      shuffleDirection: 'right', // 'right', 'left', 'up', 'down'
      shuffleTimes: 3,
      duration: 0.4, 
      ease: 'power3.out',
      stagger: 0.04,
      animationMode: 'evenodd', // 'evenodd' or 'random'
      scrambleCharset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%',
      triggerOnHover: true,
      triggerOnce: true
    }, options);

    this.isPlaying = false;
    this.wrappers = [];
    
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
    
    // Play immediately on load
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
      
      // Skip empty/invisible chars, but keep spaces
      if (w === 0 && charSpan.textContent.trim() !== '') return;
      if (charSpan.textContent.trim() === '') {
          // If it's just a space, leave it as is, don't animate
          return;
      }

      const parent = charSpan.parentNode;
      
      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.width = `${w}px`;
      // Vertical modes need fixed height, horizontal can be auto
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

      // --- CLONE LOGIC ---
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

      // --- CALCULATE POSITIONS ---
      const steps = rolls + 1;
      let startX = 0, startY = 0;
      let finalX = 0, finalY = 0;

      switch (this.config.shuffleDirection) {
        case 'right':
            // Logic: Move from LEFT (-steps*w) to 0
            startX = -steps * w; 
            finalX = 0;
            break;
        case 'left':
            // Logic: Move from 0 to LEFT (-steps*w)
            startX = 0; 
            finalX = -steps * w;
            break;
        case 'down':
            // Logic: Move from TOP (-steps*h) to 0
            startY = -steps * h; 
            finalY = 0;
            break;
        case 'up':
            // Logic: Move from 0 to TOP (-steps*h)
            startY = 0; 
            finalY = -steps * h;
            break;
      }

      // Set START position immediately
      gsap.set(inner, { x: startX, y: startY });

      // Save FINAL position to data attributes for the play function to read
      inner.dataset.finalX = finalX;
      inner.dataset.finalY = finalY;

      this.wrappers.push(inner);
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

    // Separate Even and Odd indexed wrappers
    const odd = this.wrappers.filter((_, i) => i % 2 !== 0);
    const even = this.wrappers.filter((_, i) => i % 2 === 0);

    const tl = gsap.timeline({
      onComplete: () => { this.isPlaying = false; }
    });

    // Helper to read the stored final position
    const getVars = () => ({
      x: (i, target) => parseFloat(target.dataset.finalX || 0),
      y: (i, target) => parseFloat(target.dataset.finalY || 0),
      duration: this.config.duration,
      ease: this.config.ease,
      stagger: this.config.stagger
    });

    if (this.config.animationMode === 'evenodd') {
      const oddTotal = this.config.duration + Math.max(0, odd.length - 1) * this.config.stagger;
      const evenStart = odd.length ? oddTotal * 0.7 : 0; // Overlap slightly
      
      if (odd.length) tl.to(odd, getVars(), 0);
      if (even.length) tl.to(even, getVars(), evenStart);
    } else {
      // Standard Sequential
      tl.to(this.wrappers, getVars(), 0);
    }
  }
}
