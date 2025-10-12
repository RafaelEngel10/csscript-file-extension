/* csscript.js
   Runtime simples e resiliente para CSScript (.cssc)
   - <link rel="stylesheet" href="... .cssc"> fetch only (host server needed)
   - <script type="text/cssc"> inline (without CORS)
   - support for event blocks:
       #id { window.onLoad { text: fall(600ms); }; }
*/

(function () {
  'use strict';

  /********** util helpers **********/
  const log = (...args) => console.debug('[CSScript]', ...args);

  function removeComments(s) {
    // remove /* ... */ e // ... até EOL
    return s
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
  }

  function toMs(value) {
    if (!value) return 600;
    value = value.trim();
    if (value.endsWith('ms')) return parseFloat(value);
    if (value.endsWith('s')) return parseFloat(value) * 1000;
    // se só número, assume ms
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 600;
  }

  function ensureInlineBlockIfNeeded(el) {
    const style = window.getComputedStyle(el);
    if (style.display === 'inline') {
      el.style.display = 'inline-block';
    }
  }


  /********** parser (stack-safe para blocos aninhados 1 nível) **********/
  function parseCSScript(code) {
    code = removeComments(code);
    let i = 0, n = code.length, blocks = [];

    function skipWhitespace() {
      while (i < n && /\s/.test(code[i])) i++;
    }

    while (i < n) {
      skipWhitespace();
      if (i >= n) break;

      // read selector up to first '{'
      let selStart = i;
      while (i < n && code[i] !== '{') i++;
      if (i >= n) break;
      let selector = code.slice(selStart, i).trim();
      i++; // skip '{'

      // read until matching '}' for selector block (brace matching)
      let brace = 1, innerStart = i;
      while (i < n && brace > 0) {
        if (code[i] === '{') brace++;
        else if (code[i] === '}') brace--;
        i++;
      }
      const inner = code.slice(innerStart, i - 1);

      // parse events inside inner
      const events = [];
      let j = 0, m = inner.length;

      while (j < m) {
        // skip whitespace
        while (j < m && /\s/.test(inner[j])) j++;
        if (j >= m) break;

        // read event name up to '{'
        let nameStart = j;
        while (j < m && inner[j] !== '{') j++;
        if (j >= m) break;
        let eventName = inner.slice(nameStart, j).trim();
        j++; // skip '{'

        // read event block until matching '}'
        let b = 1, contentStart = j;
        while (j < m && b > 0) {
          if (inner[j] === '{') b++;
          else if (inner[j] === '}') b--;
          j++;
        }
        const content = inner.slice(contentStart, j - 1);

        // skip optional whitespace and semicolon after event block
        while (j < m && /\s/.test(inner[j])) j++;
        if (j < m && inner[j] === ';') j++;

        // parse properties inside content: prop: value;
        const actions = [];
        const propRegex = /([a-zA-Z\-]+)\s*:\s*([^;]+);/g;
        let pm;
        while ((pm = propRegex.exec(content)) !== null) {
          actions.push({
            prop: pm[1].trim(),
            value: pm[2].trim()
          });
        }

        events.push({ name: eventName, actions });
      }

      blocks.push({ selector, events });
    }

    return blocks;
  }



  /********** animations **********/
  function animateFrom(el, initialTransform, durationMs) {
    ensureInlineBlockIfNeeded(el);

  // estado inicial (sem transition)
    el.style.transition = 'none';
    el.style.transform = initialTransform;
    el.style.opacity = '0';

  // força reflow para garantir que o browser registre o estado inicial
    void el.offsetWidth;

  // calcula transform final baseado no tipo (translateX/translateY)
    let finalTransform = 'translate(0, 0)';
    const m = initialTransform.match(/translate([XY])\s*\([^)]+\)/i);
    if (m) {
      finalTransform = m[1].toUpperCase() === 'X' ? 'translateX(0)' : 'translateY(0)';
    }

  // aplica a transição (depois do reflow)
    el.style.transition = `transform ${durationMs}ms ease, opacity ${durationMs}ms ease`;

  // no próximo frame manda para o estado final (isso dispara a animação)
    requestAnimationFrame(() => {
      el.style.transform = finalTransform;
      el.style.opacity = '1';
    });

    requestAnimationFrameAside(() => {
      el.style.transform = finalTransform;
      el.style.opacity = '0';
    })
  }

  const animations = {

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
          'rotate(5deg)',
          'rotate(-5deg)',
          'rotate(3deg)',
          'rotate(-3deg)',
          'rotate(0deg)'
        ];
        break;

      case 'cocktail-shaker':
        keyframes = [
          'translateY(0)',
          `translateY(-${intensity})`,
          `translateY(${intensity})`,
          `translateY(-${intensity})`,
          `translateY(${intensity})`,
          'translateY(0)'
        ];
        break;

      case 'sideways':
      default:
        keyframes = [
          'translateX(0)',
          `translateX(-${intensity})`,
          `translateX(${intensity})`,
          `translateX(-${intensity})`,
          `translateX(${intensity})`,
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

}

  function addTransition(el, property, durationMs, easing = 'ease') {
    const part = `${property} ${durationMs}ms ${easing}`;

  // pega transição atual (inline ou computada)
    const current = el.style.transition || getComputedStyle(el).transition || '';

  // se já contém o property, remove a entrada antiga
    const newCurrent = current
    .split(',')
    .map(s => s.trim())
    .filter(s => !s.startsWith(property))
    .filter(Boolean)
    .join(', ');

    el.style.transition = newCurrent ? `${part}, ${newCurrent}` : part;
  }

  
  function aplicaScrollReveal(selector, props) {
    const els = document.querySelectorAll(selector);
    if (!els.length) {
      console.warn('[CSScript] Nenhum elemento encontrado para ScrollReveal:', selector);
      return;
    }

    const duration = toMs(props.duration) || 1000;
    const distance = props.distance || '20%';
    const origin = props.origin || 'bottom';

    els.forEach(el => {
      let transform = '';
      switch (origin) {
        case 'left':
          transform = `translateX(-${distance})`;
        break;
        case 'right':
          transform = `translateX(${distance})`;
        break;
        case 'top':
          transform = `translateY(-${distance})`;
        break;
        default:
          transform = `translateY(${distance})`;
      }

    el.style.opacity = '0';
    el.style.transform = transform;
    el.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

    function revelar() {
      const rect = el.getBoundingClientRect();
      const visivel = rect.top < window.innerHeight && rect.bottom > 0;
      if (visivel) {
        el.style.opacity = '1';
        el.style.transform = 'translate(0, 0)';
        window.removeEventListener('scroll', revelar);
      }
    }

    window.addEventListener('scroll', revelar);
    revelar(); // já chama 1x se o elemento está visível
  });
  } 


  function parseAnimString(s) {
    // exemplo: fall(600ms) ou fall
    const m = s.match(/^([a-zA-Z0-9_-]+)\s*(?:\(([^)]*)\))?$/);
    if (!m) return { name: s, arg: null };
    return { name: m[1], arg: m[2] ? m[2].trim() : null };
  }

  /********** event mapping & binding **********/
  function mapEventName(jsEvent) {
    // jsEvent já em lower-case sem "on" (ex: "load", "click", "hover")
    if (!jsEvent) return null;
    if (jsEvent === 'hover') return 'mouseenter';
    return jsEvent;
  }

  function runActionOnElements(selector, action) {
    const els = document.querySelectorAll(selector);
    if (!els.length) {
      console.debug('[CSScript] nenhum elemento encontrado para selector:', selector);
      return;
    }

  // Suporta várias animações separadas por vírgula
    const anims = [];
    let current = '';
    let depth = 0;

    for (const char of action.value) {
      if (char === '(') depth++;
      else if (char === ')') depth--;
      if (char === ',' && depth === 0) {
        anims.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  
    if (current.trim()) anims.push(current.trim());

    for (const el of els) {
      for (const anim of anims) {
        const animInfo = parseAnimString(anim);
        const fn = animations[animInfo.name];

      // Verifica compatibilidade por tipo
        const propType = action.prop.toLowerCase();

        if (!fn) {
          console.warn(`[CSScript] animação desconhecida: ${animInfo.name}`);
          continue;
        }

      // Filtra por tipo de propriedade
        if (
          (propType === 'text' && ['fall', 'rise', 'slideIn', 'slideOut', 'fadeIn', 'fadeOut', 'pop', 'implode', 'shake'].includes(animInfo.name)) ||
          (propType === 'color' && ['paint', 'fadeColor', 'chameleonCamo', 'octopusCamo'].includes(animInfo.name)) ||
          (propType === 'background-color' && ['paint', 'fadeColor', 'chameleonCamo', 'octopusCamo'].includes(animInfo.name)) ||
          (propType === 'value' && ['searchValue'].includes(animInfo.name))
          //(propType === 'radius' && ['suddenChange'].includes(animInfo.name)) ||
          //(propType === 'gap' && ['bloomGap', 'stagedGapColumn', 'stagedGapRow'].includes(animInfo.name)) ||
          //(propType === 'weight' && ['skinny', 'heavy'].includes(animInfo.name)) 
        ) {
          fn(el, animInfo.arg);
        } else {
          console.warn(`[CSScript] animação '${animInfo.name}' não é compatível com a propriedade '${propType}'.`);
        }
      }
    }

    window.addEventListener('reveal.onScroll', (e) => {
      if (!e.detail.visible) return; // só dispara quando aparece

      const rules = cssRules['reveal.onScroll'];
      if (!rules) return;

      for (const { selector, actions } of rules) {
      runActionOnElements(selector, actions);
      }
    });
  }

  function attachHandlerForEvent(selector, rawEventName, actions) {
    // rawEventName: ex "window.onLoad" or "reveal.onScroll"
    const parts = rawEventName.split('.');
    let target = null, evt = rawEventName;
    if (parts.length === 2) {
      target = parts[0].trim();
      evt = parts[1].trim();
    }

    const jsEvent = evt.replace(/^on/i, '').toLowerCase();
    const handler = () => {
      for (const a of actions) {
        runActionOnElements(selector, a);
      }
    };


    // onSing.click event listener
    if (rawEventName.toLowerCase() === 'onsing.click') {
    const els = document.querySelectorAll(selector);
    if (!els.length) return console.warn('[CSScript] Nenhum elemento para onSing.click:', selector);

      els.forEach(el => {
        el.addEventListener('click', () => {
          for (const a of actions) {
            runActionOnElements(selector, a);
          }
          });
        });
    return;
    }

    // onDbl.click event listener
    if (rawEventName.toLowerCase() === 'ondbl.click') {
    const els = document.querySelectorAll(selector);
    if (!els.length) return console.warn('[CSScript] Nenhum elemento para onDbl.click:', selector);

      els.forEach(el => {
        el.addEventListener('dblclick', () => {
          for (const a of actions) {
            runActionOnElements(selector, a);
          }
          });
        });
    return;
    }

    // onHold.click event listener
    if (rawEventName.toLowerCase() === 'onhold.click') {
      const els = document.querySelectorAll(selector);
      if (!els.length) return console.warn('[CSScript] Nenhum elemento para onHold.click:', selector);

      const holdDuration = 500; // enough time to consider "hold" (ms).
      els.forEach(el => {
        let holdTimer;

        el.addEventListener('mousedown', () => {
          holdTimer = setTimeout(() => {
            for (const a of actions) {
              runActionOnElements(selector, a);
            }
          }, holdDuration);
        });

        el.addEventListener('mouseup', () => clearTimeout(holdTimer));
        el.addEventListener('mouseleave', () => clearTimeout(holdTimer));
      });
      return;
    }

    // window.onLoad event listener
    if (target && target.toLowerCase() === 'window') {
      window.addEventListener(jsEvent, handler);
      if (jsEvent === 'load' && document.readyState === 'complete') {
        log('window already loaded — executando handler imediatamente para', selector);
        handler();
      }
      return;
    }

    // DOMContent.onLoad event listener
    if (rawEventName === 'DOMContent.onLoad') {
      const handler = () => {
        for (const a of actions) {
          runActionOnElements(selector, a);
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handler);
      } else { handler(); }
      return;
    }

    // attach to elements (delegation not implemented — attach individually)
    const els = document.querySelectorAll(selector);
    if (!els || els.length === 0) {
      log('nenhum elemento encontrado para bind do evento:', selector, rawEventName);
      return;
    }
    const mapped = mapEventName(jsEvent);
    els.forEach(el => {
      el.addEventListener(mapped, handler);
    });

    if (rawEventName === 'reveal.onScroll') {
      const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
      if (entry.isIntersecting) {
        for (const a of actions) {
          runActionOnElements(selector, a);
        }
        // remove o observador após o primeiro disparo (ou comente se quiser repetir)
        obs.unobserve(entry.target);
      }
      });
    }, {
      threshold: 0.1 // 10% visível já ativa
    });

      const els = document.querySelectorAll(selector);
      els.forEach(el => observer.observe(el));

      console.debug(`[CSScript] Ativado reveal.onScroll para ${selector}`);
      return;
    }
  }

  function parseProperties(text) {
    const props = {};
    const regex = /([a-zA-Z0-9_-]+)\s*:\s*([^;]+);?/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      props[match[1].trim()] = match[2].trim();
    }
    return props;
  }

  /********** process code (blocks -> bind) **********/
  function processCSScriptCode(code) {
    try {
      const blocks = parseCSScript(code);
      blocks.forEach(b => {
        b.events.forEach(e => {
          attachHandlerForEvent(b.selector, e.name, e.actions);
        });
      });
    } catch (err) {
      console.error('[CSScript] erro ao parsear:', err);
    }
  }

  /********** loader: link[href$=".cssc"] via fetch (server) + inline <script type="text/cssc"> fallback **********/
  async function loadAll() {
    // primeiro: inline scripts
    document.querySelectorAll('script[type="text/cssc"]').forEach(s => {
      try {
        processCSScriptCode(s.textContent || s.innerText || '');
      } catch (e) {
        console.error('[CSScript] erro no inline cssc', e);
      }
    });

    // depois: links .cssc
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"][href$=".cssc"]'));
    for (const link of links) {
      const href = link.getAttribute('href');
      try {
        // resolve relative to page
        const base = new URL(href, location.href).href;
        const res = await fetch(base);
        if (!res.ok) {
          console.warn('[CSScript] fetch .cssc não ok:', res.status, href);
          continue;
        }
        const text = await res.text();
        processCSScriptCode(text);
      } catch (err) {
        console.error('[CSScript] falha ao carregar .cssc (CORS ou caminho):', href, err);
      }
    }
  }

  // inicializa assim que o DOM estiver pronto (e garante execução se já carregado)
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', loadAll);
  } else {
    // já carregado
    setTimeout(loadAll, 0);
  }

  // expõe para debug
  window.CSScriptRuntime = { parseCSScript, processCSScriptCode, loadAll };
})();


