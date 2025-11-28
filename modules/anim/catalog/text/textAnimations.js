import { removeComments, toMs, ensureInlineBlockIfNeeded, parseAnimString,  mapEventName, parseProperties  } from "../../../basics.js"

export const textAnimations = {
  fall: (el, arg) => {
    const duration = toMs(arg);
    ensureInlineBlockIfNeeded(el);

    el.style.transition = 'none';
    el.style.transform = 'translateY(-30px)';
    el.style.opacity = '0';

    void el.offsetWidth;

    el.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

    requestAnimationFrame(() => {
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
    });
  },


  rise: (el, arg) => {
    const duration = toMs(arg);
    ensureInlineBlockIfNeeded(el);

  // estado inicial (sem transition)
    el.style.transition = 'none';
    el.style.transform = 'translateY(30px)';
    el.style.opacity = '0';

    void el.offsetWidth;

    el.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

    requestAnimationFrame(() => {
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
    });
  },


  fadeIn: (el, arg) => {
      const duration = toMs(arg);
    // fade simples
      el.style.transition = 'none';
      el.style.opacity = '0';
      void el.offsetWidth;
      el.style.transition = `opacity ${duration}ms ease`;
      requestAnimationFrame(() => (el.style.opacity = '1'));
  },


  fadeOut: (el, arg) => {
      const duration = toMs(arg);
    // fade simples
      el.style.transition = 'none';
      el.style.opacity = '1';
      void el.offsetWidth;
      el.style.transition = `opacity ${duration}ms ease`;
      requestAnimationFrame(() => (el.style.opacity = '0'));
  },


  slideIn: (el, arg) => {
  // Sintaxe esperada: slideIn(direction, distance, duration)
  // Exemplo: slideIn(left, 50px, 800ms)
    const parts = arg ? arg.split(',').map(p => p.trim()) : [];
    const direction = parts[0] || 'left';
    const distance = parts[1] || '30px';
    const duration = toMs(parts[2] || '600ms');

    ensureInlineBlockIfNeeded(el);

    el.style.transition = 'none';
    el.style.opacity = '0';

    let startTransform = '';
    switch (direction.toLowerCase()) {
      case 'left':
        startTransform = `translateX(-${distance})`;
        break;
      case 'right':
        startTransform = `translateX(${distance})`;
        break;
      default:
        console.warn(`[CSScript] Direção inválida para slideIn: ${direction}`);
        startTransform = `translateX(-${distance})`;
    }

    el.style.transform = startTransform;

    void el.offsetWidth;

    el.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

    requestAnimationFrame(() => {
      el.style.transform = 'translate(0, 0)';
      el.style.opacity = '1';
    });
  },


  slideOut: (el, arg) => {
    // Sintaxe esperada: slideOut(direction, distance, duration)
    const parts = arg ? arg.split(',').map(p => p.trim()) : [];
    const direction = parts[0] || 'left';
    const distance = parts[1] || '30px';
    const duration = toMs(parts[2] || '600ms');

    ensureInlineBlockIfNeeded(el);
    el.style.opacity = '1';

    let startTransform = '';
    switch (direction.toLowerCase()) {
      case 'left':
        startTransform = `translateX(${distance})`;
      break;
      case 'right':
        startTransform = `translateX(-${distance})`;
      break;
      default:
        console.warn(`[CSScript] Direção inválida para slideIn: ${direction}`);
        startTransform = `translateX(-${distance})`;
    }

    el.style.transform = startTransform;
    el.style.transition = 'none';

    void el.offsetWidth;

    el.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
    requestAnimationFrame(() => {
      el.style.transform = 'translate(0, 0)';
      el.style.opacity = '0';
    });
  },


  pop: (el, arg) => {
  // Sintaxe esperada: pop(scale, duration)
  // Exemplo: pop(1.2, 300)
    const parts = arg ? arg.split(',').map(p => p.trim()) : [];
    const scale = parseFloat(parts[0]) || 1.2;
    const duration = toMs(parts[1] || '300ms');

    ensureInlineBlockIfNeeded(el);

    el.style.transition = 'none';
    el.style.transform = `scale(${scale / 0.8})`;
    el.style.opacity = '0';

    void el.offsetWidth;

    el.style.transition = `transform ${duration}ms cubic-bezier(0.25, 1.25, 0.5, 1), opacity ${duration}ms ease`;

    requestAnimationFrame(() => {
      el.style.transform = `scale(${scale})`;
      el.style.opacity = '1';
    });

    setTimeout(() => {
      el.style.transition = `transform ${duration * 0.8}ms ease-out`;
      el.style.transform = 'scale(1)';
    }, duration);
  },


  implode: (el, arg) => {
    // Sintaxe esperada: implode(scale, duration)
    // Exemplo: implode(1.2, 300)
    const parts = arg ? arg.split(',').map(p => p.trim()) : [];
    const scale = parseFloat(parts[0]) || 1.2;
    const duration = toMs(parts[1] || '300ms');

    ensureInlineBlockIfNeeded(el);

    el.style.transition = 'none';
    el.style.transform = `scale(${scale / 8})`;
    el.style.opacity = '0';

    void el.offsetWidth;

    el.style.transition = `transform ${duration}ms cubic-bezier(0.25, 1.25, 0.5, 1), opacity ${duration}ms ease`;

    requestAnimationFrame(() => {
      el.style.transform = `scale(${scale % 0.9})`;
      el.style.opacity = '1';
    });

    setTimeout(() => {
      el.style.transition = `transform ${duration * 0.8}ms ease-out`;
      el.style.transform = 'scale(1)';
    }, duration);
  },


  shake: (el, arg) => {
    // Sintaxe: shake(direction, intensity, duration)
    // Exemplo: shake(sideways, 10px, 600ms)

    const parts = arg ? arg.split(',').map(p => p.trim()) : [];
    const direction = (parts[0] || 'sideways').toLowerCase();
    const intensity = parts[1] || '10px';
    const duration = toMs(parts[2] || '600ms');

    ensureInlineBlockIfNeeded(el);
    el.style.transition = 'none';
    void el.offsetWidth;

    // Define o eixo e o padrão de movimento
    let keyframes;
    switch (direction) {
      case 'seesaw':
        keyframes = [
          'rotate(0deg)',
          'rotate(0.625deg)',
          'rotate(1.25deg)',
          'rotate(2.5deg)',
          'rotate(5deg)',
          'rotate(-0.625deg)',
          'rotate(-1.25deg)',
          'rotate(-2.5deg)',
          'rotate(-5deg)',
          'rotate(3deg)',
          'rotate(1.5deg)',
          'rotate(0.75deg)',
          'rotate(-3deg)',
          'rotate(-1.5deg)',
          'rotate(-0.75deg)',
          'rotate(0deg)'
        ];
        break;

      case 'cocktail-shaker':
        keyframes = [
          'translateY(0)',
          `translateY(-${intensity})`,
          `translateY(-${intensity*0.5})`,
          `translateY(-${intensity*0.25})`,
          `translateY(${intensity})`,
          `translateY(${intensity*0.5})`,
          `translateY(${intensity*0.25})`,
          `translateY(-${intensity})`,
          `translateY(-${intensity*0.5})`,
          `translateY(-${intensity*0.25})`,
          `translateY(${intensity})`,
          `translateY(${intensity*0.5})`,
          `translateY(${intensity*0.25})`,
          'translateY(0)'
        ];
        break;

      case 'sideways':
      default:
        keyframes = [
          'translateX(0)',
          `translateX(-${intensity})`,
          `translateX(-${intensity*0.5})`,
          `translateX(-${intensity*0.25})`,
          `translateX(${intensity})`,
          `translateX(${intensity*0.5})`,
          `translateX(${intensity*0.25})`,
          `translateX(-${intensity})`,
          `translateX(-${intensity*0.5})`,
          `translateX(-${intensity*0.25})`,
          `translateX(${intensity})`,
          `translateX(${intensity*0.5})`,
          `translateX(${intensity*0.25})`,
          'translateX(0)'
        ];
    }

    // Divide o tempo total pelos frames
    const frameCount = keyframes.length - 1;
    const frameDuration = duration / frameCount;

    // Executa a sequência com requestAnimationFrame
    let frame = 0;
    const applyFrame = () => {
      el.style.transform = keyframes[frame];
      frame++;
      if (frame < keyframes.length) {
        setTimeout(() => requestAnimationFrame(applyFrame), frameDuration);
      }
    };

    applyFrame();
  },


  shiver: (el, arg) => {
    // Sintax: shiver(intensity, duration)
    // Example: shiver(2px, 600)

    const parts = arg ? arg.split(',').map(p => p.trim()) : [];
    const intensity = parts[0] || '2px';
    const duration = toMs(parts[1] || '600ms');

    ensureInlineBlockIfNeeded(el);

    const keyframes = `
      @keyframes shiverEffect {
        0% { transform: translate(0, 0) rotate(0deg); }
        10% { transform: translate(${intensity}, -${intensity}) rotate(-1deg); }
        20% { transform: translate(-${intensity}, ${intensity}) rotate(1deg); }
        30% { transform: translate(${intensity}, ${intensity}) rotate(1deg); }
        40% { transform: translate(-${intensity}, -${intensity}) rotate(-1deg); }
        50% { transform: translate(${intensity}, -${intensity}); }
        60% { transform: translate(-${intensity}, ${intensity}); }
        70% { transform: translate(${intensity}, ${intensity}); }
        80% { transform: translate(-${intensity}, -${intensity}); }
        90% { transform: translate(${intensity}, -${intensity}); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
    `;

    const styleTag = document.createElement('style');
    styleTag.textContent = keyframes;
    document.head.appendChild(styleTag);

    el.style.animation = `shiverEffect ${duration}ms ease-in-out`;

    setTimeout(() => {
      el.style.animation = '';
      styleTag.remove();
    }, duration + 50);
  }
}