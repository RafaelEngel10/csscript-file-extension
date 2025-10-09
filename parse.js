async function loadCSScript(path) {
  const text = await fetch(path).then(r => r.text());
  const blocks = text.matchAll(/([\w.#-]+)\s*\{([^}]*)\}/g);
  
  for (const [, selector, content] of blocks) {
    const events = [...content.matchAll(/([\w.]+)\s*\(([^)]*)\)/g)];
    
    for (const [, eventName, body] of events) {
      const actions = [...body.matchAll(/([\w-]+)\s*:\s*([\w-]+)/g)];
      bindCSScript(selector, eventName, actions);
    }
  }
}

function parseProperties(text) {
  const props = {};
  const lines = text.split(";").map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const [key, value] = line.split(":").map(s => s.trim());
    if (key && value) props[key] = value;
  }
  return props;
}


function bindCSScript(selector, eventName, actions) {
  const elements = document.querySelectorAll(selector);
  const [target, evt] = eventName.split('.');
  
  for (const el of elements) {
    const handler = () => {
      for (const [_, prop, anim] of actions) {
        runAnimation(el, prop, anim);
      }
    };

    if (target === 'window' && evt === 'onLoad') {
      window.addEventListener('load', handler);
    } else if (evt) {
      window.addEventListener(evt.replace('on', '').toLowerCase(), handler);
    } else {
      el.addEventListener(target.replace('on', '').toLowerCase(), handler);
    }
  }
}

function runAnimation(el, prop, anim) {
  const animations = {
    fadeIn: () => {
      el.style.opacity = 0;
      el.style.transition = 'opacity 1s';
      setTimeout(() => (el.style.opacity = 1), 50);
    },
    fall: () => {
      el.style.transform = 'translateY(-50px)';
      el.style.opacity = 0;
      el.style.transition = 'all 0.8s';
      setTimeout(() => {
        el.style.transform = 'translateY(0)';
        el.style.opacity = 1;
      }, 50);
    },
    rise: () => {
      el.style.transform = 'translateY(50px)';
      el.style.opacity = 0;
      el.style.transition = 'all 0.8s';
      setTimeout(() => {
        el.style.transform = 'translateY(0)';
        el.style.opacity = 1;
      }, 50);
    },
    rotate: () => {
      el.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 1000 });
    },
    scale: () => {
      el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }], { duration: 500 });
    }
  };
  if (animations[anim]) animations[anim](el);
}
