/* -- Indicating what the script is for: Ported "Shuffle" Text Effect (Vanilla JS + GSAP) */

class ShuffleText {
  constructor(elementOrSelector, options = {}) {
    this.element = typeof elementOrSelector === 'string' 
      ? document.querySelector(elementOrSelector) 
      : elementOrSelector;

    if (!this.element) return;

    // Default Config matching the React component
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
      colorFrom: null, // e.g., '#555'
      colorTo: null    // e.g., '#fff'
    }, options);

    this.isPlaying = false;
    this.originalContent = this.config.text;
    
    // Wait for fonts (simple check)
    document.fonts.ready.then(() => {
      this.init();
    });
  }

  init() {
    this.splitText();
    this.buildDOM();
    
    // Initial Play
    this.play();

    // Hover Event
    if (this.config.triggerOnHover) {
      this.element.addEventListener('mouseenter', () => {
        if (!this.isPlaying) {
          this.play();
        }
      });
    }
  }

  // 1. Split Text into Chars (Mimics GSAP SplitText)
  splitText() {
    this.element.innerHTML = '';
    const chars = this.config.text.split('');
    
    this.chars = chars.map(char => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.display = 'inline-block';
      span.style.whiteSpace = 'pre'; // Preserve spaces
      this.element.appendChild(span);
      return span;
    });
  }

  // 2. Build the "Slot Machine" Structure
  buildDOM() {
    this.wrappers = [];
    
    this.chars.forEach((charSpan) => {
      const parent = charSpan.parentNode;
      const w = charSpan.offsetWidth;
      const h = charSpan.offsetHeight;
      
      // If empty space, just leave it
      if (!w || charSpan.textContent.trim() === '') {
        return;
      }

      // Create Wrapper (The "Window")
      const wrapper = document.createElement('span');
      Object.assign(wrapper.style, {
        display: 'inline-block',
        overflow: 'hidden',
        width: `${w}px`,
        height: ['up', 'down'].includes(this.config.shuffleDirection) ? `${h}px` : 'auto',
        verticalAlign: 'bottom',
        position: 'relative'
      });

      // Create Inner Mover (The "Strip")
      const inner = document.createElement('span');
      Object.assign(inner.style, {
        display: 'inline-block',
        whiteSpace: ['up', 'down'].includes(this.config.shuffleDirection) ? 'normal' : 'nowrap',
        willChange: 'transform'
      });

      // Insert Wrapper
      parent.insertBefore(wrapper, charSpan);
      wrapper.appendChild(inner);

      // --- GENERATE CLONES ---
      // 1. Original Char (Top/Start)
      const startNode = charSpan.cloneNode(true);
      this.styleClone(startNode, w);
      inner.appendChild(startNode);

      // 2. Random Scramble Chars
      const rolls = Math.max(1, Math.floor(this.config.shuffleTimes));
      for (let i = 0; i < rolls; i++) {
        const clone = charSpan.cloneNode(true);
        if (this.config.scrambleCharset) {
          clone.textContent = this.getRandomChar();
        }
        this.styleClone(clone, w);
        inner.appendChild(clone);
      }

      // 3. Original Char (Bottom/End)
      const endNode = charSpan.cloneNode(true);
      this.styleClone(endNode, w);
      inner.appendChild(endNode);

      // Remove old char
      charSpan.remove();

      // Store references for animation
      this.wrappers.push({ wrapper, inner, w, h, rolls });
    });
  }

  styleClone(node, width) {
    node.style.display = ['up', 'down'].includes(this.config.shuffleDirection) ? 'block' : 'inline-block';
    node.style.width = `${width}px`;
    node.style.textAlign = 'center';
    node.removeAttribute('id'); // Prevent ID dupes
  }

  getRandomChar() {
    const set = this.config.scrambleCharset;
    return set.charAt(Math.floor(Math.random() * set.length));
  }

  play() {
    this.isPlaying = true;

    // GSAP Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        this.isPlaying = false;
      }
    });

    this.wrappers.forEach((item, index) => {
      const { inner, w, h, rolls } = item;
      const steps = rolls + 1; // +1 to reach the final original char
      
      let startVars = {};
      let endVars = {};

      // Determine Animation Direction
      switch (this.config.shuffleDirection) {
        case 'right':
          startVars = { x: -steps * w };
          endVars = { x: 0 };
          // Need to reverse DOM order visual trick for 'right' usually, 
          // but simpler is to just animate from negative to 0
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

      // Set Start State
      gsap.set(inner, startVars);

      // Animate to End State
      const delay = index * this.config.stagger;
      
      tl.to(inner, {
        ...endVars,
        duration: this.config.duration,
        ease: this.config.ease,
        delay: delay
      }, 0); // All start at 0 but stagger is handled via delay
    });
  }
}
