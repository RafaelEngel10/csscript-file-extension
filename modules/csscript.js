/* csscript.js
   Runtime simples e resiliente para CSScript (.cssc)
   - <link rel="stylesheet" href="... .cssc"> fetch only (host server needed)
   - <script type="text/cssc"> inline (without CORS)
   - support for event blocks:
    #id { window.onLoad { text: fall(600ms); }; }
*/

import { attachHandlerForEvent } from "./handler.js";
import { runActionOnElements } from "./app/runActionOnElements.js";
import { removeComments, toMs, ensureInlineBlockIfNeeded, parseAnimString,  mapEventName, parseProperties } from "./basics.js"

(function () {
  'use strict';

  /********** util helpers **********/
  const log = (...args) => console.debug('[CSScript]', ...args);

  const animationStates = new WeakMap();

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
  
  attachHandlerForEvent();
  
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

  function parseColor(input) {
    const ctx = document.createElement("canvas").getContext("2d");

    // remove espaços e deixa minúsculo
    let color = input.trim().toLowerCase();

    // ----------------------------
    // 1️⃣ HEX (#RGB ou #RRGGBB)
    // ----------------------------
    if (color.startsWith("#")) {
      // normaliza #RGB → #RRGGBB
      if (color.length === 4) {
        color =
          "#" +
          color
            .slice(1)
            .split("")
            .map((c) => c + c)
            .join("");
      }
      const numeric = parseInt(color.slice(1), 16);
      return {
        type: "hex",
        original: input,
        normalized: color.toUpperCase(),
        numeric,
      };
    }

    // ----------------------------
    // 2️⃣ RGB ou RGBA
    // ----------------------------
    if (color.startsWith("rgb")) {
      const match = color.match(/\d+(\.\d+)?/g);
      if (!match) return null;
      const [r, g, b] = match.map(Number);
      const numeric = (r << 16) + (g << 8) + b;
      return {
        type: color.startsWith("rgba") ? "rgba" : "rgb",
        original: input,
        normalized: `rgb(${r}, ${g}, ${b})`,
        numeric,
      };
    }

    // ----------------------------
    // 3️⃣ Nome de cor CSS (ex: red, blue, orange)
    // ----------------------------
    try {
      ctx.fillStyle = color;
      const computed = ctx.fillStyle; // o navegador converte o nome pra rgb() ou hex
      if (computed.startsWith("#")) {
        return parseColor(computed); // chama de novo pra padronizar
      }
      if (computed.startsWith("rgb")) {
        return parseColor(computed);
      }
    } catch (e) {
      return null;
    }

    // ----------------------------
    // ❌ Caso não reconheça
    // ----------------------------
    return null;
  }


  /********** loader: link[href$=".cssc"] via fetch (server) + inline <script type="modules"> fallback **********/
  async function loadAll() {
    // primeiro: inline scripts
    document.querySelectorAll('script[type="modules"]').forEach(s => {
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
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }

  // expõe para debug
  window.CSScriptRuntime = { parseCSScript, processCSScriptCode, loadAll };
})();


