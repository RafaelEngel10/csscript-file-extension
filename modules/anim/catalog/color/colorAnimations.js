import { removeComments, toMs, ensureInlineBlockIfNeeded, parseAnimString,  mapEventName, parseProperties  } from "../../../basics.js"

export const colorAnimations = {
  fadeColor: (el, arg) => {
  // Sintaxe esperada: fadeColor(fromColor, toColor, duration)
  // Exemplo: fadeColor(#ff0000, #00ff00, 1.5s)
    const parts = arg ? arg.split(',').map(p => p.trim()) : [];
    const fromColor = parts[0] || '#000000';
    const toColor = parts[1] || '#ffffff';
    const duration = toMs(parts[2] || '1000ms');


    el.style.transition = 'none';
    el.style.color = fromColor;

    void el.offsetWidth;

    el.style.transition = `color ${duration}ms ease-in-out`;

    requestAnimationFrame(() => {
      el.style.color = toColor;
    });
  },

  paint: (el, arg) => {
    // Sintax: paint(direction, finalColor, duration)
    // Ex: paint(left, #ff0000, 1200ms)
    const parts = arg ? arg.split(',').map(p => p.trim()) : [];
    const direction = (parts[0] || 'left').toLowerCase();
    const finalColor = parts[1] || '#000000';
    const duration = toMs(parts[2] || '600ms');

    const computed = getComputedStyle(el).color || '#000000';
    const initialColor = computed;

    ensureInlineBlockIfNeeded(el);

    const prev = {
      color: el.style.color || '',
      bg: el.style.backgroundImage || '',
      bgPos: el.style.backgroundPosition || '',
      bgSize: el.style.backgroundSize || '',
      bgClip: el.style.backgroundClip || el.style.webkitBackgroundClip || '',
      webkitTextFill: el.style.webkitTextFillColor || ''
    };

    let gradientDirection = 'to right';
    let startPos = '100% 0%';
    let endPos = '0% 0%';

    if (direction === 'right') {
      gradientDirection = 'to left';
      startPos = '0% 0%';
      endPos = '100% 0%';
    } else if (direction === 'top') {
      gradientDirection = 'to bottom';
      startPos = '0% 100%';
      endPos = '0% 0%';
    } else if (direction === 'bottom') {
      gradientDirection = 'to top';
      startPos = '0% 0%';
      endPos = '0% 100%';
    } 

    
    el.style.transition = 'none';
    el.style.backgroundImage = `linear-gradient(${gradientDirection}, ${finalColor} 0%, ${finalColor} 50%, ${initialColor} 50%, ${initialColor} 100%)`;
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundSize = '200% 200%';
    el.style.backgroundPosition = startPos;
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';

    void el.offsetWidth;

    const easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
    el.style.transition = `background-position ${duration}ms ${easing}, background-size ${Math.round(duration*0.9)}ms ${easing}`;

    requestAnimationFrame(() => {
      el.style.backgroundPosition = endPos;
      el.style.backgroundSize = '300% 300%';
    });

    setTimeout(() => {
      el.style.color = finalColor;

      el.style.backgroundImage = prev.bg;
      el.style.backgroundPosition = prev.bgPos;
      el.style.backgroundSize = prev.bgSize;
      el.style.backgroundClip = prev.bgClip;
      el.style.webkitBackgroundClip = prev.bgClip;
      el.style.webkitTextFillColor = prev.webkitTextFill;

      el.style.transition = '';

      if (prev.color) el.style.color = prev.color;
    }, duration + 40);
  },


  chameleonCamo: (el, arg) => {
    // Sintax: chameleonCamo(originalColor, finalColor, duration)
    // Ex: chameleonCamo(#fff, #00aaff, 1500)

    const parts = arg ? arg.split(',').map(p => p.trim()) : [];
    const originalColor = parts[0] || getComputedStyle(el).color || '#000';
    const finalColor = parts[1] || '#fff';
    const duration = toMs(parts[2] || '1200ms');

    ensureInlineBlockIfNeeded(el);

    el.style.background = `radial-gradient(circle at center, ${finalColor} 0%, ${originalColor} 60%)`;
    el.style.backgroundSize = '0% 0%';
    el.style.backgroundPosition = 'center center';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';
    el.style.transition = `background-size ${duration}ms ease-in-out`;

    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.style.backgroundSize = '300% 300%'; 
    });

    setTimeout(() => {
      el.style.color = finalColor;
      el.style.background = '';
      el.style.webkitTextFillColor = '';
    }, duration + 50);
  },

  octopusCamo: (el, arg) => {
    // Sintax: octopusCamo(originalColor, finalColor, duration)
    // Ex: octopusCamo(#fff, #00aaff, 1500)

    const parts = arg ? arg.split(',').map(p => p.trim()) : [];
    const originalColor = parts[0] || getComputedStyle(el).color || '#000';
    const finalColor = parts[1] || '#fff';
    const duration = toMs(parts[2] || '1200ms');

    ensureInlineBlockIfNeeded(el);

    // initial state
    el.style.background = `radial-gradient(circle at center, ${originalColor} 0%, ${finalColor} 60%)`;
    el.style.backgroundSize = '300% 300%'; 
    el.style.backgroundPosition = 'center center';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';
    el.style.transition = `background-size ${duration}ms ease-in-out`;

    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.style.backgroundSize = '0% 0%'; // inner center
    });

    setTimeout(() => {
      el.style.color = finalColor;
      el.style.background = '';
      el.style.webkitTextFillColor = '';
    }, duration + 50);
  },
}