/* csscript.js
   Runtime simples e resiliente para CSScript (.cssc)
   - lê <link rel="stylesheet" href="... .cssc"> via fetch (requer servidor)
   - ou lê <script type="text/cssc"> inline (sem CORS)
   - suporta eventos em bloco:
       #id { window.onLoad { text: fall(600ms); }; }
   - animação built-in: fall(duration) e fadeIn(duration)
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
  }

  const animations = {
    fall: (el, arg) => {
      const duration = toMs(arg);
    // começa acima e vem para o lugar
      animateFrom(el, 'translateY(-30px)', duration);
    },

    rise: (el, arg) => {
      const duration = toMs(arg);
    // começa abaixo e sobe para o lugar
      animateFrom(el, 'translateY(30px)', duration);
    },

    fadeIn: (el, arg) => {
      const duration = toMs(arg);
    // fade simples
      el.style.transition = 'none';
      el.style.opacity = '0';
      void el.offsetWidth;
      el.style.transition = `opacity ${duration}ms ease`;
      requestAnimationFrame(() => (el.style.opacity = '1'));
    }
  };

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
    if (!els || els.length === 0) {
      log('nenhum elemento encontrado para selector:', selector);
      return;
    }
    const animInfo = parseAnimString(action.value);
    for (const el of els) {
      const fn = animations[animInfo.name];
      if (fn) fn(el, animInfo.arg);
      else console.warn(`[CSScript] animação desconhecida: ${animInfo.name}`);
    }
  }

  function attachHandlerForEvent(selector, rawEventName, actions) {
    // rawEventName: ex "window.onLoad" or "onClick"
    const parts = rawEventName.split('.');
    let target = null, evt = rawEventName;
    if (parts.length === 2) {
      target = parts[0].trim();
      evt = parts[1].trim();
    }

    if (rawEventName === 'ScrollReveal') {
      // Concatena todas as ações em texto bruto (para parsear como props)
      const rawProps = actions.map(a => `${a.prop}: ${a.value};`).join("\n");
      const props = parseProperties(rawProps);
      aplicaScrollReveal(selector, props);
      return;
    }

    const jsEvent = evt.replace(/^on/i, '').toLowerCase();
    const handler = () => {
      for (const a of actions) {
        runActionOnElements(selector, a);
      }
    };

    if (target && target.toLowerCase() === 'window') {
      // attach to window
      window.addEventListener(jsEvent, handler);
      // se já carregou, executa imediatamente (para 'load' e similares)
      if (jsEvent === 'load' && document.readyState === 'complete') {
        log('window already loaded — executando handler imediatamente para', selector);
        handler();
      }
      return;
    }

    // if event is load but no window specified, attach to window
    if (!target && jsEvent === 'load') {
      window.addEventListener('load', handler);
      if (document.readyState === 'complete') handler();
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
