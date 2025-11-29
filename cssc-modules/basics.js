export function removeComments(s) {
    // remove /* ... */ e // ... até EOL
    return s
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
}

export function toMs(value) {
    if (!value) return 600;
    value = value.trim();
    if (value.endsWith('ms')) return parseFloat(value);
    if (value.endsWith('s')) return parseFloat(value) * 1000;
    // se só número, assume ms
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 600;
}

export function ensureInlineBlockIfNeeded(el) {
    const style = window.getComputedStyle(el);
    if (style.display === 'inline') {
      el.style.display = 'inline-block';
    }
}

export function parseAnimString(s) {
    // exemplo: fall(600ms) ou fall
    const m = s.match(/^([a-zA-Z0-9_-]+)\s*(?:\(([^)]*)\))?$/);
    if (!m) return { name: s, arg: null };
    return { name: m[1], arg: m[2] ? m[2].trim() : null };
}

  /********** event mapping & binding **********/
export function mapEventName(jsEvent) {
    // jsEvent já em lower-case sem "on" (ex: "load", "click", "hover")
    if (!jsEvent) return null;
    if (jsEvent === 'hover') return 'mouseenter';
    return jsEvent;
}

export function parseProperties(text) {
    const props = {};
    const regex = /([a-zA-Z0-9_-]+)\s*:\s*([^;]+);?/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      props[match[1].trim()] = match[2].trim();
    }
    return props;
}